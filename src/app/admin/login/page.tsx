"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password,
    });
    if (error) {
      setError("Correo o contraseña incorrectos.");
      setCargando(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  const input =
    "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-chamoy focus-visible:ring-4 focus-visible:ring-chamoy/20";

  return (
    <div className="flex min-h-dvh items-center justify-center px-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-3xl border border-line bg-surface p-8 shadow-xl"
      >
        <div className="mb-6 flex items-center gap-2">
          <Logo height="h-11" />
          <span className="ml-auto text-xs text-faint">Panel admin</span>
        </div>

        <h1 className="font-display text-2xl font-semibold">Inicia sesión</h1>
        <p className="mb-6 mt-1 text-sm text-muted">
          Acceso al panel de administración.
        </p>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block font-semibold">Correo</span>
          <input
            className={input}
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="mb-4 block text-sm">
          <span className="mb-1 block font-semibold">Contraseña</span>
          <input
            className={input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        {error && (
          <p className="mb-4 rounded-lg bg-chamoy/10 px-3 py-2 text-sm text-chamoy">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-full bg-chamoy px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-chamoy/25 transition-transform enabled:hover:scale-[1.02] disabled:opacity-50"
        >
          {cargando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
