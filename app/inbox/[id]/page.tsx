// In your chat composer component (e.g., app/inbox/[id]/page.tsx)
"use client";

import { sendMessage } from "@/app/actions/send-message";
import { useRef } from "react";

// Assume you get `contact` and `conversation` as props
export default function ChatComposer({ contact, conversation }: { contact: any; conversation: any }) {
  const formRef = useRef<HTMLFormElement>(null);

  // This function is called after the action completes
  async function handleSend(formData: FormData) {
    await sendMessage(formData);
    // Reset the form after sending
    formRef.current?.reset();
  }

  return (
    // 'action' attribute calls the Server Action
    <form ref={formRef} action={handleSend}>
      
      {/* Hidden inputs to pass required IDs */}
      <input type="hidden" name="contactPhone" value={contact.phone} />
      <input type="hidden" name="conversationId" value={conversation.id} />
      
      <textarea
        name="body"
        placeholder="Type your message..."
        required
      />
      
      <button type="submit">Send</button>
    </form>
  );
}