"use client";

import type { Producto } from "@/lib/types";

interface Props {
  productos: Producto[];
  seleccionados: string[];
  limite: number;
  onToggle: (id: string) => void;
}

// Cuadrícula de productos con regla de límite: al llegar al máximo,
// las opciones no elegidas se bloquean visualmente.
export default function ProductGrid({
  productos,
  seleccionados,
  limite,
  onToggle,
}: Props) {
  const alcanzado = seleccionados.length >= limite;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {productos.map((p) => {
        const activo = seleccionados.includes(p.id);
        const bloqueado = (!activo && alcanzado) || !p.disponible;

        return (
          <button
            key={p.id}
            type="button"
            disabled={bloqueado}
            aria-pressed={activo}
            onClick={() => onToggle(p.id)}
            className={[
              "relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-all",
              "focus:outline-none focus-visible:ring-4 focus-visible:ring-chamoy/30",
              activo
                ? "border-chamoy bg-chamoy/8 shadow-md shadow-chamoy/10"
                : bloqueado
                  ? "cursor-not-allowed border-line bg-surface-2 opacity-45"
                  : "border-line bg-surface hover:-translate-y-0.5 hover:border-chamoy/50 hover:shadow-md",
            ].join(" ")}
          >
            {p.imagenUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.imagenUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span className="text-2xl" aria-hidden>
                {p.emoji}
              </span>
            )}
            <span className="flex-1 text-sm font-semibold leading-tight">
              {p.nombre}
            </span>

            {activo && (
              <span className="animate-pop absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-chamoy text-[11px] font-bold text-white">
                ✓
              </span>
            )}
            {bloqueado && p.disponible && (
              <span className="absolute right-2 top-2 text-xs opacity-60" aria-hidden>
                🔒
              </span>
            )}
            {!p.disponible && (
              <span className="absolute right-2 top-2 rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                Agotado
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
