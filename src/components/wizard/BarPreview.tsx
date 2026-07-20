"use client";

import { extraDe, productoDe } from "@/lib/catalog-helpers";
import type { Catalogo, Seleccion } from "@/lib/types";

// Render en tiempo real: la barra se va "llenando" con lo que el
// usuario elige. En el MVP usamos emojis; en Fase 2 será una
// ilustración por capas.
export default function BarPreview({
  seleccion,
  catalogo,
}: {
  seleccion: Seleccion;
  catalogo: Catalogo;
}) {
  const items: {
    id: string;
    emoji: string;
    nombre: string;
    imagenUrl?: string | null;
  }[] = [];

  for (const cat of catalogo.categorias) {
    for (const id of seleccion.productos[cat.id] ?? []) {
      const p = productoDe(catalogo, id);
      if (p)
        items.push({
          id: p.id,
          emoji: p.emoji,
          nombre: p.nombre,
          imagenUrl: p.imagenUrl,
        });
    }
  }
  for (const id of seleccion.extras) {
    const e = extraDe(catalogo, id);
    if (e) items.push({ id: e.id, emoji: e.emoji, nombre: e.nombre });
  }

  const minSlots = 9;
  const vacios = Math.max(0, minSlots - items.length);

  return (
    <div className="rounded-3xl border border-line bg-gradient-to-b from-surface-2 to-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-faint">
          Tu barra
        </span>
        <span className="font-mono text-xs text-faint">
          {items.length} elementos
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {items.map((it, i) => (
          <div
            key={`${it.id}-${i}`}
            title={it.nombre}
            className="animate-pop flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-line bg-surface text-2xl shadow-sm"
          >
            {it.imagenUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={it.imagenUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              it.emoji
            )}
          </div>
        ))}
        {Array.from({ length: vacios }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-line/70 text-line"
            aria-hidden
          >
            ·
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="mt-3 text-center text-xs text-faint">
          Elige productos y míralos aparecer aquí ✨
        </p>
      )}
    </div>
  );
}
