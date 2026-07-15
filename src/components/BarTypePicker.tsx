import Link from "next/link";
import Logo from "@/components/Logo";
import type { TipoBarra } from "@/lib/types";

// Pantalla de selección de tipo de barra (paso previo al configurador).
export default function BarTypePicker({ tipos }: { tipos: TipoBarra[] }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-4xl items-center px-6 pt-8">
        <Link href="/">
          <Logo height="h-12" />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <p className="animate-rise mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-chamoy">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-chamoy" />
          Paso 1 · Elige tu barra
        </p>
        <h1 className="animate-rise font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          ¿Qué tipo de barra quieres?
        </h1>
        <p className="animate-rise mt-3 max-w-xl text-lg text-muted">
          Elige el estilo de tu evento y arma tu barra a tu gusto en menos de 3
          minutos.
        </p>

        <div className="animate-rise mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tipos.map((t) => (
            <Link
              key={t.id}
              href={`/configura/${t.slug}`}
              className="group flex flex-col rounded-3xl border border-line bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-chamoy/60 hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-chamoy/30"
            >
              <span className="text-4xl">{t.emoji}</span>
              <span className="mt-4 font-display text-xl font-semibold">
                {t.nombre}
              </span>
              {t.descripcion && (
                <span className="mt-1 flex-1 text-sm text-muted">
                  {t.descripcion}
                </span>
              )}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-chamoy">
                Diseñar
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>

        {tipos.length === 0 && (
          <div className="mt-10 rounded-2xl border border-line bg-surface-2 p-6 text-muted">
            Por ahora no hay barras disponibles. Vuelve pronto. 🙂
          </div>
        )}
      </main>
    </div>
  );
}
