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
      className="rounded-2xl px-4 py-3 flex flex-col gap-2"
      style={{ background: "rgba(8,8,20,0.88)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(16px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}22` }}
          >
            <DollarSign size={16} style={{ color }} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">{name}</p>
            <p className="text-xs text-gray-600">Salário mensal</p>
          </div>
        </div>
        <button
          onClick={editing ? handleSave : handleEdit}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all active:scale-95"
          style={
            editing
              ? { background: color, color: "#000", fontWeight: 600 }
              : { background: "rgba(255,255,255,0.06)", color: "#9ca3af" }
          }
        >
          {editing ? <><Save size={11} />Ok</> : <><Edit2 size={11} />Editar</>}
        </button>
      </div>

      {/* Valor / Input */}
      {editing ? (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Valor (R$)</span>
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
            placeholder="0,00"
            className="w-full bg-transparent text-base font-bold outline-none border-b pb-0.5 text-white"
            style={{ borderColor: color }}
          />
        </div>
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-gray-500">R$</span>
          <span className="text-base font-bold text-white">
            {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </div>
  );
}
