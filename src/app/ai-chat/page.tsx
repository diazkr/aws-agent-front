"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Send, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/KeycloakProvider";

import ChatSuggestions from "@/components/chat/ChatSuggestions";
import ChatMessages from "@/components/chat/ChatMessages";
import BudgetSlider from "@/components/chat/BudgetSlider";
import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";

import { useChatConversation } from "@/hooks/useChatConversation";
import { useBudgetDeviations } from "@/hooks/useBudgetDeviations";

import { createWelcomeMessage, createLearnMoreMessage } from "@/utils/chatHelpers";
import { DEFAULT_CHAT_SUGGESTIONS } from "@/constants/chatSuggestions";

export default function Chat() {
  const searchParams = useSearchParams();
  const { userInfo } = useAuth();
  const mode = searchParams.get('mode');
  const urlUserId = searchParams.get('user_id');
  const urlConvId = searchParams.get('conv_id');

  const userId = urlUserId || userInfo?.username || "";
  
  // Generar un ID estable para nuevas conversaciones
  const conversationId = useMemo(() => {
    if (urlConvId) return urlConvId;
    
    // Para nuevas conversaciones, usar un ID basado en la sesión y parámetros
    const sessionKey = `${userId}-${mode || 'budget'}-${Date.now()}`;
    const hash = sessionKey.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash).toString(16).substring(0, 16);
  }, [urlConvId, userId, mode]);

  const [newMessage, setNewMessage] = useState("");
  const [lastConversationId, setLastConversationId] = useState(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    setMessages,
    sendMessage,
    loadConversationHistory,
  } = useChatConversation({ 
    userId, 
    conversationId,
    onConversationCreated: () => {}
  });

  const isExistingConversation = !!urlConvId;
  const isNewCleanChat = mode === 'clean' && !urlConvId;
  const isBudgetMode = !mode && !urlConvId;

  const {
    budgets,
    budgetsLoading,
    currentSlide,
    setCurrentSlide,
  } = useBudgetDeviations({
    userId,
    conversationId,
    enabled: isBudgetMode
  });

  useEffect(() => {
    const initializeChat = async () => {
      if (!userId) return;

      if (lastConversationId !== conversationId) {
        setMessages([]);
        setLastConversationId(conversationId);
      }

      if (isExistingConversation) {
        const result = await loadConversationHistory();
        if (!result.success) {
          setMessages([{
            id: "error",
            message: "No se pudo cargar el historial de la conversación.",
            sender: "bot",
            timestamp: new Date().toISOString(),
            message_type: "text",
          }]);
        }
      } else if (isNewCleanChat) {
        setMessages([createWelcomeMessage(true)]);
      } else if (isBudgetMode) {
        setMessages([createWelcomeMessage(false)]);
      } else {
        setMessages([]);
      }
    };

    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, conversationId, isNewCleanChat, isBudgetMode, isExistingConversation, lastConversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLearnMore = (budgetName: string) => {
    const detailMessage = createLearnMoreMessage(budgetName);
    setNewMessage(detailMessage);

    const input = document.querySelector('input[placeholder*="Escribe"]') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  };

  const handleSendMessage = async (text = newMessage) => {
    if (!text.trim()) return;
    setNewMessage("");
    await sendMessage(text);
  };

  // Solo mostrar sugerencias en nuevos chats clean
  const shouldShowSuggestions = messages.length <= 1 && isNewCleanChat;

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
                <ChatMessages messages={messages} isLoading={isLoading} />

                {isBudgetMode && messages.length === 1 && messages[0].id === "welcome" && (
                  <div className="mt-4">
                    <BudgetSlider
                      budgets={budgets}
                      budgetsLoading={budgetsLoading}
                      currentSlide={currentSlide}
                      onSlideChange={setCurrentSlide}
                      onLearnMore={handleLearnMore}
                    />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {shouldShowSuggestions && (
              <div className="px-6 pb-4">
                <ChatSuggestions
                  suggestions={DEFAULT_CHAT_SUGGESTIONS}
                  onSuggestionClick={handleSendMessage}
                />
              </div>
            )}

            <div className="border-t border-purple-100/50 p-6">
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newMessage.trim() && !isLoading) {
                          handleSendMessage();
                        }
                      }
                    }}
                    placeholder="Escribe tu pregunta sobre costos AWS..."
                    disabled={isLoading}
                    className="w-full h-12 px-4 outline-none transition-all duration-200 text-gray-700 border-2 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 bg-white rounded-xl shadow-sm"
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
