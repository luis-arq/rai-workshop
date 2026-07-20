import { sql } from "@/lib/db";
import { getTiposBarra } from "@/lib/db-catalog";
import {
  crearPaquete,
  eliminarPaquete,
  updatePaquete,
} from "@/lib/admin-actions";
import BarSelector from "@/components/admin/BarSelector";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  nombre: string;
  precio_base: string;
  precio_por_invitado: string;
  recipientes: number;
}

export default async function PaquetesPage({
  searchParams,
}: {
  searchParams: Promise<{ barra?: string }>;
}) {
  const { barra } = await searchParams;
  const tipos = await getTiposBarra();
  const activo = tipos.find((t) => t.slug === barra) ?? tipos[0];

  const rows = activo
    ? ((await sql`
        select id, nombre, precio_base, precio_por_invitado, recipientes
        from paquetes where tipo_barra_id = ${activo.id} order by orden`) as unknown as Row[])
    : [];

  const inputCls =
    "rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-chamoy";

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Paquetes
      </h1>
      <p className="mt-1 text-muted">
        Precio final = precio base + (precio por invitado × invitados) + extras.
        Agrega o elimina paquetes por barra.
      </p>

      <div className="mt-6">
        <BarSelector
          tipos={tipos}
          activo={activo?.slug ?? ""}
          basePath="/admin/paquetes"
        />
      </div>

      <div className="space-y-3">
        {rows.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-surface p-4"
          >
            <form
              action={updatePaquete}
              className="flex flex-1 flex-wrap items-end gap-4"
            >
              <input type="hidden" name="id" value={p.id} />
              <label className="text-sm">
                <span className="mb-1 block font-semibold text-muted">Nombre</span>
                <input
                  name="nombre"
                  defaultValue={p.nombre}
                  className={`w-40 ${inputCls}`}
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
                  className={`w-28 tabular-nums ${inputCls}`}
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-semibold text-muted">
                  Por invitado
                </span>
                <input
                  name="precio_por_invitado"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={Number(p.precio_por_invitado)}
                  className={`w-28 tabular-nums ${inputCls}`}
                />
              </label>
              <button className="rounded-full bg-chamoy px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]">
                Guardar
              </button>
            </form>
            <DeleteButton
              action={eliminarPaquete}
              id={p.id}
              message={`¿Eliminar el paquete "${p.nombre}"?`}
            />
          </div>
        ))}

        {rows.length === 0 && (
          <p className="text-muted">Esta barra aún no tiene paquetes.</p>
        )}

        {/* Agregar paquete */}
        {activo && (
          <form
            action={crearPaquete}
            className="flex flex-wrap items-end gap-3 rounded-2xl border border-dashed border-line bg-surface-2/50 p-4"
          >
            <input type="hidden" name="tipo_barra_id" value={activo.id} />
            <span className="pb-2 text-lg">➕</span>
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-muted">Nombre</span>
              <input
                name="nombre"
                required
                placeholder="Nuevo paquete…"
                className={`w-40 ${inputCls}`}
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
                defaultValue={0}
                className={`w-28 tabular-nums ${inputCls}`}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-muted">
                Por invitado
              </span>
              <input
                name="precio_por_invitado"
                type="number"
                min="0"
                step="1"
                defaultValue={0}
                className={`w-28 tabular-nums ${inputCls}`}
              />
            </label>
            <button className="rounded-full border border-chamoy px-5 py-2 text-sm font-semibold text-chamoy transition-colors hover:bg-chamoy/10">
              Agregar paquete
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
