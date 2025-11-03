import { MessagesSquare, Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <MessagesSquare className="h-10 w-10 text-primary animate-pulse" />
        <p className="text-lg font-semibold">Loading Your Inbox...</p>
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    </div>
  )
}
