export interface Contact {
  id: number
  name: string
  phone: string
  email: string
  initials: string
  channel: "SMS" | "WhatsApp"
  lastMessage: string
  timestamp: string
  company?: string
  tags: string[]
}

export interface Message {
  id: number
  conversationId: number
  outbound: boolean
  text: string
  timestamp: string
  read: boolean
}

export const SAMPLE_CONTACTS: Contact[] = [
  {
    id: 1,
    name: "Jane Doe",
    phone: "+1 (555) 123-4567",
    email: "jane.doe@example.com",
    initials: "JD",
    channel: "SMS",
    lastMessage: "Thanks for the update!",
    timestamp: "2 min ago",
    company: "Acme Corp",
    tags: ["VIP", "Follow-up"],
  },
  {
    id: 2,
    name: "John Smith",
    phone: "+1 (555) 234-5678",
    email: "john.smith@example.com",
    initials: "JS",
    channel: "WhatsApp",
    lastMessage: "See you tomorrow",
    timestamp: "15 min ago",
    company: "Tech Solutions",
    tags: ["Client"],
  },
  {
    id: 3,
    name: "Sarah Wilson",
    phone: "+1 (555) 345-6789",
    email: "sarah.wilson@example.com",
    initials: "SW",
    channel: "SMS",
    lastMessage: "Perfect, sounds good",
    timestamp: "1 hour ago",
    company: "Creative Agency",
    tags: ["Partner"],
  },
  {
    id: 4,
    name: "Mike Brown",
    phone: "+1 (555) 456-7890",
    email: "mike.brown@example.com",
    initials: "MB",
    channel: "WhatsApp",
    lastMessage: "Got it, thanks!",
    timestamp: "3 hours ago",
    company: "Startup Inc",
    tags: ["Lead"],
  },
  {
    id: 5,
    name: "Emily Chen",
    phone: "+1 (555) 567-8901",
    email: "emily.chen@example.com",
    initials: "EC",
    channel: "SMS",
    lastMessage: "Can we schedule a call?",
    timestamp: "4 hours ago",
    company: "Global Ventures",
    tags: ["Important"],
  },
]

export const SAMPLE_MESSAGES: Message[] = [
  {
    id: 1,
    conversationId: 1,
    outbound: false,
    text: "Hi there! How are you doing?",
    timestamp: "10:30 AM",
    read: true,
  },
  {
    id: 2,
    conversationId: 1,
    outbound: true,
    text: "Hey Jane! Doing great, thanks for asking!",
    timestamp: "10:32 AM",
    read: true,
  },
  {
    id: 3,
    conversationId: 1,
    outbound: false,
    text: "Just wanted to check on the project",
    timestamp: "10:35 AM",
    read: true,
  },
  {
    id: 4,
    conversationId: 1,
    outbound: true,
    text: "Everything is on track. Should be done by Friday",
    timestamp: "10:36 AM",
    read: true,
  },
  {
    id: 5,
    conversationId: 1,
    outbound: false,
    text: "Thanks for the update!",
    timestamp: "10:37 AM",
    read: true,
  },
]
