import { sql } from "@/lib/db";
import { getTiposBarra } from "@/lib/db-catalog";
import { crearExtra, eliminarExtra, updateExtra } from "@/lib/admin-actions";
import BarSelector from "@/components/admin/BarSelector";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  nombre: string;
  emoji: string | null;
  precio: string;
  disponible: boolean;
}

export default async function ExtrasPage({
  searchParams,
}: {
  searchParams: Promise<{ barra?: string }>;
}) {
  const { barra } = await searchParams;
  const tipos = await getTiposBarra();
  const activo = tipos.find((t) => t.slug === barra) ?? tipos[0];

  const rows = activo
    ? ((await sql`
        select id, nombre, emoji, precio, disponible
        from extras where tipo_barra_id = ${activo.id} order by orden`) as unknown as Row[])
    : [];

  const inputCls =
    "rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-chamoy";

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Extras
      </h1>
      <p className="mt-1 text-muted">
        Cada extra suma su precio a la cotización cuando el cliente lo elige.
      </p>

      <div className="mt-6">
        <BarSelector
          tipos={tipos}
          activo={activo?.slug ?? ""}
          basePath="/admin/extras"
        />
      </div>

      <div className="space-y-2">
        {rows.map((e) => (
          <div
            key={e.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-3"
          >
            <form
              action={updateExtra}
              className="flex flex-1 flex-wrap items-center gap-3"
            >
              <input type="hidden" name="id" value={e.id} />
              <input
                name="emoji"
                defaultValue={e.emoji ?? ""}
                aria-label="Emoji"
                maxLength={4}
                className={`w-14 text-center text-xl ${inputCls}`}
              />
              <input
                name="nombre"
                defaultValue={e.nombre}
                className={`min-w-36 flex-1 ${inputCls}`}
              />
              <label className="flex items-center gap-1.5 text-sm text-muted">
                $
                <input
                  name="precio"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={Number(e.precio)}
                  className={`w-20 tabular-nums ${inputCls}`}
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  name="disponible"
                  type="checkbox"
                  defaultChecked={e.disponible}
                  className="h-4 w-4 accent-chamoy"
                />
                Disp.
              </label>
              <button className="rounded-full bg-chamoy px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]">
                Guardar
              </button>
            </form>
            <DeleteButton
              action={eliminarExtra}
              id={e.id}
              message={`¿Eliminar el extra "${e.nombre}"?`}
            />
          </div>
        ))}

        {/* Agregar extra */}
        {activo && (
          <form
            action={crearExtra}
            className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-line bg-surface-2/50 p-3"
          >
            <input type="hidden" name="tipo_barra_id" value={activo.id} />
            <span className="text-lg">➕</span>
            <input
              name="nombre"
              required
              placeholder="Nuevo extra…"
              className={`min-w-48 flex-1 ${inputCls}`}
            />
            <label className="flex items-center gap-1.5 text-sm text-muted">
              $
              <input
                name="precio"
                type="number"
                min="0"
                step="1"
                defaultValue={0}
                className={`w-24 tabular-nums ${inputCls}`}
              />
            </label>
            <button className="rounded-full border border-chamoy px-4 py-2 text-sm font-semibold text-chamoy transition-colors hover:bg-chamoy/10">
              Agregar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
