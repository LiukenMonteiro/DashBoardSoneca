"use client";

import { useState } from "react";
import { DollarSign, Save, Edit2, TrendingUp } from "lucide-react";

interface QuinzenaFieldProps {
  label: string;
  fixed: number;
  variable: number;
  color: string;
  onSaveFixed: (v: number) => void;
  onSaveVariable: (v: number) => void;
}

function QuinzenaField({ label, fixed, variable, color, onSaveFixed, onSaveVariable }: QuinzenaFieldProps) {
  const [editing, setEditing] = useState(false);
  const [fixedInput, setFixedInput] = useState(fixed.toString());
  const [varInput, setVarInput] = useState(variable > 0 ? variable.toString() : "");

  function handleSave() {
    const f = parseFloat(fixedInput.replace(",", "."));
    const v = parseFloat(varInput.replace(",", "."));
    if (!isNaN(f) && f >= 0) onSaveFixed(f);
    onSaveVariable(!isNaN(v) && v > 0 ? v : 0);
    setEditing(false);
  }

  function handleEdit() {
    setFixedInput(fixed.toString());
    setVarInput(variable > 0 ? variable.toString() : "");
    setEditing(true);
  }

  const total = fixed + variable;

  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-2"
      style={{ background: "rgba(12,12,24,0.82)", border: "1px solid rgba(255,255,255,0.09)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          <span className="text-xs font-semibold text-gray-300">{label}</span>
        </div>
        <button
          onClick={editing ? handleSave : handleEdit}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all"
          style={
            editing
              ? { background: color, color: "#000", fontWeight: 600 }
              : { background: "rgba(255,255,255,0.06)", color: "#9ca3af" }
          }
        >
          {editing ? <><Save size={11} />Ok</> : <><Edit2 size={11} />Editar</>}
        </button>
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Fixo (R$)</span>
            <input
              type="number"
              value={fixedInput}
              onChange={(e) => setFixedInput(e.target.value)}
              autoFocus
              placeholder="2400"
              className="w-full bg-transparent text-sm font-bold outline-none border-b pb-0.5 text-white"
              style={{ borderColor: color }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Variável / Comissão (R$)</span>
            <input
              type="number"
              value={varInput}
              onChange={(e) => setVarInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="0,00"
              className="w-full bg-transparent text-sm font-bold outline-none border-b pb-0.5 text-white"
              style={{ borderColor: color }}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Fixo</span>
              <span className="text-sm font-bold text-white">
                R$ {fixed.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {variable > 0 && (
              <div className="flex items-center gap-1.5">
                <TrendingUp size={11} style={{ color }} />
                <span className="text-xs text-gray-500">Comissão</span>
                <span className="text-sm font-bold" style={{ color }}>
                  +R$ {variable.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">Total</span>
            <p className="text-base font-bold text-white">
              R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface StefaneCardProps {
  q1Fixed: number;
  q1Variable: number;
  q2Fixed: number;
  q2Variable: number;
  q1Total: number;
  q2Total: number;
  mensal: number;
  onSaveQ1Fixed: (v: number) => void;
  onSaveQ1Variable: (v: number) => void;
  onSaveQ2Fixed: (v: number) => void;
  onSaveQ2Variable: (v: number) => void;
}

export function StefaneCard({
  q1Fixed, q1Variable, q2Fixed, q2Variable,
  q1Total, q2Total, mensal,
  onSaveQ1Fixed, onSaveQ1Variable, onSaveQ2Fixed, onSaveQ2Variable,
}: StefaneCardProps) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: "rgba(8,8,20,0.88)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(16px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(34,197,94,0.15)" }}
          >
            <DollarSign size={16} style={{ color: "#22c55e" }} />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-300">Stefane</span>
            <p className="text-xs text-gray-600">Vendedora · fixo + comissão</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Mensal total</p>
          <p className="text-lg font-bold text-green-400">
            R$ {mensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Quinzenas */}
      <QuinzenaField
        label="1ª Quinzena (dias 1–15)"
        fixed={q1Fixed}
        variable={q1Variable}
        color="#22c55e"
        onSaveFixed={onSaveQ1Fixed}
        onSaveVariable={onSaveQ1Variable}
      />
      <QuinzenaField
        label="2ª Quinzena (dias 16–31)"
        fixed={q2Fixed}
        variable={q2Variable}
        color="#4ade80"
        onSaveFixed={onSaveQ2Fixed}
        onSaveVariable={onSaveQ2Variable}
      />

      {/* Resumo */}
      <div
        className="flex items-center justify-between rounded-xl px-3 py-2"
        style={{ background: "rgba(10,30,15,0.85)" }}
      >
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-xs text-gray-500">1ª quinzena</p>
            <p className="text-xs font-bold text-green-400">
              R$ {q1Total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <span className="text-gray-600">+</span>
          <div className="text-center">
            <p className="text-xs text-gray-500">2ª quinzena</p>
            <p className="text-xs font-bold text-green-300">
              R$ {q2Total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">= Mensal</p>
          <p className="text-sm font-bold text-green-400">
            R$ {mensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
