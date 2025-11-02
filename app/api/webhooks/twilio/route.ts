import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { liveblocks } from "@/lib/liveblocks-server";

export async function POST(request: NextRequest) {
  try {
    // Twilio sends data as 'x-www-form-urlencoded', not JSON.
    // We need to parse the form data.
    const formData = await request.formData();
    const from = formData.get("From") as string;
    const body = formData.get("Body") as string;
    const messageSid = formData.get("MessageSid") as string; 

    if (!from || !body || !messageSid) {
      return new Response("Missing required form data", { status: 400 });
    }

    const contact = await prisma.contact.findFirst({
      where: { phone: from },
    });

    if (!contact) {
      console.warn(`Webhook received from unknown number: ${from}`);
      return new Response("Contact not found", { status: 200 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { contactId: contact.id },
    });

    if (!conversation) {
      console.error(`Contact ${contact.id} is missing a conversation.`);
      return new Response("Conversation not found", { status: 500 });
    }

    await prisma.message.create({
      data: {
        content: body,
        channel: "SMS",  
        direction: "INBOUND",
        status: "DELIVERED",
        externalSid: messageSid,
        conversationId: conversation.id,
      },
    });

    if (contact.teamId) {
    await liveblocks.broadcastEvent(contact.teamId, { type: "refetch-data" });
  }
  
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error handling Twilio webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}