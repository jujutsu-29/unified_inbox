// app/api/conversations/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"; // Your Better Auth config
import { headers } from "next/headers";

export async function GET() {
  try {
    // 1. Authenticate the user
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    // 2. Find the user's teamId
    // (This uses the "auto-create team" logic)
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.teamId) {
      // If user has no team, they have no conversations
      return NextResponse.json([]);
    }

    // 3. Fetch all conversations for that team
    const conversations = await prisma.conversation.findMany({
      where: { teamId: user.teamId },
      include: {
        // Get the related contact info (name, phone, etc.)
        contact: true,
        // Get just the 1 most recent message
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        // Optional: sort conversations by most recent message
        // This is a bit more complex and might require sorting on the client
      },
    });

    // 4. Format the data to match your UI's needs
    const formattedConversations = conversations.map((convo) => {
      const lastMessage = convo.messages[0];
      return {
        id: convo.id,
        name: convo.contact.name,
        phone: convo.contact.phone,
        email: convo.contact.email,
        avatar: convo.contact.name?.charAt(0).toUpperCase() || "C",
        channel: lastMessage?.channel || "SMS", // Default to SMS
        channelColor: "bg-green-100 text-green-800", // TODO: make dynamic
        lastMessage: lastMessage?.content || "No messages yet",
        timestamp: lastMessage?.createdAt.toLocaleTimeString() || "",
        contactId: convo.contact.id, // --- IMPORTANT for fetching history/notes
      };
    });

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error("[GET_CONVERSATIONS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}