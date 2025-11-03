"use client";

import { useEffect, useState, ReactNode } from "react";
import {
  Search,
  Phone,
  Clock,
  Send,
  PlusCircle,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { sendMessage } from "../actions/send-message";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createContact } from "../actions/create-contact";
import { scheduleMessage } from "../actions/schedule-message";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

import {
  RoomProvider,
  useEventListener,
  useMyPresence,
} from "@/liveblocks.config";
// We import ClientSideSuspense directly
import { ClientSideSuspense } from "@liveblocks/react";
import { createNote } from "../actions/create-note";
import { LiveCursors } from "@/components/LiveCursor";
import { Navbar } from "@/components/Navbar";
import Loading from "@/components/loading";

function InboxUI({
  session,
  isViewer,
  isLive,
  conversations,
  messages,
  notesList,
  selectedConversation,
  isLoadingConversations,
  isLoadingMessages,
  isLoadingNotes,
  isSending,
  isSavingNote,
  refetchToggle,
  onSearch,
  onSelectConversation,
  onMessageInput,
  onNoteInput,
  onPrivateNoteToggle,
  onNewContactSubmit,
  onSendSubmit,
  onSaveNoteSubmit,
  onScheduleSelect,
  onScheduleTimeInput,
  onPointerMove,
  onPointerLeave,
}: any) {
  const router = useRouter();

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  const filteredConversations = conversations.filter(
    (conv: any) =>
      conv.name.toLowerCase().includes(onSearch.value.toLowerCase()) ||
      conv.phone.includes(onSearch.value)
  );

  return (
    <div
      className="flex flex-col h-screen bg-background"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <Navbar />
      {/* Cursors are rendered by the parent */}
      {isLive && <LiveCursors />}

      {/* Main 3-Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Conversation List */}
        <div className="w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            {!isViewer && (
              <Dialog
                open={onNewContactSubmit.isOpen}
                onOpenChange={onNewContactSubmit.setIsOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    size="sm"
                  >
                    <PlusCircle className="h-4 w-4" />
                    New Chat
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Contact</DialogTitle>
                    <DialogDescription>
                      Enter the contact's name and phone number to start a new
                      conversation.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={onNewContactSubmit.handler}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" placeholder="Jane Doe" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="+15551234567"
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit">Create Contact</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts or messages..."
                className="pl-10"
                value={onSearch.value}
                onChange={(e) => onSearch.setValue(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <p className="p-4 text-xs text-muted-foreground">Loading...</p>
            ) : (
              filteredConversations.map((conv: any) => (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  className={`p-4 border-b cursor-pointer transition-colors ${
                    selectedConversation?.id === conv.id
                      ? "bg-secondary"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{conv.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-foreground text-sm">
                          {conv.name}
                        </p>
                        <Badge
                          className={`${conv.channelColor} text-xs shrink-0`}
                        >
                          {conv.channel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conv.phone}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-2">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Middle Panel: Chat */}
        <div className="flex-1 flex flex-col bg-background">
          <Card className="m-4 p-4 border rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground">
                  {selectedConversation?.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedConversation?.phone}
                </p>
              </div>
            </div>
          </Card>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {isLoadingMessages ? (
              <p className="text-xs text-muted-foreground">Loading messages...</p>
            ) : (
              messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.isOutbound ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.isOutbound
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    } ${msg.status === "QUEUED" ? "opacity-60" : ""}`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    {msg.status === "QUEUED" && msg.scheduledAt ? (
                      <p className="text-xs mt-1 opacity-70 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Scheduled for {format(new Date(msg.scheduledAt), "MMM d, p")}
                      </p>
                    ) : (
                      <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {!isViewer && (
            <Card className="m-4 p-4 border rounded-lg shadow-sm">
              <div className="space-y-3">
                <Textarea
                  placeholder="Write your message here..."
                  className="min-h-20 resize-none"
                  value={onMessageInput.value}
                  onChange={(e) => onMessageInput.setValue(e.target.value)}
                  disabled={isSending}
                />
                <div className="flex justify-between gap-2">
                  <Popover
                    open={onScheduleSelect.isPopoverOpen}
                    onOpenChange={onScheduleSelect.setIsPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 bg-transparent"
                      >
                        <Clock className="h-4 w-4" />
                        {onScheduleSelect.value ? (
                          format(onScheduleSelect.value, "MMM d, p")
                        ) : (
                          "Schedule"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={onScheduleSelect.value || undefined}
                        onSelect={onScheduleSelect.handler}
                        disabled={(date) => date < new Date(Date.now() - 86400000)}
                        initialFocus
                      />
                      <div className="p-2 border-t border-border">
                        <Label htmlFor="time" className="text-sm font-medium">Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={onScheduleTimeInput.value}
                          onChange={(e) => onScheduleTimeInput.setValue(e.target.value)}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={onSendSubmit}
                    disabled={isSending || !onMessageInput.value}
                  >
                    <Send className="h-4 w-4" />
                    {isSending
                      ? "Sending..."
                      : onScheduleSelect.value
                      ? "Schedule"
                      : "Send"}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Panel: Contact Profile */}
        <div className="w-80 border-l bg-card flex flex-col overflow-y-auto">
          <Card className="m-4 border rounded-lg shadow-sm">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-4">
                  Contact Profile
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block">Name</Label>
                  <Input value={selectedConversation?.name || ''} readOnly className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block">Phone</Label>
                  <Input value={selectedConversation?.phone || ''} readOnly className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block">Email</Label>
                  <Input value={selectedConversation?.email || ''} readOnly className="text-sm" />
                </div>
              </div>
              <Tabs defaultValue="notes" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="notes" className="space-y-3 mt-4">
                  <form onSubmit={onSaveNoteSubmit} className="space-y-3">
                    <Textarea
                      placeholder="Add notes about this contact..."
                      className="min-h-24 resize-none"
                      value={onNoteInput.value}
                      onChange={(e) => onNoteInput.setValue(e.target.value)}
                      disabled={isViewer || isSavingNote}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="private"
                        checked={onPrivateNoteToggle.value}
                        onChange={(e) => onPrivateNoteToggle.setValue(e.target.checked)}
                        disabled={isViewer || isSavingNote}
                        className="w-4 h-4"
                      />
                      <label
                        htmlFor="private"
                        className="text-xs text-muted-foreground"
                      >
                        Private Note
                      </label>
                    </div>
                    {!isViewer && (
                      <Button
                        type="submit"
                        size="sm"
                        className="w-full"
                        disabled={isSavingNote || !onNoteInput.value}
                      >
                        {isSavingNote ? "Saving..." : "Save Note"}
                      </Button>
                    )}
                  </form>
                  <div className="pt-4 space-y-4">
                    {isLoadingNotes ? (
                      <p className="text-xs text-muted-foreground">Loading notes...</p>
                    ) : (
                      notesList.map((note: any) => (
                        <div key={note.id} className="pb-3 border-b last:border-b-0">
                          <p className="text-sm text-foreground">{note.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            by {note.author.name || note.author.email} on{" "}
                            {format(new Date(note.createdAt), "MMM d, yyyy")}
                            {note.visibility === "PRIVATE" && (
                              <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                Private
                              </span>
                            )}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="history" className="space-y-3 mt-4">
                  {/* History tab content goes here */}
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LiveInboxWrapper({ session, isViewer }: { session: any, isViewer: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [notesList, setNotesList] = useState<any[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [refetchToggle, setRefetchToggle] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [time, setTime] = useState("12:00");

  const [myPresence, updateMyPresence] = useMyPresence();
  useEventListener(({ event }) => {
    if (
      event &&
      typeof event === "object" &&
      "type" in event &&
      event.type === "refetch-data"
    ) {
      console.log("Liveblocks: 'refetch-data' event triggered! Refetching...");
      setRefetchToggle((prev) => !prev);
    }
  });

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoadingConversations(true);
      try {
        const res = await fetch("/api/conversations");
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      }
      setIsLoadingConversations(false);
    };
    if (session?.user) {
      fetchConversations();
    }
  }, [session, refetchToggle]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;
      setIsLoadingMessages(true);
      try {
        const res = await fetch(
          `/api/conversations/${selectedConversation.id}/messages`
        );
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
      setIsLoadingMessages(false);
    };
    fetchMessages();
  }, [selectedConversation, refetchToggle]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!selectedConversation) {
        setNotesList([]);
        return;
      }
      setIsLoadingNotes(true);
      try {
        const res = await fetch(
          `/api/contacts/${selectedConversation.contactId}/notes`
        );
        if (!res.ok) throw new Error("Failed to fetch notes");
        const data = await res.json();
        setNotesList(data);
      } catch (err) {
        console.error(err);
      }
      setIsLoadingNotes(false);
    };
    fetchNotes();
  }, [selectedConversation, refetchToggle]);

  // --- All Handlers live here ---
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    updateMyPresence({ cursor: { x: e.clientX, y: e.clientY } });
  };
  const handlePointerLeave = () => {
    updateMyPresence({ cursor: null });
  };

  const handleCreateContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createContact(formData);
    if (res.success) {
      setRefetchToggle((prev) => !prev);
      setIsDialogOpen(false);
      // If this is the first contact, reload to join the room
      if (conversations.length === 0) {
        window.location.reload();
      }
    } else {
      console.error(res.error);
    }
  };

  const handleSend = async () => {
    if (!messageInput || !selectedConversation) return;
    setIsSending(true);

    const optimisticMessage = {
      id: `temp_${Date.now()}`,
      text: messageInput,
      time: new Date().toLocaleTimeString(),
      isOutbound: true,
      sender: "You",
      status: scheduledAt ? "QUEUED" : "SENT",
      scheduledAt: scheduledAt ? scheduledAt.toISOString() : null,
    };
    setMessages((current) => [...current, optimisticMessage]);

    const messageBody = messageInput;
    const conversationId = String(selectedConversation.id);
    const contactPhone = selectedConversation.phone;
    const scheduleDate = scheduledAt;

    setMessageInput("");
    setScheduledAt(null);

    const formData = new FormData();
    formData.append("body", messageBody);
    formData.append("contactPhone", contactPhone);
    formData.append("conversationId", conversationId);

    try {
      if (scheduleDate) {
        formData.append("scheduledAt", scheduleDate.toISOString());
        await scheduleMessage(formData);
      } else {
        await sendMessage(formData);
      }
      setRefetchToggle((prev) => !prev);
    } catch (err) {
      console.error(err);
      // Revert optimistic update
      setMessages((current) => current.filter(m => m.id !== optimisticMessage.id));
    }
    setIsSending(false);
  };
  
  const handleSaveNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!noteInput || !selectedConversation) return;
    setIsSavingNote(true);

    const formData = new FormData();
    formData.append("content", noteInput);
    formData.append("contactId", selectedConversation.contactId);
    formData.append("visibility", isPrivateNote ? "PRIVATE" : "TEAM");

    try {
      const result = await createNote(formData);
      if (result.success) {
        setNoteInput("");
        setIsPrivateNote(false);
        setRefetchToggle((prev) => !prev);
      } else {
        console.error("Failed to save note:", result.error);
      }
    } catch (err) {
      console.error(err);
    }
    setIsSavingNote(false);
  };
  
  const handleScheduleSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const [hours, minutes] = time.split(":").map(Number);
      const combinedDateTime = new Date(newDate);
      combinedDateTime.setHours(hours, minutes);
      setScheduledAt(combinedDateTime);
    } else {
      setScheduledAt(null);
    }
    setIsPopoverOpen(false);
  };

  // --- Pass everything down to the "dumb" UI component ---
  return (
    <InboxUI
      session={session}
      isViewer={isViewer}
      isLive={true}
      conversations={conversations}
      messages={messages}
      notesList={notesList}
      selectedConversation={selectedConversation}
      isLoadingConversations={isLoadingConversations}
      isLoadingMessages={isLoadingMessages}
      isLoadingNotes={isLoadingNotes}
      isSending={isSending}
      isSavingNote={isSavingNote}
      refetchToggle={refetchToggle}
      onSearch={{ value: searchTerm, setValue: setSearchTerm }}
      onSelectConversation={setSelectedConversation}
      onMessageInput={{ value: messageInput, setValue: setMessageInput }}
      onNoteInput={{ value: noteInput, setValue: setNoteInput }}
      onPrivateNoteToggle={{ value: isPrivateNote, setValue: setIsPrivateNote }}
      onNewContactSubmit={{
        handler: handleCreateContact,
        isOpen: isDialogOpen,
        setIsOpen: setIsDialogOpen,
      }}
      onSendSubmit={handleSend}
      onSaveNoteSubmit={handleSaveNote}
      onScheduleSelect={{
        value: scheduledAt,
        handler: handleScheduleSelect,
        isPopoverOpen,
        setIsPopoverOpen,
      }}
      onScheduleTimeInput={{ value: time, setValue: setTime }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    />
  );
}


export default function InboxPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div className="flex h-screen items-center justify-center"><Loading/></div>;
  }
  
  if (!session?.user) {
    return (
      <InboxUI
        session={null}
        isViewer={true}
        isLive={false}
        conversations={[]}
        messages={[]}
        notesList={[]}
        selectedConversation={null}
        isLoadingConversations={true}
        isLoadingMessages={false}
        isLoadingNotes={false}
        isSending={false}
        isSavingNote={false}
        refetchToggle={false}
        onSearch={{ value: "", setValue: () => {} }}
        onSelectConversation={() => {}}
        onMessageInput={{ value: "", setValue: () => {} }}
        onNoteInput={{ value: "", setValue: () => {} }}
        onPrivateNoteToggle={{ value: false, setValue: () => {} }}
        onNewContactSubmit={{
          handler: () => {},
          isOpen: false,
          setIsOpen: () => {},
        }}
        onSendSubmit={() => {}}
        onSaveNoteSubmit={() => {}}
        onScheduleSelect={{
          value: null,
          handler: () => {},
          isPopoverOpen: false,
          setIsPopoverOpen: () => {},
        }}
        onScheduleTimeInput={{ value: "12:00", setValue: () => {} }}
        onPointerMove={() => {}}
        onPointerLeave={() => {}}
      />
    );
  }

  if (!session?.user) {

    return (
      <InboxUI
        session={null}
        isViewer={true}
        isLive={false}
      />
    );
  }

  if (!session.user.teamId) {
    return <LiveInboxWrapper session={session} isViewer={session.user.role === 'VIEWER'} />
  }

  return (
    <RoomProvider 
      id={session.user.teamId} 
      initialPresence={{ cursor: null }}
      //@ts-ignore
      initialStorage={{}} 
    >
      <ClientSideSuspense fallback={<div className="flex h-screen items-center justify-center">Loading chat room...</div>}>
        <LiveInboxWrapper session={session} isViewer={session.user.role === 'VIEWER'} />
      </ClientSideSuspense>
    </RoomProvider>
  );
}