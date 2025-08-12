'use client';
import { useState } from "react";

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">AWS Cost Overview</h2>
        <div className="bg-gray-50 p-4 rounded-md">
          <p>Bienvenido al gestor de costos de AWS</p>
          <p className="mt-2">Selecciona una opción del menú para comenzar</p>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-2">Contador de prueba</h3>
          <p className="text-2xl font-bold mb-4">{count}</p>
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
            onClick={() => setCount(count + 1)}
          >
            Aumentar
          </button>
        </div>
      </div>
    </div>
  );
}
