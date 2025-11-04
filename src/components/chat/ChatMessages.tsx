import React from "react";
import { AnimatePresence } from "framer-motion";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatTypingIndicator from "./ChatTypingIndicator";
import BotMarkdownBubble from "./BotMarkdownBubble";
import ToolBubble from "./ToolBubble";
import { Message } from "@/hooks/useChatConversation";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {messages.map((m) => {
          if (m.sender === "user") {
            return <ChatMessageBubble key={m.id} message={{ ...m, sender: "user" }} />;
          }
          if (m.message.startsWith("🔧 Tool call") || m.message.startsWith("🧩 Tool message")) {
            return <ToolBubble key={m.id} id={m.id} content={m.message} />;
          }
          if ((m.sender === "bot" || m.sender === "tool") && m.message.trim()) {
            return <BotMarkdownBubble key={m.id} id={m.id} content={m.message} />;
          }
          return null;
        })}
      </AnimatePresence>
      {isLoading && <ChatTypingIndicator />}
    </div>
  );
}
