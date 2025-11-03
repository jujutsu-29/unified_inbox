// app/actions/create-contact.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma"; // Use your prisma client
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Zod schema for validating new contact form data.
 */
const contactSchema = z.object({
    name: z.string().min(2, "Name is required"),
    phone: z.string().min(10, "A valid phone number is required"),
});

/**
 * Server Action to create a new contact and its associated conversation.
 *
 * This function performs the following steps:
 * 1. Authenticates the user and performs an RBAC check (Viewers are rejected).
 * 2. Validates the incoming form data against `contactSchema`.
 * 3. Fetches the user from the database to check their `teamId`.
 * 4. **Crucial Logic**: If the user has no `teamId` (i.e., they are a new user),
 * it creates a new "personal team" for them and links it.
 * 5. Creates the new `Contact` and a blank `Conversation` in a single
 * Prisma transaction, ensuring both are linked to the user's team.
 * 6. Revalidates the `/inbox` path to update the UI.
 *
 * @param formData The FormData object from the client, expecting `name` and `phone`.
 * @returns A promise resolving to an object with `success: true` and the new contact,
 * or `success: false` with an error message.
 */
export async function createContact(formData: FormData) {
    try {
        // 1. Get the authenticated user
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        if (session.user.role === 'VIEWER') {
            return { success: false, error: "Not authorized to send messages" };
        }
        const userId = session.user.id;

        // 2. Validate the form data
        const validated = contactSchema.safeParse({
            name: formData.get("name"),
            phone: formData.get("phone"),
        });

        if (!validated.success) {
            return { success: false, error: "Invalid input" };
        }
        const { name, phone } = validated.data;

        // 3. --- THIS IS THE NEW LOGIC ---
        // Find the user and their teamId from the database
        let user = await prisma.user.findUnique({
            where: { id: userId },
            select: { teamId: true, name: true } // Select only what we need
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        let currentTeamId = user.teamId;

        // 4. If user has no team, create one for them!
        if (!currentTeamId) {
            const newTeam = await prisma.team.create({
                data: {
                    name: `${user.name || 'My'}'s Team`,
                    // Add the user to this new team
                    users: {
                        connect: { id: userId }
                    }
                }
            });
            currentTeamId = newTeam.id;
        }
        // --- END OF NEW LOGIC ---

        // 5. Create the Contact AND the Conversation
        const newContact = await prisma.contact.create({
            data: {
                name: name,
                phone: phone,
                teamId: currentTeamId, // Use the new or existing team ID
                conversation: {
                    create: {
                        teamId: currentTeamId,
                        assigneeId: userId,
                    },
                },
            },
        });

        // 6. Refresh the inbox page
        revalidatePath("/inbox"); // Or just "/"
        return { success: true, contact: newContact };

    } catch (error: any) {
        if (error.code === 'P2002') {
            return { success: false, error: "A contact with this phone number already exists in your team." };
        }
        console.error("Failed to create contact:", error);
        return { success: false, error: "Failed to create contact" };
    }
}