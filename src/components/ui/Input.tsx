import React from "react";

type InputProps = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  type?: string;
  variant?: "default" | "outline";
};

const variantClasses = {
  default:
    "border-2 border-purple-200/50 focus:border-purple-400 focus:ring-purple-400/20 bg-white rounded-xl shadow-sm",
  outline:
    "border border-purple-200 bg-white rounded-xl focus:border-purple-400 focus:ring-purple-400/20",
};

export default function Input({
  value,
  onChange,
  onKeyPress,
  onKeyDown,
  placeholder,
  disabled = false,
  className = "",
  type = "text",
  variant = "default",
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full h-12 px-4 outline-none transition-all duration-200 text-gray-700 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${variantClasses[variant]} ${className}`}
    />
  );
}