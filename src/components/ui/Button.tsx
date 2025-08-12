import React from "react";

type ButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "default" | "outline";
};

const variantClasses = {
  default:
    "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600",
  outline:
    "bg-white border hover:bg-purple-50",
};

export default function Button({
  onClick,
  disabled = false,
  className = "",
  children,
  type = "button",
  variant = "default",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`focus:outline-none rounded-xl transition-all duration-300 shadow-lg ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}