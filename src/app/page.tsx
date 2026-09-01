"use client";

import { useState, useEffect } from "react";
import { Plus, TrendingDown, TrendingUp, Wallet, PieChart, BarChart2, Download, LogOut } from "lucide-react";
import { useAppStore, CATEGORY_COLORS, Category } from "@/lib/store";
import { isAuthenticated, logout } from "@/lib/auth";
import { SalaryCard } from "@/components/SalaryCard";
import { LoginScreen } from "@/components/LoginScreen";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { CategoryPieChart, MonthlyBarChart } from "@/components/Charts";
import { ExpenseList } from "@/components/ExpenseList";
import { exportMonthPdf } from "@/lib/exportPdf";

function fmt(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Home() {
  const store = useAppStore();
  const [authed, setAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeChart, setActiveChart] = useState<"pie" | "bar">("pie");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
    setAuthChecked(true);
  }, []);

  const currentMonth = new Date().toISOString().slice(0, 7);

  async function handleExportPdf() {
    setExporting(true);
    try {
      await exportMonthPdf(store.data, currentMonth);
    } finally {
      setExporting(false);
    }
  }

  function handleLogout() {
    logout();
    setAuthed(false);
  }

  const { data, loaded, totalSalary, totalExpenses, balance, stefaneMensal } = store;
  const balancePositive = balance >= 0;

  const categoryTotals = Object.entries(
    data.expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);

  if (!authChecked || !loaded) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(59,130,246,0.2)" }}
          >
            <Wallet size={24} className="text-blue-400" />
          </div>
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-dvh" style={{ background: "#0a0a0f" }}>
      <div className="max-w-md mx-auto px-4 pb-28 pt-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)" }}
            >
              <Wallet size={18} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">SonecaGastos</h1>
              <p className="text-xs text-gray-500 mt-0.5">Controle de gastos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="text-xs px-2 py-1 rounded-lg font-medium hidden sm:block"
              style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </div>
            <button
              onClick={handleExportPdf}
              disabled={exporting}
              title="Baixar PDF do mês"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50"
              style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}
            >
              <Download size={13} />
              {exporting ? "..." : "PDF"}
            </button>
            <button
              onClick={handleLogout}
              title="Sair"
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <LogOut size={14} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Total salary banner */}
        <div
          className="rounded-2xl p-5 mb-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1e3a5f 0%, #0f1f3d 100%)",
            border: "1px solid rgba(59,130,246,0.3)",
          }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10" style={{ background: "#3b82f6" }} />
          <p className="text-xs text-blue-300 font-medium mb-1">Renda Total do Casal</p>
          <p className="text-3xl font-bold text-white mb-3">R$ {fmt(totalSalary)}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs text-blue-200">Carlos: R$ {fmt(data.carlosSalary)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-blue-200">
                Stefane: R$ {fmt(stefaneMensal)}
                {data.stefaneQuinzenal && <span className="opacity-60"> /mês</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Balance + Expenses row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className="rounded-2xl p-4"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingDown size={14} className="text-red-400" />
              <span className="text-xs text-red-300 font-medium">Total Gastos</span>
            </div>
            <p className="text-xl font-bold text-red-400">R$ {fmt(totalExpenses)}</p>
            <p className="text-xs text-gray-500 mt-1">{data.expenses.length} lançamentos</p>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{
              background: balancePositive ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${balancePositive ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              {balancePositive
                ? <TrendingUp size={14} className="text-green-400" />
                : <TrendingDown size={14} className="text-red-400" />}
              <span className="text-xs font-medium" style={{ color: balancePositive ? "#86efac" : "#fca5a5" }}>
                Saldo Final
              </span>
            </div>
            <p className="text-xl font-bold" style={{ color: balancePositive ? "#22c55e" : "#ef4444" }}>
              R$ {fmt(Math.abs(balance))}
            </p>
            <p className="text-xs text-gray-500 mt-1">{balancePositive ? "disponível" : "negativo"}</p>
          </div>
        </div>

        {/* Salary inputs */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">Salários</p>
          <div className="grid grid-cols-1 gap-3">
            <SalaryCard
              name="Carlos"
              value={data.carlosSalary}
              color="#3b82f6"
              onSave={store.setCarlosSalary}
            />
            <SalaryCard
              name="Stefane"
              value={data.stefaneSalary}
              color="#22c55e"
              onSave={store.setStefaneSalary}
              quinzenal={data.stefaneQuinzenal}
              onToggleQuinzenal={store.setStefaneQuinzenal}
              mensal={stefaneMensal}
            />
          </div>
        </div>

        {/* Charts */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white">Análise de Gastos</p>
            <div className="flex rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
              <button
                onClick={() => setActiveChart("pie")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all"
                style={activeChart === "pie" ? { background: "#3b82f6", color: "#fff" } : { color: "#6b7280" }}
              >
                <PieChart size={13} />Pizza
              </button>
              <button
                onClick={() => setActiveChart("bar")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all"
                style={activeChart === "bar" ? { background: "#3b82f6", color: "#fff" } : { color: "#6b7280" }}
              >
                <BarChart2 size={13} />Mensal
              </button>
            </div>
          </div>

          {activeChart === "pie" ? (
            <>
              <CategoryPieChart expenses={data.expenses} />
              {categoryTotals.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {categoryTotals.map(({ name, value }) => {
                    const color = CATEGORY_COLORS[name as Category] || "#6b7280";
                    const pct = totalExpenses > 0 ? ((value / totalExpenses) * 100).toFixed(0) : 0;
                    return (
                      <div
                        key={name}
                        className="flex items-center gap-2 rounded-xl px-3 py-2"
                        style={{ background: `${color}11` }}
                      >
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 truncate">{name}</p>
                          <p className="text-xs font-bold" style={{ color }}>{pct}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <MonthlyBarChart
              expenses={data.expenses}
              carlosSalary={data.carlosSalary}
              stefaneSalary={stefaneMensal}
            />
          )}
        </div>

        {/* Expense list */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white">Lançamentos</p>
            {data.expenses.length > 0 && (
              <span className="text-xs text-gray-500">{data.expenses.length} no total</span>
            )}
          </div>
          <ExpenseList expenses={data.expenses} onRemove={store.removeExpense} />
        </div>
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-4 z-40">
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-4 rounded-2xl font-bold text-sm shadow-2xl transition-all active:scale-95"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            color: "#fff",
            boxShadow: "0 8px 32px rgba(59,130,246,0.4)",
          }}
        >
          <Plus size={20} />
          Novo Gasto
        </button>
      </div>

      <AddExpenseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={store.addExpense}
      />
    </div>
  );
}
