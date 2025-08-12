import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md border border-purple-100/50 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-6 pt-6 pb-2 ${className}`}>{children}</div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h2 className={`font-bold text-xl text-purple-700 ${className}`}>{children}</h2>
  );
}

export function CardContent({ children, className = "" }) {
  return (
    <div className={`px-6 pb-6 ${className}`}>{children}</div>
  );
}