"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// Schema to validate the form
const scheduleSchema = z.object({
  body: z.string().min(1, "Message cannot be empty"),
  conversationId: z.string(),
  scheduledAt: z.coerce.date(), // 'coerce' will convert the string from FormData into a Date
});

export async function scheduleMessage(formData: FormData) {
  try {
    console.log("Scheduling message...");
    // 1. Get user
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
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