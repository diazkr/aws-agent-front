import { useState, useRef, useCallback } from "react";
import { streamBackendChat } from "@/services/chat/llm";

export type Message = {
  id: string | number;
  message: string;
  sender: "user" | "bot" | "tool";
  timestamp: string;
  message_type: "text" | "image" | "file";
};

interface UseChatConversationProps {
  userId: string;
  conversationId: string;
  onConversationCreated?: () => void;
}

export function useChatConversation({ userId, conversationId, onConversationCreated }: UseChatConversationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationCreated, setConversationCreated] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Reset cuando cambia la conversación
  const prevConversationId = useRef<string>(conversationId);
  
  if (prevConversationId.current !== conversationId) {
    setMessages([]);
    setConversationCreated(false);
    prevConversationId.current = conversationId;
  }

  const appendMessage = useCallback((m: Message) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  const loadConversationHistory = useCallback(async (): Promise<{ success: boolean; type?: string }> => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBaseUrl) {
        return { success: false };
      }
      const response = await fetch(`${apiBaseUrl}/api/chat/${conversationId}/history`);
      if (response.ok) {
        const data = await response.json();
        if (data.history && data.history.length > 0) {
          const loadedMessages: Message[] = data.history.map((msg: { content: string; role: string }, index: number) => ({
            id: `history-${index}`,
            message: msg.content,
            sender: msg.role === 'user' ? 'user' : 'bot',
            timestamp: new Date().toISOString(),
            message_type: 'text',
          }));
          setMessages(loadedMessages);
          return { success: true, type: data.conversation_type };
        }
      }
    } catch {
      return { success: false };
    }
    return { success: false };
  }, [conversationId]);

  const createConversation = useCallback(async (): Promise<boolean> => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBaseUrl) {
        return false;
      }
      const response = await fetch(`${apiBaseUrl}/api/chat/create_conv/${userId}?conv_id=${conversationId}`, {
        method: 'PUT',
      });
      if (response.ok) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [userId, conversationId]);

  const updateConversationTitle = useCallback(async (message: string): Promise<void> => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBaseUrl) {
        return;
      }

      const title = message.length > 30 ? `${message.substring(0, 30)}...` : message;

      await fetch(`${apiBaseUrl}/api/chat/${conversationId}/title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
    } catch {
      // Failed to update title, continue silently
    }
  }, [conversationId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    if (messages.length === 1 && !conversationCreated) {
      const created = await createConversation();
      if (created) {
        setConversationCreated(true);
        onConversationCreated?.();

        window.dispatchEvent(new CustomEvent('conversationCreated', {
          detail: { conversationId, userId }
        }));

        await updateConversationTitle(text);
      }
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const userMessage: Message = {
      id: Date.now(),
      message: text,
      sender: "user",
      timestamp: new Date().toISOString(),
      message_type: "text",
    };
    appendMessage(userMessage);
    setIsLoading(true);

    try {
      let assistantResponse = "";

      for await (const evt of streamBackendChat({
        message: text,
        userId: userId,
        convId: conversationId,
        signal: abortRef.current!.signal,
      })) {
        if (evt.type === "assistant") {
          assistantResponse += evt.content;
        } else if (evt.type === "tool_call") {
          appendMessage({
            id: `tool-${(globalThis.crypto as Crypto | undefined)?.randomUUID?.() ?? Date.now()}`,
            message: `🔧 Tool call: ${JSON.stringify(evt.content)}`,
            sender: "bot",
            timestamp: new Date().toISOString(),
            message_type: "text",
          });
        } else if (evt.type === "tool_message") {
          appendMessage({
            id: `toolmsg-${(globalThis.crypto as Crypto | undefined)?.randomUUID?.() ?? Date.now()}`,
            message: `🧩 Tool message: ${evt.content}`,
            sender: "bot",
            timestamp: new Date().toISOString(),
            message_type: "text",
          });
        } else if (evt.type === "done") {
          break;
        }
      }

      if (assistantResponse.trim()) {
        appendMessage({
          id: `bot-${Date.now()}`,
          message: assistantResponse,
          sender: "bot",
          timestamp: new Date().toISOString(),
          message_type: "text",
        });
      }
    } catch {
      appendMessage({
        id: `err-${Date.now()}`,
        message: "Lo siento, ocurrió un error al procesar tu mensaje.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        message_type: "text",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, conversationId, appendMessage, messages.length, conversationCreated, createConversation, onConversationCreated, updateConversationTitle]);

  return {
    messages,
    isLoading,
    setMessages,
    sendMessage,
    loadConversationHistory,
    createConversation,
    conversationCreated,
  };
}
