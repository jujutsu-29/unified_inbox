import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";  
import { auth } from "@/lib/auth";  
import { headers } from "next/headers";
import { format } from "date-fns";

// Helper for the Pie Chart colors
const CHANNEL_COLORS: { [key: string]: string } = {
  SMS: "#3B82F6",
  WHATSAPP: "#10B981",
  EMAIL: "#8B5CF6",
  TWITTER_DM: "#0EA5E9",
  FACEBOOK_MESSENGER: "#0E7490",
};

export async function GET() {
  try {
    // 1. Authenticate and get the user's teamId
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return new NextResponse("Not authenticated", { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.teamId) {
      return new NextResponse("User or team not found", { status: 403 });
    }
    const teamId = user.teamId;

    // --- 2. Calculate KPI Cards ---
    const totalMessages = await prisma.message.count({
      where: { conversation: { teamId: teamId } },
    });
    const totalContacts = await prisma.contact.count({
      where: { teamId: teamId },
    });

    // --- 3. Calculate "Messages Over Time" (Line Chart) ---
    const messages = await prisma.message.findMany({
      where: { conversation: { teamId: teamId } },
      select: { createdAt: true, direction: true },
      orderBy: { createdAt: "asc" },
    });

    const messagesByDay = messages.reduce(
      (acc: { [key: string]: any }, msg) => {
        const day = format(msg.createdAt, "yyyy-MM-dd");
        if (!acc[day]) {
          acc[day] = {
            day: format(msg.createdAt, "MMM d"),
            sent: 0,
            received: 0,
          };
        }
        if (msg.direction === "OUTBOUND") acc[day].sent++;
        if (msg.direction === "INBOUND") acc[day].received++;
        return acc;
      },
      {}
    );
    const messageData = Object.values(messagesByDay);

    // --- 4. Calculate "Channel Distribution" (Pie Chart) ---
    const channelCounts = await prisma.message.groupBy({
      by: ["channel"],
      where: { conversation: { teamId: teamId } },
      _count: { id: true },
    });
    const totalMessagesForPie = channelCounts.reduce((acc, c) => acc + c._count.id, 0);
    const channelData = channelCounts.map((c) => ({
      name: c.channel,
      value: Math.round((c._count.id / totalMessagesForPie) * 100), // As a percentage
      color: CHANNEL_COLORS[c.channel] || "#6B7280", // Get color or fallback
    }));

    // --- 5. Calculate "Top Contacts" (List) ---
    const topConversations = await prisma.conversation.findMany({
      where: { teamId: teamId },
      include: {
        contact: { select: { name: true } },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: {
        messages: {
          _count: "desc",
        },
      },
      take: 5,
    });
    const topContacts = topConversations.map((c) => ({
      id: c.contactId,
      name: c.contact.name || "Unknown",
      messages: c._count.messages,
    }));

    // --- 6. Send all data back to the client ---
    return NextResponse.json({
      kpis: {
        totalMessages,
        totalContacts,
      },
      messageData,
      channelData,
      topContacts,
    });
  } catch (error) {
    console.error("[ANALYTICS_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}