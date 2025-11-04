import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot } from "lucide-react";

interface BotMarkdownBubbleProps {
  id: string | number;
  content: string;
}

export default function BotMarkdownBubble({ id, content }: BotMarkdownBubbleProps) {
  return (
    <div key={id} className="flex w-full">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mr-2">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white/80 shadow border border-purple-100 text-slate-800">
        <div className="max-w-none text-sm">
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
                <p className="mb-2 text-slate-700 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
              ),
              li: ({ children }) => <li className="text-slate-700">{children}</li>,
              code: ({ children, className }) => {
                const isInline = !className;
                if (isInline) {
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
