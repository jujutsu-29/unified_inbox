"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma"; 
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Schema to validate the form
const noteSchema = z.object({
  content: z.string().min(1, "Note cannot be empty"),
  contactId: z.string(),
  visibility: z.enum(['TEAM', 'PRIVATE']),
});

export async function createNote(formData: FormData) {
  try {

    console.log("Creating note with formData:", formData);
    // 1. Get user and team
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id || !session.user.teamId) {
      return { success: false, error: "Not authenticated or no team found" };
    }
    const { id: authorId, teamId, role } = session.user;

    // 2. Check Role (RBAC)
    if (role === 'VIEWER') {
        return { success: false, error: "Not authorized to create notes" };
    }

    // 3. Validate form data
    const validated = noteSchema.safeParse({
      content: formData.get("content"),
      contactId: formData.get("contactId"),
      visibility: formData.get("visibility"),
    });

    if (!validated.success) {
      return { success: false, error: "Invalid input" };
    }
    const { content, contactId, visibility } = validated.data;

    // 4. Security Check: Ensure this contact belongs to the user's team
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        teamId: teamId,
      },
    });

    console.log("Contact found for note:", contact);

    if (!contact) {
      return { success: false, error: "Contact not found or not authorized" };
    }

    // 5. Create the note
    await prisma.note.create({
      data: {
        content: content,
        contactId: contactId,
        visibility: visibility,
        authorId: authorId,
      },
    });

    console.log("Note created successfully");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create note:", error);
    return { success: false, error: "Failed to create note" };
  }
}