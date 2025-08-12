import React from 'react';
import { motion } from "framer-motion";
import Button from '../ui/Button';

export type Suggestion = {
  text: string;
  color: 'purple' | 'green' | 'blue' | 'orange';
  icon: React.ComponentType<{ className?: string }>;
};

type ChatSuggestionsProps = {
  suggestions: Suggestion[];
  onSuggestionClick: (text: string) => void;
};



export default function ChatSuggestions({ suggestions, onSuggestionClick }: ChatSuggestionsProps) {
  const colorClasses = {
    purple: "border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700",
    green: "border-green-200 hover:border-green-300 hover:bg-green-50 text-green-700",
    blue: "border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700",
    orange: "border-orange-200 hover:border-orange-300 hover:bg-orange-50 text-orange-700"
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-600 text-center">
        Sugerencias para empezar:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              onClick={() => onSuggestionClick(suggestion.text)}
              className={`w-full h-auto p-3 text-left justify-start gap-3 ${colorClasses[suggestion.color]} transition-all duration-200 flex`}
            >
              <suggestion.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{suggestion.text}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}