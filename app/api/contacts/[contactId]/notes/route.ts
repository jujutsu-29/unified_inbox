import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  try {
    // 1. Authenticate the user
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return new NextResponse("Not authenticated", { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.teamId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

     const { contactId } = await params;

    // 2. Fetch notes, with security check
    const notes = await prisma.note.findMany({
      where: {
        contactId: contactId,
        contact: {
          teamId: user.teamId,
        },

        OR: [
          { visibility: 'TEAM' }, // Show all 'TEAM' notes
          {
            visibility: 'PRIVATE',
            authorId: user.id, // OR, show 'PRIVATE' notes *only if* I am the author
          },
        ],
      },
      include: {
        author: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    // You can format this data as well, or just return it
    return NextResponse.json(notes);

  } catch (error) {
    console.error("[GET_NOTES_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}