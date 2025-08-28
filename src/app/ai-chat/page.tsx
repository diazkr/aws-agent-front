"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, TrendingUp, DollarSign, BarChart3, AlertCircle, Bot } from "lucide-react";
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

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import BudgetCard from "@/components/chat/BudgetCard";
import { getBudgetDeviations, BudgetDeviation } from "@/services/budget/budgetService";

type Message = {
  id: string | number;
  message: string;
  sender: "user" | "bot" | "tool";
  timestamp: string;
  message_type: "text" | "image" | "file";
};

// ------------------------------------------------------
// Burbujas Markdown/tool simples (si tu ChatMessageBubble no soporta MD)
function BotMarkdownBubble({ id, content }: { id: string | number; content: string }) {
  return (
    <div key={id} className="flex w-full">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mr-2">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white/80 shadow border border-purple-100 text-slate-800">
        <div className="prose prose-sm max-w-none prose-slate">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border-collapse border border-gray-300 rounded-lg">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => <thead className="bg-purple-50">{children}</thead>,
              tbody: ({ children }) => <tbody className="bg-white">{children}</tbody>,
              tr: ({ children }) => <tr className="border-b border-gray-200 hover:bg-gray-50">{children}</tr>,
              th: ({ children }) => (
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-purple-800 bg-purple-100">
                  {children}
                </th>
              ),
              td: ({ children }) => <td className="border border-gray-300 px-4 py-2 text-sm">{children}</td>,
              // Estilos adicionales para otros elementos
              h1: ({ children }) => (
                <h1 className="text-xl font-bold text-slate-800 mb-3 mt-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold text-slate-700 mb-2 mt-3">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-medium text-slate-700 mb-2 mt-2">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-2 text-slate-700 leading-relaxed">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-3 space-y-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-3 space-y-1">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="text-slate-700">{children}</li>,
              code: ({ inline, children }) => {
                if (inline) {
                  return (
                    <code className="bg-purple-50 text-purple-800 px-1 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  );
                }
                return (
                  <pre className="bg-slate-100 p-3 rounded-lg overflow-x-auto mb-3">
                    <code className="text-sm font-mono text-slate-800">{children}</code>
                  </pre>
                );
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-purple-300 pl-4 italic text-slate-600 my-3">
                  {children}
                </blockquote>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
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
  const [budgets, setBudgets] = useState<BudgetDeviation[]>([]);
  const [budgetsLoading, setBudgetsLoading] = useState(true);

  // Puntero al índice del bubble del bot que estamos rellenando
  const activeBotIndexRef = useRef<number | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cargar mensaje inicial
    setMessages([
      {
        id: "welcome",
        message: "¡Hola Karen! 👋 Estos son los presupuestos con mayor desviación del día de hoy:",
        sender: "bot",
        timestamp: new Date().toISOString(),
        message_type: "text",
      },
    ]);

    // Cargar presupuestos automáticamente
    const loadBudgets = async () => {
      try {
        setBudgetsLoading(true);
        const budgetData = await getBudgetDeviations({
          user_id: "karen-user",
          conv_id: "budget-daily-check"
        });
        setBudgets(budgetData.budgets);
      } catch (error) {
        console.error("Error cargando presupuestos:", error);
        setBudgets([]);
      } finally {
        setBudgetsLoading(false);
      }
    };

    loadBudgets();
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
      // ❌ NO crear la burbuja del bot al inicio
      // startAssistantBubble();

      // Variable para acumular la respuesta del asistente
      let assistantResponse = "";

      // CONSUME EL STREAM DEL BACKEND
      for await (const evt of streamBackendChat({
        message: text,
        userId: "test-32",
        convId: "999991828323",
        signal: abortRef.current!.signal,
      })) {
        if (evt.type === "assistant") {
          // Solo acumular, NO mostrar todavía
          assistantResponse += evt.content;
        } else if (evt.type === "tool_call") {
          // Estos SÍ se agregan inmediatamente
          append({
            id: `tool-${(globalThis.crypto as any)?.randomUUID?.() ?? Date.now()}`,
            message: `🔧 Tool call: ${JSON.stringify(evt.content)}`,
            sender: "bot",
            timestamp: new Date().toISOString(),
            message_type: "text",
          });
        } else if (evt.type === "tool_message") {
          // Estos SÍ se agregan inmediatamente
          append({
            id: `toolmsg-${(globalThis.crypto as any)?.randomUUID?.() ?? Date.now()}`,
            message: `🧩 Tool message: ${evt.content}`,
            sender: "bot",
            timestamp: new Date().toISOString(),
            message_type: "text",
          });
        } else if (evt.type === "done") {
          break;
        }
      }

      // ✅ AHORA crear la respuesta final del bot AL FINAL
      if (assistantResponse.trim()) {
        append({
          id: `bot-${Date.now()}`,
          message: assistantResponse,
          sender: "bot",
          timestamp: new Date().toISOString(),
          message_type: "text",
        });
      }

      // Persistencia
      await ChatMessage.bulkCreate([
        userMessage,
        {
          id: `persist-bot-${Date.now()}`,
          message: assistantResponse,
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
      activeBotIndexRef.current = null;
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
                    console.log("Rendering message:", m);
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
                    if (m.sender === "bot" && m.message.trim()) {
                      return <BotMarkdownBubble key={m.id} id={m.id} content={m.message} />;
                    }
                    return null;

                    // Fallback
                  })}
                </AnimatePresence>
                
                {/* Sección de presupuestos después del mensaje de bienvenida */}
                {messages.length === 1 && messages[0].id === "welcome" && (
                  <div className="mt-4">
                    {budgetsLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        <span className="ml-3 text-purple-600">Cargando presupuestos...</span>
                      </div>
                    ) : budgets.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {budgets.map((budget, index) => (
                          <BudgetCard key={index} budget={budget} />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                        <p className="text-red-700 text-sm">No se pudieron cargar los presupuestos</p>
                      </div>
                    )}
                  </div>
                )}
                
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
