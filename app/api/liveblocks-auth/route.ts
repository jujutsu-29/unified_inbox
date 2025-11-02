// app/api/liveblocks-auth/route.ts

import { NextResponse } from "next/server";
import { Liveblocks } from "@liveblocks/node";
import { auth } from "@/lib/auth";  
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";  


const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
  try {
    
    const sessionUser = await auth.api.getSession({ headers: await headers() });
    if (!sessionUser?.user?.id) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    // 2. Get the user's info from your database
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.user.id },
      select: { id: true, name: true, email: true, teamId: true },
    });

    if (!user || !user.teamId) {
      return new NextResponse("User or team not found", { status: 403 });
    }

   
    const session = liveblocks.prepareSession(
      user.id, 
      {
        userInfo: {  
          name: user.name || user.email!,
        },
      }
    );
    
    session.allow(user.teamId, session.FULL_ACCESS);

    
    const { status, body } = await session.authorize();
    
    return new NextResponse(body, { status });

  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}