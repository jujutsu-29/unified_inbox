"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Zod schema for validating new contact form data.
 */
const scheduleSchema = z.object({
    body: z.string().min(1, "Message cannot be empty"),
    conversationId: z.string(),
    scheduledAt: z.coerce.date(), // 'coerce' will convert the string from FormData into a Date
});

/**
 * Server Action to save a message to be sent in the future.
 *
 * This function does NOT send a message. It simply:
 * 1. Authenticates the user and performs an RBAC check.
 * 2. Validates the form data.
 * 3. Creates a new `Message` in the database with `status: 'QUEUED'`.
 * 4. The message will be processed later by the `/api/cron/send-scheduled` route.
 * 5. Revalidates the `/inbox` path to show the optimistically-updated UI.
 *
 * @param formData The FormData object from the client, expecting `body`, `conversationId`,
 * and an ISO date string for `scheduledAt`.
 * @returns A promise resolving to an object with `success: true` or `success: false` with an error message.
 */
export async function scheduleMessage(formData: FormData) {
    try {
        console.log("Scheduling message...");
        // 1. Get user
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        if (session.user.role === 'VIEWER') {
            return { success: false, error: "Not authorized to send messages" };
        }
        // 2. Validate data
        const validated = scheduleSchema.safeParse({
            body: formData.get("body"),
            conversationId: formData.get("conversationId"),
            scheduledAt: formData.get("scheduledAt"), // e.g., "2025-11-03T10:00:00Z"
        });

        console.log("Validated data:", validated);
        if (!validated.success) {
            console.error("Invalid input:", validated.error);
            return { success: false, error: "Invalid input" };
        }

        const { body, conversationId, scheduledAt } = validated.data;

        // 3. Save to database with 'QUEUED' status
        const res = await prisma.message.create({
            data: {
                content: body,
                channel: "SMS",
                direction: "OUTBOUND",
                status: "QUEUED", // <-- The key difference
                scheduledAt: scheduledAt, // <-- The scheduled time
                conversationId: conversationId,
                authorId: session.user.id,
            },
        });

        console.log("Message scheduled:", res);
        console.log("revalidating inbox...");

        revalidatePath("/inbox"); // Refresh the inbox
        return { success: true };

    } catch (error: any) {
        console.error("Failed to schedule message:", error);
        return { success: false, error: "Failed to schedule message" };
    }
}