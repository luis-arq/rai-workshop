import Link from "next/link";
import type { TipoBarra } from "@/lib/types";

// Fila de botones para elegir qué barra editar (usa ?barra=slug).
export default function BarSelector({
  tipos,
  activo,
  basePath,
}: {
  tipos: TipoBarra[];
  activo: string;
  basePath: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {tipos.map((t) => {
        const sel = t.slug === activo;
        return (
          <Link
            key={t.id}
            href={`${basePath}?barra=${t.slug}`}
            className={[
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              sel
                ? "border-chamoy bg-chamoy/10 text-chamoy"
                : "border-line text-muted hover:bg-surface-2",
            ].join(" ")}
          >
            {t.emoji} {t.nombre}
            {!t.activo && (
              <span className="ml-1 text-xs opacity-70">(off)</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
