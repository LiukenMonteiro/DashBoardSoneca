"use client";

import { useState, useEffect, useRef } from "react";
import { getDb, ref, onValue, set } from "./firebase";

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

export interface SavingsDeposit {
  id: string;
  amount: number;
  month: string;
}

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
  stefaneQ1Fixed: number;
  stefaneQ1Variable: number;
  stefaneQ2Fixed: number;
  stefaneQ2Variable: number;
  expenses: Expense[];
  savingsDeposits: SavingsDeposit[];
  createdAt: string;
}

const DEFAULT_DATA: AppData = {
  carlosSalary: 0,
  stefaneQ1Fixed: 0,
  stefaneQ1Variable: 0,
  stefaneQ2Fixed: 0,
  stefaneQ2Variable: 0,
  expenses: [],
  savingsDeposits: [],
  createdAt: new Date().toISOString(),
};

const STORAGE_KEY = "sonecagastos_data";
const DB_PATH = "sonecagastos/data";
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

function migrateData(raw: Partial<AppData> & { stefaneSalary?: number }): AppData {
  const q1Fixed = raw.stefaneQ1Fixed ?? raw.stefaneSalary ?? 0;
  return {
    ...DEFAULT_DATA,
    ...raw,
    stefaneQ1Fixed: q1Fixed,
    stefaneQ1Variable: raw.stefaneQ1Variable ?? 0,
    stefaneQ2Fixed: raw.stefaneQ2Fixed ?? q1Fixed,
    stefaneQ2Variable: raw.stefaneQ2Variable ?? 0,
    expenses: raw.expenses ?? [],
    savingsDeposits: raw.savingsDeposits ?? [],
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

function loadLocal(): AppData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    return migrateData(JSON.parse(raw));
  } catch {
    return DEFAULT_DATA;
  }
}

function saveLocal(data: AppData) {
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
  // Ref to avoid writing back to Firebase data that came FROM Firebase
  const remoteUpdate = useRef(false);

  useEffect(() => {
    const db = getDb();

    if (!db) {
      // Fallback: use localStorage only
      setData(loadLocal());
      setLoaded(true);
      return;
    }

    const dataRef = ref(db, DB_PATH);
    const unsub = onValue(dataRef, (snapshot) => {
      const val = snapshot.val() as Partial<AppData> | null;
      if (val) {
        remoteUpdate.current = true;
        setData(migrateData(val));
      } else {
        // Firebase empty — upload local data (first device to connect)
        const local = loadLocal();
        set(dataRef, local);
        setData(local);
      }
      setLoaded(true);
    });

    return unsub;
  }, []);

  function updateData(updater: (prev: AppData) => AppData) {
    setData((prev) => {
      const next = updater(prev);
      const db = getDb();
      if (db) {
        set(ref(db, DB_PATH), next);
      } else {
        saveLocal(next);
      }
      return next;
    });
  }

  function setCarlosSalary(value: number) {
    updateData((d) => ({ ...d, carlosSalary: value }));
  }
  function setStefaneQ1Fixed(value: number) {
    updateData((d) => ({ ...d, stefaneQ1Fixed: value }));
  }
  function setStefaneQ1Variable(value: number) {
    updateData((d) => ({ ...d, stefaneQ1Variable: value }));
  }
  function setStefaneQ2Fixed(value: number) {
    updateData((d) => ({ ...d, stefaneQ2Fixed: value }));
  }
  function setStefaneQ2Variable(value: number) {
    updateData((d) => ({ ...d, stefaneQ2Variable: value }));
  }

  function addExpense(expense: Omit<Expense, "id">) {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString() + Math.random().toString(36).slice(2),
    };
    updateData((d) => ({ ...d, expenses: [newExpense, ...d.expenses] }));
  }

  function removeExpense(id: string) {
    updateData((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }));
  }

  function setSavingsDeposit(month: string, amount: number) {
    updateData((d) => {
      const exists = d.savingsDeposits.some((dep) => dep.month === month);
      if (exists) {
        return {
          ...d,
          savingsDeposits: d.savingsDeposits.map((dep) =>
            dep.month === month ? { ...dep, amount } : dep
          ),
        };
      }
      return {
        ...d,
        savingsDeposits: [
          ...d.savingsDeposits,
          { id: Date.now().toString() + Math.random().toString(36).slice(2), amount, month },
        ],
      };
    });
  }

  const stefaneQ1Total = data.stefaneQ1Fixed + data.stefaneQ1Variable;
  const stefaneQ2Total = data.stefaneQ2Fixed + data.stefaneQ2Variable;
  const stefaneMensal = stefaneQ1Total + stefaneQ2Total;
  const totalSalary = data.carlosSalary + stefaneMensal;
  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const savingsTotal = data.savingsDeposits.reduce((sum, d) => sum + d.amount, 0);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthSavings = data.savingsDeposits.find((d) => d.month === currentMonth)?.amount ?? 0;
  const balance = totalSalary - totalExpenses - currentMonthSavings;
  const sixMonthsAlert = loaded && Date.now() - new Date(data.createdAt).getTime() >= SIX_MONTHS_MS;

  return {
    data,
    loaded,
    setCarlosSalary,
    setStefaneQ1Fixed,
    setStefaneQ1Variable,
    setStefaneQ2Fixed,
    setStefaneQ2Variable,
    stefaneQ1Total,
    stefaneQ2Total,
    stefaneMensal,
    totalSalary,
    totalExpenses,
    savingsTotal,
    currentMonth,
    currentMonthSavings,
    balance,
    sixMonthsAlert,
    addExpense,
    removeExpense,
    setSavingsDeposit,
  };
}
