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
    if (!isNaN(parsed) && parsed >= 0) {
      onSave(parsed);
    }
    setEditing(false);
  }

  function handleEdit() {
    setInput(value > 0 ? value.toString() : "");
    setEditing(true);
  }

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
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
          {editing ? (
            <>
              <Save size={12} />
              Salvar
            </>
          ) : (
            <>
              <Edit2 size={12} />
              Editar
            </>
          )}
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
            {value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </div>
  );
}
