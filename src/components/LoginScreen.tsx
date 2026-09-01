"use client";

import { useState } from "react";
import { Wallet, Eye, EyeOff, Lock } from "lucide-react";
import { authenticate } from "@/lib/auth";

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const ok = authenticate(login.trim(), password);
    setLoading(false);
    if (ok) {
      onLogin();
    } else {
      setError(true);
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{ background: "#0a0a0f" }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "rgba(59,130,246,0.15)",
            border: "1px solid rgba(59,130,246,0.3)",
            boxShadow: "0 0 32px rgba(59,130,246,0.2)",
          }}
        >
          <Wallet size={32} className="text-blue-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">SonecaGastos</h1>
          <p className="text-sm text-gray-500 mt-1">Controle de gastos do casal</p>
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-3xl p-6 flex flex-col gap-5"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Lock size={14} className="text-gray-500" />
          <span className="text-sm text-gray-400 font-medium">Acesso restrito</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium">Login</label>
            <input
              type="text"
              value={login}
              onChange={(e) => { setLogin(e.target.value); setError(false); }}
              placeholder="Digite seu login"
              autoComplete="username"
              required
              className="w-full rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium">Senha</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                required
                className="w-full rounded-xl px-4 py-3.5 pr-12 text-white text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p
              className="text-xs text-center py-2 rounded-xl"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
            >
              Login ou senha incorretos
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95 disabled:opacity-70 mt-1"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              color: "#fff",
              boxShadow: "0 6px 24px rgba(59,130,246,0.35)",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      <p className="text-xs text-gray-700 mt-8">Carlos &amp; Stefane © {new Date().getFullYear()}</p>
    </div>
  );
}
