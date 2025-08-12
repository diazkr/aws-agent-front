import React from "react";

type ScrollAreaProps = {
  children: React.ReactNode;
  className?: string;
} & Record<string, unknown>;

export function ScrollArea({ children, className = "", ...props }: ScrollAreaProps) {
  return (
    <div
      className={`h-full overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}