"use client";

import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { CATEGORY_COLORS, Category, Expense } from "@/lib/store";

interface ExpenseListProps {
  expenses: Expense[];
  onRemove: (id: string) => void;
}

export function ExpenseList({ expenses, onRemove }: ExpenseListProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? expenses : expenses.slice(0, 5);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <div className="text-5xl opacity-20">💸</div>
        <p className="text-gray-500 text-sm">Nenhum gasto ainda</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {visible.map((expense) => {
        const color = CATEGORY_COLORS[expense.category as Category] || "#6b7280";
        const dateStr = new Date(expense.date + "T00:00:00").toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        });

        return (
          <div
            key={expense.id}
            className="flex items-center gap-3 rounded-xl p-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div
              className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: `${color}22` }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-white truncate">{expense.description}</p>
                <p className="text-sm font-bold text-red-400 flex-shrink-0">
                  −R$ {expense.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-xs px-1.5 py-0.5 rounded-md"
                  style={{ background: `${color}22`, color }}
                >
                  {expense.category}
                </span>
                <span className="text-xs text-gray-500">{expense.person}</span>
                <span className="text-xs text-gray-600">{dateStr}</span>
              </div>
            </div>
            <button
              onClick={() => onRemove(expense.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-all active:scale-95"
              style={{ background: "rgba(239,68,68,0.1)" }}
            >
              <Trash2 size={13} className="text-red-500" />
            </button>
          </div>
        );
      })}

      {expenses.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center gap-1 py-2 text-sm text-gray-500 transition-colors hover:text-gray-300"
        >
          {expanded ? (
            <>
              <ChevronUp size={14} /> Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown size={14} /> Ver todos ({expenses.length - 5} mais)
            </>
          )}
        </button>
      )}
    </div>
  );
}
