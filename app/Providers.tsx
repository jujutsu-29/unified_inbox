"use client";
import { ReactNode } from "react";
import { LiveblocksProvider } from "@liveblocks/react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      {children}
    </LiveblocksProvider>
  );
}