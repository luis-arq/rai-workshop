"use client";

import { paqueteDe } from "@/lib/catalog-helpers";
import { calcularCotizacion, formatoMXN } from "@/lib/pricing";
import type { Ajustes, Catalogo, Seleccion } from "@/lib/types";
import BarPreview from "./BarPreview";

// Panel de resumen persistente (columna derecha en desktop).
// Mantiene el render y el precio siempre a la vista.
export default function SummaryPanel({
  seleccion,
  catalogo,
  ajustes,
}: {
  seleccion: Seleccion;
  catalogo: Catalogo;
  ajustes: Ajustes;
}) {
  const paquete = paqueteDe(catalogo, seleccion.paqueteId);
  const cot = calcularCotizacion(seleccion, catalogo, ajustes);
  const fmt = (n: number) => formatoMXN(n, ajustes.moneda);

  return (
    <div className="flex flex-col gap-4">
      <BarPreview seleccion={seleccion} catalogo={catalogo} />

      <div className="rounded-3xl border border-line bg-surface p-5">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-surface-2 px-3 py-1 font-semibold">
            {paquete ? paquete.nombre : "Sin paquete"}
          </span>
          <span className="rounded-full bg-surface-2 px-3 py-1 font-semibold">
            {seleccion.invitados ? `${seleccion.invitados} invitados` : "—"}
          </span>
        </div>

        <div className="mt-4 border-t border-line pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">{fmt(cot.subtotal)}</span>
          </div>
          {cot.ivaAplica && (
            <div className="mt-1 flex justify-between text-muted">
              <span>IVA (16%)</span>
              <span className="font-mono tabular-nums">{fmt(cot.iva)}</span>
            </div>
          )}
          <div className="mt-3 flex items-end justify-between">
            <span className="text-sm font-semibold">Estimado</span>
            <span className="font-display text-3xl font-semibold tabular-nums text-chamoy">
              {fmt(cot.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
