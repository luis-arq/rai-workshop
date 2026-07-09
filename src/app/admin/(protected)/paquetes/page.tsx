import { sql } from "@/lib/db";
import { updatePaquete } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio_base: string;
  precio_por_invitado: string;
  recipientes: number;
}

export default async function PaquetesPage() {
  const rows = (await sql`
    select id, nombre, descripcion, precio_base, precio_por_invitado, recipientes
    from paquetes order by orden`) as unknown as Row[];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Paquetes
      </h1>
      <p className="mt-1 text-muted">
        El precio final = precio base + (precio por invitado × nº de invitados) +
        extras.
      </p>

      <div className="mt-8 space-y-3">
        {rows.map((p) => (
          <form
            key={p.id}
            action={updatePaquete}
            className="rounded-2xl border border-line bg-surface p-4"
          >
            <input type="hidden" name="id" value={p.id} />
            <div className="flex flex-wrap items-end gap-4">
              <label className="text-sm">
                <span className="mb-1 block font-semibold text-muted">
                  Nombre
                </span>
                <input
                  name="nombre"
                  defaultValue={p.nombre}
                  className="w-44 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-chamoy"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-semibold text-muted">
                  Precio base
                </span>
                <input
                  name="precio_base"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={Number(p.precio_base)}
                  className="w-32 rounded-lg border border-line bg-surface px-3 py-2 text-sm tabular-nums outline-none focus:border-chamoy"
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-semibold text-muted">
                  Precio por invitado
                </span>
                <input
                  name="precio_por_invitado"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={Number(p.precio_por_invitado)}
                  className="w-32 rounded-lg border border-line bg-surface px-3 py-2 text-sm tabular-nums outline-none focus:border-chamoy"
                />
              </label>
              <span className="text-sm text-faint">
                🫙 {p.recipientes} recipientes
              </span>
              <button className="ml-auto rounded-full bg-chamoy px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]">
                Guardar
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
