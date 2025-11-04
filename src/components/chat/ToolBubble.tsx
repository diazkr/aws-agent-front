import React from "react";

interface ToolBubbleProps {
  id: string | number;
  content: string;
}

export default function ToolBubble({ id, content }: ToolBubbleProps) {
  return (
    <div key={id} className="flex w-full">
      <div className="max-w-[80%] rounded-xl px-3 py-2 bg-purple-50/70 border border-purple-200 text-purple-900 text-sm">
        {content}
      </div>
    </div>
  );
}
