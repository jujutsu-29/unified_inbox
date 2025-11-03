"use client";
import Loading from "@/components/loading";
import { signIn, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

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
    return <div><Loading /></div>;
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to access your unified inbox.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogin} variant="outline" className="w-full gap-2 bg-transparent">
            <Mail className="h-4 w-4" />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

