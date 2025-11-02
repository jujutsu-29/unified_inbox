import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma"; // Assuming your Prisma client is in 'lib/db.ts'

export async function POST(request: NextRequest) {
  try {
    // 1. Twilio sends data as 'x-www-form-urlencoded', not JSON.
    // We need to parse the form data.
    const formData = await request.formData();
    const from = formData.get("From") as string;
    const body = formData.get("Body") as string;
    const messageSid = formData.get("MessageSid") as string; // Twilio's message ID

    if (!from || !body || !messageSid) {
      return new Response("Missing required form data", { status: 400 });
    }

    // 2. Find the Contact by their phone number
    // We are assuming the contact was already created in the app by a user.
    // This is a good simplification for the assignment.
    // Use findFirst because 'phone' is not a unique field in the Prisma schema.
    const contact = await prisma.contact.findFirst({
      where: { phone: from },
    });

    // 3. If the contact doesn't exist, we can't save the message.
    if (!contact) {
      console.warn(`Webhook received from unknown number: ${from}`);
      // Respond 200 OK so Twilio stops retrying, but we don't process it.
      return new Response("Contact not found", { status: 200 });
    }

    // 4. Find the conversation thread for this contact
    // Your schema has a 1-to-1 link from Contact -> Conversation
    const conversation = await prisma.conversation.findUnique({
      where: { contactId: contact.id },
    });

    if (!conversation) {
      console.error(`Contact ${contact.id} is missing a conversation.`);
      return new Response("Conversation not found", { status: 500 });
    }

    // 5. Save the new INBOUND message to your database
    await prisma.message.create({
      data: {
        content: body,
        channel: "SMS", // You can check 'To' number to see if it's WhatsApp
        direction: "INBOUND",
        status: "DELIVERED",
        externalSid: messageSid,
        conversationId: conversation.id,
        // 'authorId' is null because it's from the contact
      },
    });

    // 6. Respond 200 OK to Twilio
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error handling Twilio webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}