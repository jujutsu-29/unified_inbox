// // app/actions/create-contact.ts
// "use server";

// import { z } from "zod";
// import { prisma } from "@/lib/prisma";
// import { auth } from "@/lib/auth";
// import { headers } from "next/headers";
// import { revalidatePath } from "next/cache";

// // Schema to validate the form
// const contactSchema = z.object({
//   name: z.string().min(2, "Name is required"),
//   phone: z.string().min(10, "A valid phone number is required"),
// });

// export async function createContact(formData: FormData) {
//   try {
//     // 1. Get the authenticated user
//     const session = await auth.api.getSession({ headers: await headers() });
//     if (!session?.user?.id || !session.user.teamId) {
//       // Assuming user has a teamId. Adjust as needed.
//       return { success: false, error: "Not authenticated or no team found" };
//     }
//     const { teamId } = session.user;

//     // 2. Validate the form data
//     const validated = contactSchema.safeParse({
//       name: formData.get("name"),
//       phone: formData.get("phone"),
//     });

//     if (!validated.success) {
//       return { success: false, error: "Invalid input" };
//     }
//     const { name, phone } = validated.data;

//     // 3. Create the Contact AND the Conversation
//     // We use a transaction to ensure both are created or neither are
//     const newContact = await prisma.contact.create({
//       data: {
//         name: name,
//         phone: phone, // Make sure this is in E.164 format, e.g., +919262348758
//         teamId: teamId,
//         // AND create the related conversation at the same time
//         conversation: {
//           create: {
//             teamId: teamId,
//             // You can assign it to the creator
//             assigneeId: session.user.id, 
//           },
//         },
//       },
//     });

//     // 4. Refresh the inbox page to show the new contact
//     revalidatePath("/inbox");
//     return { success: true, contact: newContact };

//   } catch (error: any) {
//     // Handle specific error if phone number is already used in this team
//     if (error.code === 'P2002') {
//         return { success: false, error: "A contact with this phone number already exists." };
//     }
//     console.error("Failed to create contact:", error);
//     return { success: false, error: "Failed to create contact" };
//   }
// }