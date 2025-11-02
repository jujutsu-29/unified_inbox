// app/api/conversations/[conversationId]/messages/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    // 1. Authenticate the user
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    // 2. Find the user's teamId
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.teamId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // 3. Fetch all messages for the selected conversation
    const messages = await prisma.message.findMany({
      where: {
        conversationId: params.conversationId,
        // SECURITY CHECK: Ensure this conversation belongs to the user's team
        conversation: {
          teamId: user.teamId,
        },
      },
      include: {
        author: { // Get the "sender" (App User) name
          select: { name: true }
        },
        conversation: { // Get the "contact" name
          include: { contact: { select: { name: true }}}
        }
      },
      orderBy: {
        createdAt: "asc", // Show oldest messages first
      },
    });

    // 4. Format the data to match your UI
    const formattedMessages = messages.map((msg) => {
      const isOutbound = msg.direction === "OUTBOUND";
      return {
        id: msg.id,
        text: msg.content,
        time: msg.createdAt.toLocaleTimeString(),
        isOutbound: isOutbound,
        sender: isOutbound ? (msg.author?.name || "You") : (msg.conversation.contact.name || "Contact"),
      };
    });

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("[GET_MESSAGES_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}