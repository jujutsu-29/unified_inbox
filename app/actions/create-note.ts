"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma"; 
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Zod schema for validating new contact form data.
 */
const noteSchema = z.object({
  content: z.string().min(1, "Note cannot be empty"),
  contactId: z.string(),
  visibility: z.enum(['TEAM', 'PRIVATE']),
});

/**
 * Server Action to create a new internal note for a contact.
 *
 * This function performs the following steps:
 * 1. Authenticates the user and gets their `teamId` and `role`.
 * 2. Performs an RBAC check (Viewers are rejected).
 * 3. Validates the incoming form data.
 * 4. **Security Check**: Verifies the `contactId` belongs to the user's `teamId`.
 * This prevents a user from adding notes to another team's contacts.
 * 5. Creates the new `Note` in the database, linked to the contact and author.
 *
 * @param formData The FormData object from the client, expecting `content`, `contactId`, and `visibility`.
 * @returns A promise resolving to an object with `success: true` or `success: false` with an error message.
 */
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