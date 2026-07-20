import { sql } from "@/lib/db";
import { getTiposBarra } from "@/lib/db-catalog";
import {
  crearProducto,
  eliminarProducto,
  updateProducto,
} from "@/lib/admin-actions";
import BarSelector from "@/components/admin/BarSelector";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  categoria_id: string;
  nombre: string;
  emoji: string | null;
  imagen_url: string | null;
  precio_extra: string;
  disponible: boolean;
}
interface Cat {
  id: string;
  nombre: string;
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ barra?: string }>;
}) {
  const { barra } = await searchParams;
  const tipos = await getTiposBarra();
  const activo = tipos.find((t) => t.slug === barra) ?? tipos[0];

  const categorias = activo
    ? ((await sql`select id, nombre from categorias
        where tipo_barra_id = ${activo.id} order by orden`) as unknown as Cat[])
    : [];
  const rows = activo
    ? ((await sql`
        select p.id, p.categoria_id, p.nombre, p.emoji, p.imagen_url,
               p.precio_extra, p.disponible
        from productos p join categorias c on c.id = p.categoria_id
        where c.tipo_barra_id = ${activo.id}
        order by c.orden, p.orden`) as unknown as Row[])
    : [];

  const porCat = new Map<string, Row[]>();
  for (const r of rows) {
    const arr = porCat.get(r.categoria_id) ?? [];
    arr.push(r);
    porCat.set(r.categoria_id, arr);
  }

  const inputCls =
    "rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-chamoy";

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Productos
      </h1>
      <p className="mt-1 text-muted">
        Elige la barra, edita, agrega o elimina productos por categoría.
      </p>

      <div className="mt-6">
        <BarSelector
          tipos={tipos}
          activo={activo?.slug ?? ""}
          basePath="/admin/productos"
        />
      </div>

      {categorias.length === 0 && (
        <p className="text-muted">Esta barra aún no tiene categorías.</p>
      )}

      <div className="space-y-8">
        {categorias.map((cat) => (
          <section key={cat.id}>
            <h2 className="mb-3 font-semibold uppercase tracking-wide text-faint">
              {cat.nombre}
            </h2>
            <div className="space-y-2">
              {(porCat.get(cat.id) ?? []).map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-3"
                >
                  <form
                    action={updateProducto}
                    className="flex flex-1 flex-wrap items-center gap-3"
                  >
                    <input type="hidden" name="id" value={p.id} />
                    {p.imagen_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imagen_url}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-lg border border-line object-cover"
                      />
                    ) : (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-xl">
                        {p.emoji}
                      </span>
                    )}
                    <input
                      type="file"
                      name="imagen"
                      accept="image/*"
                      className="w-36 text-xs text-muted file:mr-2 file:rounded-full file:border-0 file:bg-chamoy/10 file:px-3 file:py-1.5 file:font-semibold file:text-chamoy"
                    />
                    <input
                      name="nombre"
                      defaultValue={p.nombre}
                      className={`min-w-36 flex-1 ${inputCls}`}
                    />
                    <label className="flex items-center gap-1.5 text-sm text-muted">
                      $
                      <input
                        name="precio_extra"
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={Number(p.precio_extra)}
                        className={`w-20 tabular-nums ${inputCls}`}
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-muted">
                      <input
                        name="disponible"
                        type="checkbox"
                        defaultChecked={p.disponible}
                        className="h-4 w-4 accent-chamoy"
                      />
                      Disp.
                    </label>
                    <button className="rounded-full bg-chamoy px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]">
                      Guardar
                    </button>
                  </form>
                  <DeleteButton
                    action={eliminarProducto}
                    id={p.id}
                    message={`¿Eliminar "${p.nombre}"? No se puede deshacer.`}
                  />
                </div>
              ))}

              {/* Agregar producto a esta categoría */}
              <form
                action={crearProducto}
                className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-line bg-surface-2/50 p-3"
              >
                <input type="hidden" name="categoria_id" value={cat.id} />
                <span className="text-lg">➕</span>
                <input
                  name="nombre"
                  required
                  placeholder="Nuevo producto…"
                  className={`min-w-48 flex-1 ${inputCls}`}
                />
                <button className="rounded-full border border-chamoy px-4 py-2 text-sm font-semibold text-chamoy transition-colors hover:bg-chamoy/10">
                  Agregar
                </button>
              </form>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
