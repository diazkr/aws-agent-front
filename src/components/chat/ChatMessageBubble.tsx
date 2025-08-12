import React from 'react';
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { format } from "date-fns";

type ChatMessage = {
  sender: 'bot' | 'user';
  message: string;
  timestamp: string | number | Date;
};

export default function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isBot = message.sender === 'bot';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isBot 
          ? 'bg-gradient-to-br from-purple-500 to-indigo-500' 
          : 'bg-gradient-to-br from-slate-400 to-slate-600'
      }`}>
        {isBot ? (
          <Bot className="w-4 h-4 text-white" />
        ) : (
          <User className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`max-w-lg md:max-w-xl lg:max-w-2xl ${isBot ? 'mr-auto' : 'ml-auto'}`}>
        <div className={`p-4 rounded-2xl shadow-sm ${
          isBot 
            ? 'bg-white border border-purple-100/50 text-slate-800' 
            : 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.message}
          </p>
        </div>
        
        <p className={`text-xs text-slate-400 mt-2 ${isBot ? 'text-left' : 'text-right'}`}>
          {format(new Date(message.timestamp), 'HH:mm')}
        </p>
      </div>
    </motion.div>
  );
}