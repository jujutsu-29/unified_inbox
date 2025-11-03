

-----

# Unified Inbox - 

This is a full-stack, real-time, multi-team communication platform built for the Attack Capital assignment. It serves as a unified inbox that aggregates SMS messages (via Twilio) into a single, collaborative dashboard.

The application allows users to send, receive, and schedule messages, add internal team notes, view live cursors of other team members, and monitor key analytics.

## 🎥 Video Walkthrough

*[Link to your 3-5 minute Loom or unlisted YouTube video here. This is a critical deliverable.]*

**Example:**
`[https://www.loom.com/share/your-video-link]`

-----

## ✨ Features

This project successfully implements the core and advanced features outlined in the assignment:

  * **Authentication:** Full-stack, secure sign-in with Google, managed by **Better Auth**.
  * **Team-Based System:** Automatic "personal team" creation for new users, with all data (contacts, messages) scoped to their team.
  * **Role-Based Access (RBAC):**
      * **Admin/Editor:** Full write access to send messages, create contacts, and add notes.
      * **Viewer:** Read-only access. The UI hides all input fields and buttons, and the backend blocks all Server Actions.
  * **Unified Inbox & Contact Management:**
      * Create new contacts.
      * View all conversations, threaded by contact, in a 3-panel UI.
  * **Real-Time Messaging Pipeline (SMS):**
      * **Send Messages:** Send outbound SMS to contacts via the Twilio SDK.
      * **Receive Messages:** Ingest inbound SMS via a secure Twilio webhook.
      * **Optimistic UI:** New messages appear *instantly* in the chat window while the server action processes in the background.
  * **Real-Time Collaboration (Liveblocks):**
      * **Live Cursors:** See other team members' cursors moving on the page in real-time.
      * **Live Updates:** When an inbound message is received (via webhook) or a scheduled message is sent (via cron), a **Liveblocks broadcast event** is fired, forcing all connected clients to refetch data automatically.
  * **Internal Notes:**
      * Add threaded notes to any contact.
      * **Public/Private Toggle:** Notes can be marked as "Team" visible or "Private" (visible only to the author). The API enforces this rule.
  * **Message Scheduling:**
      * Schedule messages to be sent at a future date and time using a calendar pop-up.
      * Scheduled messages are `QUEUED` in the database and appear "faded" in the UI.
  * **Serverless Cron Job:**
      * A **Vercel Cron Job** runs every minute, calling an API route (`/api/cron/send-scheduled`).
      * This route finds all `QUEUED` messages, sends them via Twilio, and updates their status to `SENT`.
  * **Analytics Dashboard:**
      * A separate `/analytics` page with live-data charts.
      * **KPI Cards:** Total messages and total contacts.
      * **Charts:** "Messages Over Time" (Line Chart) and "Channel Distribution" (Pie Chart) powered by `recharts` and a custom API route.

-----

## 🛠️ Tech Stack

  * **Framework:** Next.js 14 (App Router)
  * **Language:** TypeScript
  * **Backend:** Next.js (API Routes, Server Actions)
  * **Database:** Neon (Serverless Postgres)
  * **ORM:** Prisma
  * **Authentication:** Better Auth (Google Provider)
  * **Real-Time:** Liveblocks (for Presence/Cursors and Broadcast Events)
  * **Telephony / SMS:** Twilio
  * **Styling:** Tailwind CSS, `shadcn/ui`
  * **Deployment:** Vercel (App Hosting, Cron Jobs)

-----

## 🧠 Key Architectural Decisions

This project's architecture was designed for scalability, security, and a modern developer experience.

1.  **Monorepo vs. Standalone Next.js:** I chose a **standalone Next.js 14 App Router** setup. A Turborepo was unnecessary for this project, as the entire application (frontend, API, webhooks, and server actions) is efficiently managed in a single, type-safe codebase.
2.  **Authentication & Multi-Tenancy:** Better Auth was used as required. To implement multi-tenancy and RBAC, I used its `customSession` plugin to query the database on login and inject the user's `teamId` and `role` directly into their session. This makes authorization checks in Server Actions and API routes extremely efficient.
3.  **Real-Time Strategy (Liveblocks):** Instead of a simple `refetch` interval, I implemented a robust, event-driven system using Liveblocks.
      * **Live Cursors** use **Liveblocks Presence** for low-latency state synchronization.
      * **Live Updates** (for new messages) use **Liveblocks Broadcast**. When a backend process (like the Twilio webhook or the cron job) runs, it broadcasts a `refetch-data` event to the appropriate "room" (the `teamId`). All connected clients listen for this event and trigger a data refetch. This is far more efficient than polling.
4.  **Database (Neon):** I selected Neon for its generous free-tier serverless Postgres, which integrates perfectly with Vercel and Prisma.
5.  **Scheduling (Vercel Crons):** I used Vercel Cron Jobs to trigger a simple API route. This is a fully serverless, scalable, and cost-effective solution that avoids the need for a separate, stateful scheduler. The logic is handled in the database by filtering for `status: 'QUEUED'`.
6.  **State Management:** The app avoids complex client-side state libraries. It relies on **Server Actions** for mutations and a simple `refetchToggle` (triggered by Liveblocks events) to re-fetch data, keeping the server as the single source of truth.

-----
## 🗂️ Database Schema (ERD)

Here is the Entity-Relationship Diagram for the application, built with Prisma.

```mermaid
erDiagram
    User {
        string id
        string email
        string name
        Role role
        string teamId
    }

    Team {
        string id
        string name
    }

    Contact {
        string id
        string name
        string phone
        string email
        string teamId
    }

    Conversation {
        string id
        ConversationStatus status
        string contactId
        string teamId
        string assigneeId
    }

    Message {
        string id
        string content
        string conversationId
        Channel channel
        MessageDirection direction
        MessageStatus status
        string authorId
        datetime scheduledAt
    }

    Note {
        string id
        string content
        string authorId
        string contactId
        NoteVisibility visibility
    }

    User ||--o{ Team : "belongs to"
    User ||--o{ Message : "authors"
    User ||--o{ Note : "authors"
    User ||--o{ Conversation : "assignee"

    Team ||--|{ User : "has members"
    Team ||--|{ Contact : "owns"
    Team ||--|{ Conversation : "owns"

    Contact }|--|| Conversation : "has one"
    Contact ||--|{ Note : "has"

    Conversation ||--|{ Message : "contains"
## 📊 Integration Comparison Table

This project integrated two primary external services, each with distinct characteristics.

| Channel / Service | Latency | Cost (Free Tier) | Reliability | Key Decision |
| :--- | :--- | :--- | :--- | :--- |
| **SMS (Twilio)** | Low (\~1-5s) | **Trial Account:** $15+ in credits. **Post-Trial:** Pay-as-you-go (per-message/number). | Very High. Reliant on carrier networks. | Required by the assignment. Twilio's SDK and webhooks are the industry standard for programmatic SMS. |
| **Real-Time (Liveblocks)**| Extremely Low (\<100ms) | **Free Tier:** Generous (50 MAUs, 20k Broadcast messages/month). | Very High. Persistent WebSocket connections. | Chosen over competitors (like Pusher) because it provides **both** Broadcast (for events) and Presence (for cursors) in one package, directly fulfilling two core assignment requirements. |

-----

## 🚀 How to Run Locally

### Prerequisites

  * Node.js 18+
  * A [Twilio](https://twilio.com/try-twilio) account (with a phone number)
  * A [Neon](https://neon.tech) database (or any Postgres DB)
  * A [Liveblocks](https://liveblocks.io) account
  * Google OAuth credentials (from Google Cloud Console)

### 1\. Clone & Install

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
npm install
```

### 2\. Set Up Environment

Create a `.env.local` file in the root of the project and fill in the following values:

```.env
# Database
DATABASE_URL="YOUR_NEON_POSTGRES_URL_WITH_?sslmode=require"

# Auth
AUTH_SECRET="your_secret_here" # Generate one: openssl rand -base64 32
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Twilio
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="your_twilio_phone_number"

# Liveblocks
LIVEBLOCKS_SECRET_KEY="sk_your_liveblocks_secret_key"
```

### 3\. Run Database Migrations

Push the Prisma schema to your database:

```bash
npx prisma migrate dev
```

### 4\. Run the App

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to view the application.

### 5\. Configure Webhooks

To test inbound SMS, you must expose your local server to the internet using `ngrok` and point your Twilio phone number's "A MESSAGE COMES IN" webhook to:
`https://your-ngrok-url.ngrok-free.app/api/webhooks/twilio`
