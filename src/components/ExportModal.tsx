"use client";

import { useState } from "react";
import { X, Download, Calendar, CalendarRange } from "lucide-react";
import { AppData, getLastSixMonths } from "@/lib/store";
import { exportMonthPdf, exportSixMonthsPdf } from "@/lib/exportPdf";

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  data: AppData;
  stefaneMensal: number;
}

export function ExportModal({ open, onClose, data, stefaneMensal }: ExportModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const sixMonths = getLastSixMonths();
  const currentMonth = new Date().toISOString().slice(0, 7);

  async function handleMonth(month: string) {
    setLoading(month);
    await exportMonthPdf(data, month);
    setLoading(null);
    onClose();
  }

  async function handleSixMonths() {
    setLoading("6m");
    await exportSixMonthsPdf(data, sixMonths, stefaneMensal);
    setLoading(null);
    onClose();
  }

  if (!open) return null;

  function monthLabel(m: string) {
    const [y, mo] = m.split("-");
    const label = new Date(parseInt(y), parseInt(mo) - 1).toLocaleString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Baixar Extrato</h2>
            <p className="text-xs text-gray-500 mt-0.5">Escolha o período</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Últimos 6 meses */}
        <button
          onClick={handleSixMonths}
          disabled={!!loading}
          className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all active:scale-95 disabled:opacity-60"
          style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(59,130,246,0.2)" }}
          >
            <CalendarRange size={20} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Últimos 6 meses</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {monthLabel(sixMonths[0])} → {monthLabel(sixMonths[5])}
            </p>
          </div>
          {loading === "6m" ? (
            <span className="text-xs text-blue-400">Gerando...</span>
          ) : (
            <Download size={16} className="text-blue-400" />
          )}
        </button>

        {/* Meses individuais */}
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider px-1 mb-1">
            Mês específico
          </p>
          {sixMonths.map((m) => {
            const isCurrent = m === currentMonth;
            const hasExpenses = data.expenses.some((e) => e.date.startsWith(m));
            return (
              <button
                key={m}
                onClick={() => handleMonth(m)}
                disabled={!!loading}
                className="flex items-center justify-between px-4 py-3 rounded-xl transition-all active:scale-95 disabled:opacity-60"
                style={{
                  background: isCurrent ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isCurrent ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-300">{monthLabel(m)}</span>
                  {isCurrent && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md"
                      style={{ background: "rgba(59,130,246,0.2)", color: "#60a5fa" }}
                    >
                      atual
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasExpenses && (
                    <span className="text-xs text-gray-600">
                      {data.expenses.filter((e) => e.date.startsWith(m)).length} lançamentos
                    </span>
                  )}
                  {loading === m ? (
                    <span className="text-xs text-gray-400">Gerando...</span>
                  ) : (
                    <Download size={13} className="text-gray-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
