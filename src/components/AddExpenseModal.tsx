"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { CATEGORIES, CATEGORY_COLORS, Category, Expense } from "@/lib/store";

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<Expense, "id">) => void;
}

export function AddExpenseModal({ open, onClose, onAdd }: AddExpenseModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Alimentação");
  const [person, setPerson] = useState<"Carlos" | "Stefane" | "Ambos">("Ambos");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(",", "."));
    if (!description.trim() || isNaN(parsed) || parsed <= 0) return;
    onAdd({ description: description.trim(), amount: parsed, category, person, date });
    setDescription("");
    setAmount("");
    setCategory("Alimentação");
    setPerson("Ambos");
    setDate(new Date().toISOString().split("T")[0]);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 flex flex-col gap-5"
        style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Novo Gasto</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Supermercado"
              required
              className="w-full rounded-xl px-4 py-3 text-white outline-none text-sm"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs text-gray-400 font-medium">Valor (R$)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                min="0.01"
                step="0.01"
                required
                className="w-full rounded-xl px-4 py-3 text-white outline-none text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs text-gray-400 font-medium">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-white outline-none text-sm"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  colorScheme: "dark",
                }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium">Categoria</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className="rounded-xl py-2 px-1 text-xs font-medium transition-all text-center"
                  style={
                    category === cat
                      ? {
                          background: `${CATEGORY_COLORS[cat]}33`,
                          border: `1px solid ${CATEGORY_COLORS[cat]}`,
                          color: CATEGORY_COLORS[cat],
                        }
                      : {
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          color: "#6b7280",
                        }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium">Responsável</label>
            <div className="flex gap-2">
              {(["Carlos", "Stefane", "Ambos"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPerson(p)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={
                    person === p
                      ? { background: "#3b82f6", color: "#fff" }
                      : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#6b7280" }
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: "#3b82f6", color: "#fff" }}
          >
            <Plus size={18} />
            Adicionar Gasto
          </button>
        </form>
      </div>
    </div>
  );
}
