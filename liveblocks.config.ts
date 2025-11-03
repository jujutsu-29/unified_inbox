import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
});


type Presence = {
  cursor: { x: number; y: number } | null;
};
type UserMeta = {
  info: {
    name: string;
  };
};
type RoomEvent = { type: "refetch-data" };

const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useOthers,
  useEventListener,
  useBroadcastEvent,
  useStorage,
  useMutation,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);

// Export the hooks
export {
  RoomProvider,
  useRoom,
  useMyPresence,
  useOthers,
  useEventListener,
  useBroadcastEvent,
  useStorage,
  useMutation,
};