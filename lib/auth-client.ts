import { createAuthClient } from "better-auth/react";
import type { auth } from "@/lib/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [
        inferAdditionalFields<typeof auth>({
            user: {
                teamId: {
                    type: "string"
                }
            }
        })
    ]
});

// const signIn = async () => {
//   const data = await authClient.signIn.social({
//     provider: "google",
//   });
// };

export const { signIn, signOut, useSession } = authClient;