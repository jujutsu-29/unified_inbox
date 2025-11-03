"use server";

import { Twilio } from "twilio";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const client = new Twilio(accountSid, authToken);

/**
 * Zod schema for validating new contact form data.
 */
const messageSchema = z.object({
    body: z.string().min(1, "Message cannot be empty"),
    contactPhone: z.string(),
    conversationId: z.string(),
});

/**
 * Server Action to send an SMS message immediately via Twilio.
 *
 * This function performs the following steps:
 * 1. Authenticates the user and performs an RBAC check.
 * 2. Validates the incoming form data.
 * 3. Calls the Twilio API to send the SMS.
 * 4. If successful, creates a new `Message` in the local database with `status: 'SENT'`.
 * 5. Revalidates the `/inbox` path to update the UI.
 *
 * @param formData The FormData object from the client, expecting `body`, `contactPhone`, and `conversationId`.
 * @returns A promise resolving to an object with `success: true` and the `messageSid`,
 * or `success: false` with an error message.
 */
export async function sendMessage(formData: FormData) {
    try {

        const session = await auth.api.getSession({
            headers: await headers()
        })
        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }
        
        if (session.user.role === 'VIEWER') {
            return { success: false, error: "Not authorized to send messages" };
        }

        const authorId = session.user.id;
        const validated = messageSchema.safeParse({
            body: formData.get("body"),
            contactPhone: formData.get("contactPhone"),
            conversationId: formData.get("conversationId"),
        });

        if (!validated.success) {
            throw new Error("Invalid input");
        }

        const { body, contactPhone, conversationId } = validated.data;

        const twilioResponse = await client.messages.create({
            body: body,
            from: twilioPhone,
            to: contactPhone, // Send to the customer
        });

        await prisma.message.create({
            data: {
                content: body,
                channel: "SMS",
                direction: "OUTBOUND",
                status: "SENT",
                externalSid: twilioResponse.sid,
                conversationId: conversationId,
                authorId: authorId,
            },
        });

        revalidatePath(`/inbox`);
        return { success: true, messageSid: twilioResponse.sid };

    } catch (error) {
        console.error("Failed to send message:", error);
        return { success: false, error: "Failed to send message" };
    }
}