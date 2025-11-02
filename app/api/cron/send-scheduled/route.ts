// app/api/cron/send-scheduled/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Your Prisma client
import { Twilio } from "twilio";

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// We must check for all env vars
if (!accountSid || !authToken || !twilioPhone) {
  console.error("Cron Job: Missing Twilio credentials");
}
const client = new Twilio(accountSid, authToken);

export async function GET() {
  try {
    // 1. Find all messages that are 'QUEUED' and past their scheduled time
    const messagesToSend = await prisma.message.findMany({
      where: {
        status: "QUEUED",
        scheduledAt: {
          lte: new Date(), // less than or equal to the current time
        },
      },
      include: {
        // We need the contact's phone number to send the message
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

    // 2. Loop through and send each message
    const sendPromises = messagesToSend.map((msg) => {
      return client.messages.create({
        body: msg.content,
        from: twilioPhone,
        to: msg.conversation.contact.phone!,
      });
    });

    await Promise.all(sendPromises);

    // 3. Update the messages in the database to 'SENT'
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