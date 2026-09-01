"use client";

import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { CATEGORY_COLORS, Category, Expense } from "@/lib/store";

interface CategoryChartProps {
  expenses: Expense[];
}

function fmtBRL(val: unknown): string {
  const n = typeof val === "number" ? val : parseFloat(String(val));
  if (isNaN(n)) return String(val);
  return `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export function CategoryPieChart({ expenses }: CategoryChartProps) {
  const data = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({
      name,
      value,
      fill: CATEGORY_COLORS[name as Category] || "#6b7280",
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2">
        <div className="text-4xl opacity-20">📊</div>
        <p className="text-gray-500 text-sm">Nenhum gasto registrado</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        />
        <Tooltip
          contentStyle={{
            background: "#1a1a2e",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            color: "#fff",
            fontSize: 13,
          }}
          formatter={(value) => [fmtBRL(value), ""]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface MonthlyChartProps {
  expenses: Expense[];
  carlosSalary: number;
  stefaneSalary: number;
}

export function MonthlyBarChart({ expenses, carlosSalary, stefaneSalary }: MonthlyChartProps) {
  const monthMap: Record<string, { carlos: number; stefane: number; ambos: number }> = {};

  expenses.forEach((e) => {
    const d = new Date(e.date + "T00:00:00");
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[key]) monthMap[key] = { carlos: 0, stefane: 0, ambos: 0 };
    if (e.person === "Carlos") monthMap[key].carlos += e.amount;
    else if (e.person === "Stefane") monthMap[key].stefane += e.amount;
    else monthMap[key].ambos += e.amount;
  });

  const sortedKeys = Object.keys(monthMap).sort().slice(-6);

  const data = sortedKeys.map((key) => {
    const [year, month] = key.split("-");
    const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleString("pt-BR", {
      month: "short",
    });
    const { carlos, stefane, ambos } = monthMap[key];
    return {
      mes: label.charAt(0).toUpperCase() + label.slice(1),
      Carlos: parseFloat((carlos + ambos / 2).toFixed(2)),
      Stefane: parseFloat((stefane + ambos / 2).toFixed(2)),
    };
  });

  if (data.length === 0) {
    if (carlosSalary > 0 || stefaneSalary > 0) {
      const label = new Date().toLocaleString("pt-BR", { month: "short" });
      data.push({
        mes: label.charAt(0).toUpperCase() + label.slice(1),
        Carlos: 0,
        Stefane: 0,
      });
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <div className="text-4xl opacity-20">📈</div>
          <p className="text-gray-500 text-sm">Adicione gastos para ver o gráfico</p>
        </div>
      );
    }
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={4} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="mes"
          tick={{ fill: "#6b7280", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `R$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
          width={52}
        />
        <Tooltip
          contentStyle={{
            background: "#1a1a2e",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            color: "#fff",
            fontSize: 13,
          }}
          formatter={(value, name) => [fmtBRL(value), name]}
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: "#9ca3af", fontSize: 12 }}>{value}</span>
          )}
        />
        <Bar dataKey="Carlos" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        <Bar dataKey="Stefane" fill="#22c55e" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
