"use client";

import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
    const { data: session, isPending } = authClient.useSession();
    const { signOut } = authClient;

    if (isPending) {
        return null;
    }

    return (
        <header className="border-b bg-card px-6 py-4">
            <div className="max-w-[1600px] mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Communications</h1>
                    <nav className="flex gap-6 mt-4 text-sm">
                        <a href="/inbox" className="text-primary font-medium">
                            Inbox
                        </a>
                        <a href="/analytics" className="text-muted-foreground hover:text-foreground">
                            Analytics
                        </a>
                    </nav>
                </div>
                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                                    <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {session?.user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => signOut()}>
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
