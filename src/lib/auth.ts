"use client";

const SESSION_KEY = "sonecagastos_auth";
const LOGIN = "Carlos1234";
const PASSWORD = "Carlos1596";

export function authenticate(login: string, password: string): boolean {
  if (login === LOGIN && password === PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, "1");
    return true;
  }
  return false;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}
