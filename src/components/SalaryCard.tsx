"use client";

import { useState } from "react";
import { DollarSign, Save, Edit2 } from "lucide-react";

interface SalaryCardProps {
  name: string;
  value: number;
  color: string;
  onSave: (value: number) => void;
  quinzenal?: boolean;
  onToggleQuinzenal?: (v: boolean) => void;
  mensal?: number; // valor mensal calculado (apenas quando quinzenal)
}

export function SalaryCard({
  name,
  value,
  color,
  onSave,
  quinzenal,
  onToggleQuinzenal,
  mensal,
}: SalaryCardProps) {
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

  const displayValue = value;

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: "rgba(8,8,20,0.88)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(16px)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: `${color}22` }}
          >
            <DollarSign size={16} style={{ color }} />
          </div>
          <span className="text-sm font-medium text-gray-300">{name}</span>
        </div>
        <button
          onClick={editing ? handleSave : handleEdit}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all"
          style={
            editing
              ? { background: color, color: "#000", fontWeight: 600 }
              : { background: "rgba(255,255,255,0.06)", color: "#9ca3af" }
          }
        >
          {editing ? <><Save size={12} />Salvar</> : <><Edit2 size={12} />Editar</>}
        </button>
      </div>

      {editing ? (
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-lg font-bold">R$</span>
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
            placeholder="0,00"
            className="flex-1 bg-transparent text-2xl font-bold outline-none border-b-2 pb-1 text-white"
            style={{ borderColor: color }}
          />
        </div>
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="text-gray-400 text-sm">R$</span>
          <span className="text-2xl font-bold text-white">
            {displayValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {quinzenal && (
            <span className="text-xs text-gray-500 ml-1">/ quinzena</span>
          )}
        </div>
      )}

      {/* Toggle quinzenal (apenas para Stefane) */}
      {onToggleQuinzenal !== undefined && (
        <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Recebe por quinzena</span>
            {quinzenal && mensal !== undefined && (
              <span className="text-xs" style={{ color }}>
                Mensal: R$ {mensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>
          <button
            onClick={() => onToggleQuinzenal(!quinzenal)}
            className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
            style={{ background: quinzenal ? color : "rgba(255,255,255,0.1)" }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
              style={{ transform: quinzenal ? "translateX(20px)" : "translateX(0)" }}
            />
          </button>
        </div>
      )}
    </div>
  );
}
