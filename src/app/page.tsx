'use client';
import { useState } from "react";

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1 className="text-2xl">Contador: {count}</h1>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={() => setCount(count + 1)}
      >
        Aumentar
      </button>
    </div>
  );
}
