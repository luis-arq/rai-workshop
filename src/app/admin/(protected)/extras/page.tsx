import { sql } from "@/lib/db";
import { updateExtra } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  nombre: string;
  emoji: string | null;
  precio: string;
  disponible: boolean;
}

export default async function ExtrasPage() {
  const rows = (await sql`
    select id, nombre, emoji, precio, disponible
    from extras order by orden`) as unknown as Row[];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Extras
      </h1>
      <p className="mt-1 text-muted">
        Cada extra suma su precio a la cotización cuando el cliente lo elige.
      </p>

      <div className="mt-8 space-y-2">
        {rows.map((e) => (
          <form
            key={e.id}
            action={updateExtra}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-3"
          >
            <input type="hidden" name="id" value={e.id} />
            <span className="text-2xl" aria-hidden>
              {e.emoji}
            </span>
            <input
              name="nombre"
              defaultValue={e.nombre}
              className="min-w-40 flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-chamoy"
            />
            <label className="flex items-center gap-1.5 text-sm text-muted">
              Precio
              <span className="text-faint">$</span>
              <input
                name="precio"
                type="number"
                min="0"
                step="1"
                defaultValue={Number(e.precio)}
                className="w-24 rounded-lg border border-line bg-surface px-3 py-2 text-sm tabular-nums outline-none focus:border-chamoy"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                name="disponible"
                type="checkbox"
                defaultChecked={e.disponible}
                className="h-4 w-4 accent-chamoy"
              />
              Disponible
            </label>
            <button className="rounded-full bg-chamoy px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]">
              Guardar
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
