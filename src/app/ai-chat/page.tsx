"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, TrendingUp, DollarSign, BarChart3, AlertCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import ChatSuggestions, { Suggestion } from "@/components/chat/ChatSuggestions";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";
import ChatTypingIndicator from "@/components/chat/ChatTypingIndicator";
import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import Input from "@/components/ui/Input";
import { ChatMessage } from "@/services/chat/chatMessage";
import { streamBackendChat } from "@/services/chat/llm";

// 👇 Markdown
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ------------------------------------------------------
// Tipos
type Message = {
  id: string | number;
  message: string;
  sender: "user" | "bot" | "tool"; // "tool" lo mapearemos visualmente como "bot"
  timestamp: string;
  message_type: "text" | "image" | "file";
};

// ------------------------------------------------------
// Burbujas Markdown/tool simples (si tu ChatMessageBubble no soporta MD)
function BotMarkdownBubble({ id, content }: { id: string | number; content: string }) {
  return (
    <div key={id} className="flex w-full">
      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white/80 shadow border border-purple-100 text-slate-800">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function ToolBubble({ id, content }: { id: string | number; content: string }) {
  return (
    <div key={id} className="flex w-full">
      <div className="max-w-[80%] rounded-xl px-3 py-2 bg-purple-50/70 border border-purple-200 text-purple-900 text-sm">
        {content}
      </div>
    </div>
  );
}

// ------------------------------------------------------

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Puntero al índice del bubble del bot que estamos rellenando
  const activeBotIndexRef = useRef<number | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        message:
          "¡Hola! Soy tu asistente inteligente de costos AWS. Puedo ayudarte a analizar gastos, generar reportes, identificar ahorros y responder preguntas sobre tu facturación. ¿En qué puedo ayudarte hoy?",
        sender: "bot",
        timestamp: new Date().toISOString(),
        message_type: "text",
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const append = (m: Message) => setMessages((prev) => [...prev, m]);

  // Crea un bubble del bot vacío y guarda su índice para ir “streameando” ahí
  const startAssistantBubble = () => {
    setMessages((prev) => {
      const draft = [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          message: "",
          sender: "bot",
          timestamp: new Date().toISOString(),
          message_type: "text",
        } as Message,
      ];
      activeBotIndexRef.current = draft.length - 1;
      return draft;
    });
  };

  const updateActiveAssistant = (delta: string) => {
    setMessages((prev) => {
      const idx =
        activeBotIndexRef.current !== null
          ? activeBotIndexRef.current
          : // fallback defensivo
            [...prev].reverse().findIndex((m) => m.sender === "bot") >= 0
          ? prev.length - 1 - [...prev].reverse().findIndex((m) => m.sender === "bot")
          : null;

      if (idx === null || idx < 0 || idx >= prev.length) {
        // no había burbuja; crea una
        const draft = [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            message: delta,
            sender: "bot",
            timestamp: new Date().toISOString(),
            message_type: "text",
          } as Message,
        ];
        activeBotIndexRef.current = draft.length - 1;
        return draft;
      }

      const copy = [...prev];
      copy[idx] = { ...copy[idx], message: (copy[idx].message ?? "") + delta };
      return copy;
    });
  };

  const handleSendMessage = async (text = newMessage) => {
    if (!text.trim()) return;

    // Cancela stream previo si lo hubiera
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const userMessage: Message = {
      id: Date.now(),
      message: text,
      sender: "user",
      timestamp: new Date().toISOString(),
      message_type: "text",
    };
    append(userMessage);
    setNewMessage("");
    setIsLoading(true);

    try {
      // Prepara el contenedor del assistant a rellenar
      startAssistantBubble();

      // CONSUME EL STREAM DEL BACKEND
      for await (const evt of streamBackendChat({
        message: text,
        userId: "test-1235",
        convId: "31471",
        signal: abortRef.current!.signal,
      })) {
        if (evt.type === "assistant") {
          updateActiveAssistant(evt.content);
        } else if (evt.type === "tool_call") {
          // Píntalo como bot (izquierda) para que no se vea como usuario
          append({
            id: `tool-${(globalThis.crypto as any)?.randomUUID?.() ?? Date.now()}`,
            message: `🔧 Tool call: ${JSON.stringify(evt.content)}`,
            sender: "bot", // <— importante: pinta a la izquierda
            timestamp: new Date().toISOString(),
            message_type: "text",
          });
        } else if (evt.type === "tool_message") {
          append({
            id: `toolmsg-${(globalThis.crypto as any)?.randomUUID?.() ?? Date.now()}`,
            message: `🧩 Tool message: ${evt.content}`,
            sender: "bot", // <— también como bot
            timestamp: new Date().toISOString(),
            message_type: "text",
          });
        } else if (evt.type === "done") {
          break;
        }
      }

      // (Opcional) Persistencia, usando el índice activo
      const finalBot =
        activeBotIndexRef.current !== null
          ? messages[activeBotIndexRef.current] // ojo: podría estar desfasado
          : null;

      // si quieres asegurar texto final, lee del estado “en vivo”:
      let finalBotText = "";
      setMessages((curr) => {
        const idx = activeBotIndexRef.current;
        if (idx !== null && idx >= 0 && idx < curr.length && curr[idx].sender === "bot") {
          finalBotText = curr[idx].message;
        }
        return curr;
      });

      await ChatMessage.bulkCreate([
        userMessage,
        {
          id: `persist-bot-${Date.now()}`,
          message: finalBotText,
          sender: "bot",
          timestamp: new Date().toISOString(),
          message_type: "text",
        } as Message,
      ]);
    } catch (err) {
      console.error(err);
      append({
        id: `err-${Date.now()}`,
        message: "Lo siento, ocurrió un error al procesar tu mensaje.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        message_type: "text",
      });
    } finally {
      setIsLoading(false);
      activeBotIndexRef.current = null; // resetea el puntero
    }
  };

  const suggestions: Suggestion[] = [
    { text: "¿Cuáles son mis servicios más costosos?", icon: TrendingUp, color: "purple" },
    { text: "¿Cómo puedo reducir costos en EC2?", icon: DollarSign, color: "green" },
    { text: "Genera un reporte de costos mensual", icon: BarChart3, color: "blue" },
    { text: "¿Qué alertas de presupuesto debo configurar?", icon: AlertCircle, color: "orange" },
  ];

  return (
    <div className="h-screen flex flex-col p-6">
      <Card className="glass-effect mb-4 p-4">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Asistente Inteligente AWS
          </span>
        </CardTitle>
      </Card>

      <div className="flex-1 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col glass-effect border-purple-200/50">
          <CardContent className="flex-1 p-0 flex flex-col min-h-0">
            <ScrollArea className="flex-1 p-6 max-h-[calc(100vh-250px)]">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((m) => {
                    // Si tu ChatMessageBubble no sabe renderizar markdown, usamos
                    // nuestras “burbujas” simples: bot/tool → MarkdownBubble, user → ChatMessageBubble
                    if (m.sender === "user") {
                      return <ChatMessageBubble key={m.id} message={m} />;
                    }
                    // tool los pintamos como bot (a la izquierda), ya vienen así
                    if (m.message.startsWith("🔧 Tool call") || m.message.startsWith("🧩 Tool message")) {
                      return <ToolBubble key={m.id} content={m.message} />;
                    }
                    // resto (bot): Markdown
                    return <BotMarkdownBubble key={m.id} id={m.id} content={m.message} />;
                  })}
                </AnimatePresence>
                {isLoading && <ChatTypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {messages.length <= 1 && (
              <div className="px-6 pb-4">
                <ChatSuggestions suggestions={suggestions} onSuggestionClick={handleSendMessage} />
              </div>
            )}

            <div className="border-t border-purple-100/50 p-6">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Escribe tu pregunta sobre costos AWS..."
                    className="h-12 rounded-xl border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!newMessage.trim() || isLoading}
                  className="h-12 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-xl shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
