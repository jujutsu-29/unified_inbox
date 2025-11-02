"use client";
import { signIn, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginButton() {
  const router = useRouter();
  const { data: session, isPending, error } = useSession();

  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/"); // or "/" whichever
    }
  }, [session, isPending, router]);

  const handleLogin = async () => {
    const res = await signIn.social({
      provider: "google",
      callbackURL: "/"
    });
    if (res.error) {
      console.error("Login error:", res.error);
      return;
    }
    router.push("/");
  };

  if (isPending) {
    return <div>Loading…</div>;
  }

  return <button onClick={handleLogin}>Sign in with Google</button>;
}
