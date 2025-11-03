// components/LiveCursor.tsx
"use client";

import { useOthers } from "@/liveblocks.config"; // <-- Import from your new config
import React from "react";
import { Pointer } from "lucide-react"; // Or any cursor icon

// A simple component to render a cursor
const Cursor = ({ x, y, name }: { x: number; y: number; name: string }) => {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0"
      style={{ transform: `translateX(${x}px) translateY(${y}px)` }}
    >
      <Pointer className="h-5 w-5 fill-blue-500 text-blue-500" />
      <span className="absolute left-4 top-4 rounded-md bg-blue-500 px-2 py-1 text-xs text-white">
        {name}
      </span>
    </div>
  );
};


export function LiveCursors() {

  const others = useOthers();

  // 2. Map over them and render a cursor for each one
  return (
    <>
      {others.map(({ connectionId, presence, info }) => {
        if (!presence.cursor) {
          return null; // Cursor is not on-screen
        }
        return (
          <Cursor
            key={connectionId}
            x={presence.cursor.x}
            y={presence.cursor.y}
            name={info.name || "Anonymous"}
          />
        );
      })}
    </>
  );
}