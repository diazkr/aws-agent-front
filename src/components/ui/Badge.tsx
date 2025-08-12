import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "success" | "warning" | "danger" | "info";
}

const variantClasses = {
  default: "bg-purple-100 text-purple-800 border-purple-200",
  outline: "bg-transparent border-purple-200 text-purple-800",
  success: "bg-green-100 text-green-800 border-green-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  danger: "bg-red-100 text-red-800 border-red-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export default Badge;