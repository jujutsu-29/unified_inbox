"use client"

import { useEffect, useState } from "react"
import { Search, Phone, Clock, Send, PlusCircle, Calendar as CalendarIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation";
import { sendMessage } from "../actions/send-message"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { createContact } from "../actions/create-contact"
import { scheduleMessage } from "../actions/schedule-message"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

// const conversations = [
//     {
//         id: 1,
//         name: "Jane Doe",
//         phone: "+919262348758",
//         email: "jane.doe@example.com",
//         avatar: "JD",
//         channel: "SMS",
//         channelColor: "bg-green-100 text-green-800",
//         lastMessage: "Sounds great! Let me check my calendar.",
//         timestamp: "2:30 PM",
//     },
//     {
//         id: 2,
//         name: "John Smith",
//         phone: "+1 (555) 987-6543",
//         email: "john.smith@example.com",
//         avatar: "JS",
//         channel: "WhatsApp",
//         channelColor: "bg-blue-100 text-blue-800",
//         lastMessage: "Thanks for the update!",
//         timestamp: "1:15 PM",
//     },
//     {
//         id: 3,
//         name: "Sarah Johnson",
//         phone: "+1 (555) 456-7890",
//         email: "sarah.j@example.com",
//         avatar: "SJ",
//         channel: "Email",
//         channelColor: "bg-purple-100 text-purple-800",
//         lastMessage: "Looking forward to the meeting.",
//         timestamp: "12:45 PM",
//     },
// ]

// const messages = [
//     { id: 1, sender: "Jane Doe", text: "Hi! How are you doing?", time: "2:20 PM", isOutbound: false },
//     { id: 2, sender: "You", text: "Hey Jane! I am doing well, thanks for asking.", time: "2:21 PM", isOutbound: true },
//     { id: 3, sender: "Jane Doe", text: "Great! Do you have time for a quick call?", time: "2:25 PM", isOutbound: false },
//     { id: 4, sender: "You", text: "Sure, I can do a call in 10 minutes.", time: "2:26 PM", isOutbound: true },
//     { id: 5, sender: "Jane Doe", text: "Sounds great! Let me check my calendar.", time: "2:30 PM", isOutbound: false },
// ]

const events = [
    { id: 1, action: "SMS sent", date: "Today at 2:30 PM" },
    { id: 2, action: "Call completed", date: "Today at 1:45 PM" },
    { id: 3, action: "SMS received", date: "Today at 12:20 PM" },
    { id: 4, action: "Contact added", date: "Nov 1, 2024" },
]

export default function InboxPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [messageInput, setMessageInput] = useState("")
    const [notes, setNotes] = useState("")
    const [isPrivateNote, setIsPrivateNote] = useState(false)
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false)
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

    const {
        data: session,
        isPending,
        error,
        refetch
    } = authClient.useSession();

    useEffect(() => {
        // This is an async function inside the hook
        const fetchConversations = async () => {
            setIsLoadingConversations(true);
            try {
                const res = await fetch("/api/conversations");
                const data = await res.json();
                setConversations(data);
                console.log("Fetched conversations:", data);
                // Automatically select the first conversation
                if (data.length > 0 && !selectedConversation) {
                    setSelectedConversation(data[0]);
                }
            } catch (err) {
                console.error("Failed to fetch conversations:", err);
            }
            setIsLoadingConversations(false);
        };

        if (session?.user) { // Only fetch if logged in
            fetchConversations();
        }
    }, [session, refetchToggle]); // --- Refetches if auth changes or if we toggle it

    // --- NEW: Fetch messages when a conversation is selected ---
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedConversation) return; // Don't fetch if nothing is selected

            setIsLoadingMessages(true);
            try {
                const res = await fetch(
                    `/api/conversations/${selectedConversation.id}/messages`
                );
                const data = await res.json();
                console.log("Fetched messages for conversation", selectedConversation.id, data);
                setMessages(data);
            } catch (err) {
                console.error("Failed to fetch messages:", err);
            }
            setIsLoadingMessages(false);
        };

        fetchMessages();
    }, [selectedConversation, refetchToggle]);

    if (isPending) return <div>Loading...</div>;
    if (!session?.user) {
        router.push("/login");
        return null;
    }

    const handleCreateContact = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        console.log("Creating contact with data:", Object.fromEntries(formData.entries()));
        const res = await createContact(formData);
        console.log("Create contact result:", res);
        setIsDialogOpen(false);
    }

    const filteredConversations = conversations.filter(
        (conv) => conv.name.toLowerCase().includes(searchTerm.toLowerCase()) || conv.phone.includes(searchTerm),
    )

    const handleCallEvent = () => {
        console.log("Handle call event for conversation:", selectedConversation)
    }

    const handleSend = async () => {
        console.log("Handle send called")
        if (!messageInput || !selectedConversation) return
        setIsSending(true)

        console.log("Sending message:", messageInput)
        console.log("To conversation:", selectedConversation)

        // 1. Create FormData to send to the action
        // const formData = new FormData()
        // formData.append("body", messageInput)
        // // NOTE: Your hardcoded data needs to be replaced by real data
        // // The server action needs the CONTACT's phone and the CONVERSATION's ID
        // formData.append("contactPhone", selectedConversation.phone)
        // formData.append("conversationId", String(selectedConversation.id))

        const optimisticMessage = {
            id: `temp_${Date.now()}`, // A temporary ID for React's key
            text: messageInput,
            time: new Date().toLocaleTimeString(),
            isOutbound: true,
            sender: "You",
            status: scheduledAt ? 'QUEUED' : 'SENT', // Set the status
            scheduledAt: scheduledAt ? scheduledAt.toISOString() : null,
        };

        setMessages(currentMessages => [...currentMessages, optimisticMessage]);

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
            if (scheduledAt) {
                formData.append("scheduledAt", scheduledAt.toISOString());

                await scheduleMessage(formData);
                setScheduledAt(null);
            } else {
                const result = await sendMessage(formData)

                // console.log("Send message result:", result)
                if (result.success) {
                    setMessageInput("")
                } else {
                    console.error(result.error)
                    // TODO: Show an error toast to the user
                }
            }
        } catch (err) {
            console.error(err)
            // TODO: Show an error toast
        }

        setIsSending(false)
    }

    const handleSchedule = async () => {
        if (!messageInput || !selectedConversation || !scheduledAt) return;

        const [hours, minutes] = time.split(":").map(Number);
        const scheduledDateTime = new Date(scheduledAt);
        scheduledDateTime.setHours(hours, minutes);

        const formData = new FormData();
        formData.append("body", messageInput);
        formData.append("conversationId", String(selectedConversation.id));
        formData.append("scheduledAt", scheduledDateTime.toISOString());

        try {
            await scheduleMessage(formData);
            setScheduledAt(null);
            setMessageInput("");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header Navigation */}
            <header className="border-b bg-card px-6 py-4">
                <div className="max-w-[1600px] mx-auto">
                    <h1 className="text-2xl font-bold text-foreground">Communications</h1>
                    <nav className="flex gap-6 mt-4 text-sm">
                        <a href="/" className="text-primary font-medium">
                            Inbox
                        </a>
                        <a href="/analytics" className="text-muted-foreground hover:text-foreground">
                            Analytics
                        </a>
                    </nav>
                </div>
            </header>

            {/* Main 3-Panel Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: Conversation List */}
                <div className="w-80 border-r bg-card flex flex-col">
                    <div className="p-4 border-b">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" className="w-full justify-start gap-2" size="sm">
                                    <PlusCircle className="h-4 w-4" />
                                    New Chat
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Contact</DialogTitle>
                                    <DialogDescription>
                                        Enter the contact's name and phone number to start a new conversation.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateContact} className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" name="name" placeholder="Jane Doe" />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input id="phone" name="phone" placeholder="+15551234567" />
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
                    </div>
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search contacts or messages..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedConversation(conv)}
                                className={`p-4 border-b cursor-pointer transition-colors ${selectedConversation.id === conv.id ? "bg-secondary" : "hover:bg-muted"
                                    }`}
                            >
                                <div className="flex gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>{conv.avatar}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="font-semibold text-foreground text-sm">{conv.name}</p>
                                            <Badge className={`${conv.channelColor} text-xs shrink-0`}>{conv.channel}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{conv.phone}</p>
                                        <p className="text-xs text-muted-foreground truncate mt-2">{conv.lastMessage}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Middle Panel: Chat */}
                <div className="flex-1 flex flex-col bg-background">
                    {/* Chat Header */}
                    <Card className="m-4 p-4 border rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-foreground">{selectedConversation?.name}</h2>
                                <p className="text-sm text-muted-foreground">{selectedConversation?.phone}</p>
                            </div>
                            {/* <Button onClick={handleCallEvent} size="sm" variant="outline" className="gap-2 bg-transparent">
                                <Phone className="h-4 w-4" />
                                Call
                            </Button> */}
                        </div>
                    </Card>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isOutbound ? "justify-end" : "justify-start"}`}>
                                <div
                                    // className={`max-w-xs px-4 py-2 rounded-lg ${msg.isOutbound ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                    //     }`}
                                    className={`max-w-xs px-4 py-2 rounded-lg ${msg.isOutbound ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                        } ${
                                        // --- NEW: Make scheduled messages look "faded" ---
                                        msg.status === 'QUEUED' ? 'opacity-60' : ''
                                        }`}
                                >
                                    {msg.status === 'QUEUED' && msg.scheduledAt ? (
                                        <>
                                        <p className="text-sm">{msg.text}</p>
                                        <p className="text-xs mt-1 opacity-70 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Scheduled for {format(new Date(msg.scheduledAt), "MMM d, p")}
                                        </p>
                                        </>
                                    ) : (
                                        <>
                                        <p className="text-sm">{msg.text}</p>
                                        {/* // This is the original "time" tag */}
                                        <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                                        </>
                                    )}
                                    {/* <p className="text-xs mt-1 opacity-70">{msg.time}</p> */}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Message Composer */}
                    <Card className="m-4 p-4 border rounded-lg shadow-sm">
                        <div className="space-y-3">
                            <Textarea
                                placeholder="Write your message here..."
                                className="min-h-20 resize-none"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                disabled={isSending} // --- NEW
                            />
                            <div className="flex justify-between gap-2">

                                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-2 bg-transparent"
                                        >
                                            <Clock className="h-4 w-4" />
                                            {/* Show the selected date, or "Schedule" */}
                                            {scheduledAt ? (
                                                format(scheduledAt, "MMM d, p")
                                            ) : (
                                                "Schedule"
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={scheduledAt || undefined}
                                            onSelect={(newDate) => {
                                                if (newDate) {
                                                    const [hours, minutes] = time.split(":").map(Number);
                                                    const combinedDateTime = new Date(newDate);
                                                    combinedDateTime.setHours(hours, minutes);
                                                    setScheduledAt(combinedDateTime);
                                                } else {
                                                    setScheduledAt(null);
                                                }
                                                setIsPopoverOpen(false); // Close popover on select
                                            }}
                                            disabled={(date) => date < new Date(Date.now() - 86400000)} // Disable past dates
                                            initialFocus
                                        />
                                        <div className="p-2 border-t border-border">
                                            <Label htmlFor="time" className="text-sm font-medium">Time</Label>
                                            <Input
                                                id="time"
                                                type="time"
                                                value={time}
                                                onChange={(e) => setTime(e.target.value)}
                                            />
                                        </div>
                                        {/* Optional: Add a Time Picker component here */}
                                    </PopoverContent>
                                </Popover>

                                <Button
                                    size="sm"
                                    className="gap-2"
                                    onClick={handleSend}
                                    disabled={isSending || !messageInput}
                                >
                                    {/* {isSending ? (
                                        "Sending..."
                                    ) : ( */}
                                        <>
                                            <Send className="h-4 w-4" />
                                            Send
                                        </>
                                    {/* )} */}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Panel: Contact Profile */}
                <div className="w-80 border-l bg-card flex flex-col overflow-y-auto">
                    <Card className="m-4 border rounded-lg shadow-sm">
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="font-semibold text-foreground mb-4">Contact Profile</h3>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Name</label>
                                    <Input value={selectedConversation?.name} readOnly className="text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Phone</label>
                                    <Input value={selectedConversation?.phone} readOnly className="text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Email</label>
                                    <Input value={selectedConversation?.email} readOnly className="text-sm" />
                                </div>
                            </div>

                            {/* Tabs */}
                            <Tabs defaultValue="notes" className="w-full">
                                <TabsList className="grid w-full">
                                    <TabsTrigger value="notes">Notes</TabsTrigger>
                                    {/* <TabsTrigger value="history">History</TabsTrigger> */}
                                </TabsList>

                                {/* Notes Tab */}
                                <TabsContent value="notes" className="space-y-3 mt-4">
                                    <Textarea
                                        placeholder="Add notes about this contact..."
                                        className="min-h-24 resize-none"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="private"
                                            checked={isPrivateNote}
                                            onChange={(e) => setIsPrivateNote(e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="private" className="text-xs text-muted-foreground">
                                            Private Note
                                        </label>
                                    </div>
                                    <Button size="sm" className="w-full">
                                        Save Note
                                    </Button>
                                </TabsContent>

                                {/* History Tab */}
                                {/* <TabsContent value="history" className="space-y-3 mt-4">
                                    <div className="space-y-2">
                                        {events.map((event) => (
                                            <div key={event.id} className="flex gap-3 pb-3 border-b last:border-b-0">
                                                <div className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0" />
                                                <div>
                                                    <p className="text-sm text-foreground">{event.action}</p>
                                                    <p className="text-xs text-muted-foreground">{event.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent> */}
                            </Tabs>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
