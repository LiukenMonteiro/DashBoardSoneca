"use client";

import { useState } from "react";
import { PiggyBank, Edit2, Save, ChevronDown } from "lucide-react";
import { SavingsDeposit } from "@/lib/store";

function monthLabel(month: string) {
  const [y, m] = month.split("-");
  const label = new Date(parseInt(y), parseInt(m) - 1).toLocaleString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

interface CaixinhaCardProps {
  deposits: SavingsDeposit[];
  currentMonth: string;
  savingsTotal: number;
  onSetDeposit: (month: string, amount: number) => void;
}

export function CaixinhaCard({ deposits, currentMonth, savingsTotal, onSetDeposit }: CaixinhaCardProps) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const currentDeposit = deposits.find((d) => d.month === currentMonth)?.amount ?? 0;
  const pastDeposits = [...deposits]
    .filter((d) => d.month !== currentMonth)
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 6);

  function handleEdit() {
    setInput(currentDeposit > 0 ? currentDeposit.toString() : "");
    setEditing(true);
  }

  function handleSave() {
    const val = parseFloat(input.replace(",", "."));
    onSetDeposit(currentMonth, !isNaN(val) && val > 0 ? val : 0);
    setEditing(false);
  }

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: "rgba(8,8,20,0.88)",
        border: "1px solid rgba(245,158,11,0.28)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.15)" }}
          >
            <PiggyBank size={16} style={{ color: "#f59e0b" }} />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-300">Caixinha</span>
            <p className="text-xs text-gray-600">Reserva acumulada</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total guardado</p>
          <p className="text-lg font-bold text-amber-400">
            R$ {savingsTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Depósito deste mês */}
      <div
        className="rounded-xl p-3 flex items-center justify-between"
        style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.16)" }}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-500">Guardar este mês</span>
          {editing ? (
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
              placeholder="0,00"
              className="bg-transparent text-sm font-bold outline-none border-b text-white w-36"
              style={{ borderColor: "#f59e0b" }}
            />
          ) : (
            <span className="text-sm font-bold" style={{ color: currentDeposit > 0 ? "#f59e0b" : "#6b7280" }}>
              {currentDeposit > 0
                ? `R$ ${currentDeposit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                : "Nenhum depósito"}
            </span>
          )}
        </div>
        <button
          onClick={editing ? handleSave : handleEdit}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all active:scale-95"
          style={
            editing
              ? { background: "#f59e0b", color: "#000", fontWeight: 600 }
              : { background: "rgba(255,255,255,0.06)", color: "#9ca3af" }
          }
        >
          {editing ? <><Save size={11} />Ok</> : <><Edit2 size={11} />Editar</>}
        </button>
      </div>

      {/* Histórico de depósitos */}
      {pastDeposits.length > 0 && (
        <>
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="flex items-center gap-1 text-xs text-gray-600 self-start transition-colors hover:text-gray-400"
          >
            <ChevronDown
              size={12}
              className="transition-transform duration-200"
              style={{ transform: showHistory ? "rotate(180deg)" : "rotate(0deg)" }}
            />
            Histórico ({pastDeposits.length} {pastDeposits.length === 1 ? "mês" : "meses"})
          </button>

          {showHistory && (
            <div className="flex flex-col gap-2">
              {pastDeposits.map((d) => (
                <div key={d.id} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{monthLabel(d.month)}</span>
                  <span className="text-xs font-semibold text-amber-500">
                    R$ {d.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
