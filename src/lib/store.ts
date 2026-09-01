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
  expenses: Expense[];
}

const DEFAULT_DATA: AppData = {
  carlosSalary: 0,
  stefaneSalary: 0,
  expenses: [],
};

const STORAGE_KEY = "sonecagastos_data";

function loadData(): AppData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    return JSON.parse(raw) as AppData;
  } catch {
    return DEFAULT_DATA;
  }
}

function saveData(data: AppData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

  const totalSalary = data.carlosSalary + data.stefaneSalary;
  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalSalary - totalExpenses;

  return {
    data,
    loaded,
    setCarlosSalary,
    setStefaneSalary,
    addExpense,
    removeExpense,
    totalSalary,
    totalExpenses,
    balance,
  };
}
