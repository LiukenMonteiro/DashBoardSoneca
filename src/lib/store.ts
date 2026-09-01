"use client";

import { useState, useEffect } from "react";

export type Category =
  | "Alimentação"
  | "Moradia"
  | "Transporte"
  | "Saúde"
  | "Lazer"
  | "Educação"
  | "Vestuário"
  | "Outros";

export const CATEGORIES: Category[] = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Saúde",
  "Lazer",
  "Educação",
  "Vestuário",
  "Outros",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Alimentação: "#3b82f6",
  Moradia: "#6366f1",
  Transporte: "#8b5cf6",
  Saúde: "#22c55e",
  Lazer: "#f59e0b",
  Educação: "#06b6d4",
  Vestuário: "#ec4899",
  Outros: "#6b7280",
};

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: Category;
  person: "Carlos" | "Stefane" | "Ambos";
  date: string;
}

export interface AppData {
  carlosSalary: number;
  stefaneSalary: number;
  stefaneQuinzenal: boolean;
  expenses: Expense[];
  createdAt: string; // ISO date — quando os dados foram criados pela primeira vez
}

const DEFAULT_DATA: AppData = {
  carlosSalary: 0,
  // Stefane: R$2.400 por quinzena, variável — pré-configurado
  stefaneSalary: 2400,
  stefaneQuinzenal: true,
  expenses: [],
  createdAt: new Date().toISOString(),
};

const STORAGE_KEY = "sonecagastos_data";
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

function loadData(): AppData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      ...DEFAULT_DATA,
      ...parsed,
      createdAt: parsed.createdAt ?? new Date().toISOString(),
    };
  } catch {
    return DEFAULT_DATA;
  }
}

function saveData(data: AppData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getLastSixMonths(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

export function useAppStore() {
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData(loadData());
    setLoaded(true);
  }, []);

  function updateData(updater: (prev: AppData) => AppData) {
    setData((prev) => {
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }

  function setCarlosSalary(value: number) {
    updateData((d) => ({ ...d, carlosSalary: value }));
  }

  function setStefaneSalary(value: number) {
    updateData((d) => ({ ...d, stefaneSalary: value }));
  }

  function setStefaneQuinzenal(value: boolean) {
    updateData((d) => ({ ...d, stefaneQuinzenal: value }));
  }

  function addExpense(expense: Omit<Expense, "id">) {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString() + Math.random().toString(36).slice(2),
    };
    updateData((d) => ({ ...d, expenses: [newExpense, ...d.expenses] }));
  }

  function removeExpense(id: string) {
    updateData((d) => ({
      ...d,
      expenses: d.expenses.filter((e) => e.id !== id),
    }));
  }

  const stefaneMensal = data.stefaneQuinzenal ? data.stefaneSalary * 2 : data.stefaneSalary;
  const totalSalary = data.carlosSalary + stefaneMensal;
  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalSalary - totalExpenses;

  // Alerta: dados com 6+ meses de idade
  const sixMonthsAlert =
    loaded && Date.now() - new Date(data.createdAt).getTime() >= SIX_MONTHS_MS;

  return {
    data,
    loaded,
    setCarlosSalary,
    setStefaneSalary,
    setStefaneQuinzenal,
    stefaneMensal,
    totalSalary,
    totalExpenses,
    balance,
    sixMonthsAlert,
    addExpense,
    removeExpense,
  };
}
