"use client";

import { useState } from "react";
import { DollarSign, Save, Edit2 } from "lucide-react";

interface SalaryCardProps {
  name: string;
  value: number;
  color: string;
  onSave: (value: number) => void;
}

export function SalaryCard({ name, value, color, onSave }: SalaryCardProps) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(value.toString());

  function handleSave() {
    const parsed = parseFloat(input.replace(",", "."));
    if (!isNaN(parsed) && parsed >= 0) onSave(parsed);
    setEditing(false);
  }

  function handleEdit() {
    setInput(value > 0 ? value.toString() : "");
    setEditing(true);
  }

  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
      style={{ background: "rgba(8,8,20,0.88)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(16px)" }}
    >
      {/* Esquerda: ícone + nome */}
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}22` }}
        >
          <DollarSign size={16} style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-300 truncate">{name}</p>
          <p className="text-xs text-gray-600">Salário mensal</p>
        </div>
      </div>

      {/* Direita: valor + botão */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {editing ? (
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
            placeholder="0,00"
            className="w-28 bg-transparent text-base font-bold outline-none border-b text-right text-white"
            style={{ borderColor: color }}
          />
        ) : (
          <div className="text-right">
            <p className="text-xs text-gray-500">Mensal</p>
            <p className="text-base font-bold text-white">
              R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}
        <button
          onClick={editing ? handleSave : handleEdit}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all active:scale-95 flex-shrink-0"
          style={
            editing
              ? { background: color, color: "#000", fontWeight: 600 }
              : { background: "rgba(255,255,255,0.06)", color: "#9ca3af" }
          }
        >
          {editing ? <><Save size={11} />Ok</> : <><Edit2 size={11} />Editar</>}
        </button>
      </div>
    </div>
  );
}
