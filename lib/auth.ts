import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { nextCookies } from "better-auth/next-js";
import { customSession } from "better-auth/plugins";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            accessType: "offline",
            prompt: "select_account consent",
        },
    },
    plugins: [nextCookies(),
    customSession(async ({ user, session }) => {
        if (!user) {
            return { user, session };
        }
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { teamId: true, role: true },
        });
        return {
            session,
            user: {
                ...user,
                teamId: dbUser?.teamId || null,
                role: dbUser?.role || "VIEWER",
            },
        };
    }),
    ],
    user: {
        additionalFields: {
            teamId: {
                type: "string",
                required: false,
                defaultValue: null,
                input: false  
            },
            role: {
                type: "string",
                required: false,
                defaultValue: "VIEWER",  
                input: false,
            },
        }
    },
});