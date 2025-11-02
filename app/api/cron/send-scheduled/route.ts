import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Twilio } from "twilio";
import { liveblocks } from "@/lib/liveblocks-server";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhone) {
    console.error("Cron Job: Missing Twilio credentials");
}
const client = new Twilio(accountSid, authToken);

export async function GET() {
    try {
        const messagesToSend = await prisma.message.findMany({
            where: {
                status: "QUEUED",
                scheduledAt: {
                    lte: new Date(),
                },
            },
            include: {
                conversation: {
                    include: {
                        contact: {
                            select: { phone: true },
                        },
                    },
                },
            },
        });

        if (messagesToSend.length === 0) {
            return NextResponse.json({ success: true, message: "No messages to send" });
        }

        console.log(`Cron Job: Found ${messagesToSend.length} messages to send.`);

        const sendPromises = messagesToSend.map((msg) => {
            return client.messages.create({
                body: msg.content,
                from: twilioPhone,
                to: msg.conversation.contact.phone!,
            });
        });

        await Promise.all(sendPromises);

        const teamIds = [
            ...new Set(messagesToSend.map((msg) => msg.conversation.teamId)),
        ];
        const broadcastPromises = teamIds.map((teamId) => {
            return liveblocks.broadcastEvent(teamId, { type: "refetch-data" });
        });
        await Promise.all(broadcastPromises);

        await prisma.message.updateMany({
            where: {
                id: {
                    in: messagesToSend.map((msg) => msg.id),
                },
            },
            data: {
                status: "SENT",
            },
        });

        return NextResponse.json({
            success: true,
            message: `Sent ${messagesToSend.length} messages`,
        });

    } catch (error: any) {
        console.error("Cron Job Error:", error);
        return new NextResponse(error.message || "Internal Server Error", { status: 500 });
    }
}