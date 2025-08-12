"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  Send,
  Sparkles, 
  TrendingUp, 
  DollarSign,
  BarChart3,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChatSuggestions, { Suggestion } from "@/components/chat/ChatSuggestions";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";
import ChatTypingIndicator from "@/components/chat/ChatTypingIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import Input from "@/components/ui/Input";
import { InvokeLLM } from "@/services/chat/llm";
import { ChatMessage } from "@/services/chat/chatMessage";

export default function Chat() {
  type Message = {
    id: string | number;
    message: string;
    sender: "user" | "bot";
    timestamp: string;
    message_type: "text" | "image" | "file";
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mensaje de bienvenida
    const welcomeMessage: Message = {
      id: 'welcome',
      message: "¡Hola! Soy tu asistente inteligente de costos AWS. Puedo ayudarte a analizar gastos, generar reportes, identificar ahorros y responder preguntas sobre tu facturación. ¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date().toISOString(),
      message_type: "text"
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (messageText = newMessage) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      message: messageText,
      sender: "user",
      timestamp: new Date().toISOString(),
      message_type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      const response = await InvokeLLM({
        prompt: `Eres un asistente experto en costos de AWS. El usuario pregunta: "${messageText}". 
        
        Proporciona una respuesta útil, específica y profesional sobre costos AWS, optimización, servicios, facturación, etc. 
        Si la pregunta requiere datos específicos que no tienes, sugiere cómo el usuario podría obtener esa información.
        Mantén un tono amigable pero profesional.
        
        Algunos ejemplos de lo que puedes ayudar:
        - Explicar servicios AWS y sus costos
        - Sugerir optimizaciones de costos
        - Ayudar a interpretar facturas
        - Recomendar mejores prácticas
        - Analizar patrones de gasto`,
        add_context_from_internet: false
      });

      const botMessage: Message = {
        id: Date.now() + 1,
        message: typeof response === "string" ? response : String(response),
        sender: "bot",
        timestamp: new Date().toISOString(),
        message_type: "text"
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Guardar mensajes en la base de datos
      await ChatMessage.bulkCreate([userMessage, botMessage]);
      
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        message: "Lo siento, ocurrió un error al procesar tu mensaje. Por favor, inténtalo de nuevo.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        message_type: "text"
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
    };

  const suggestions: Suggestion[] = [
    {
      text: "¿Cuáles son mis servicios más costosos?",
      icon: TrendingUp,
      color: "purple"
    },
    {
      text: "¿Cómo puedo reducir costos en EC2?",
      icon: DollarSign,
      color: "green"
    },
    {
      text: "Genera un reporte de costos mensual",
      icon: BarChart3,
      color: "blue"
    },
    {
      text: "¿Qué alertas de presupuesto debo configurar?",
      icon: AlertCircle,
      color: "orange"
    }
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

      {/* Chat Container */}
      <div className="flex-1 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col glass-effect border-purple-200/50">
          {/* Messages Area */}
          <CardContent className="flex-1 p-0 flex flex-col min-h-0">
            <ScrollArea className="flex-1 p-6 max-h-[calc(100vh-250px)]" ref={scrollAreaRef}>
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <ChatMessageBubble key={message.id} message={message} />
                  ))}
                </AnimatePresence>
                
                {isLoading && <ChatTypingIndicator />}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Suggestions (only show when no messages except welcome) */}
            {messages.length <= 1 && (
              <div className="px-6 pb-4">
                <ChatSuggestions
                  suggestions={suggestions}
                  onSuggestionClick={handleSendMessage}
                />
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-purple-100/50 p-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu pregunta sobre costos AWS..."
                    className="pr-12 h-12 rounded-xl border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!newMessage.trim() || isLoading}
                  className="h-12 px-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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