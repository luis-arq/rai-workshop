import { sql } from "@/lib/db";
import { getTiposBarra } from "@/lib/db-catalog";
import { updateProducto } from "@/lib/admin-actions";
import BarSelector from "@/components/admin/BarSelector";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  nombre: string;
  emoji: string | null;
  imagen_url: string | null;
  precio_extra: string;
  disponible: boolean;
  categoria: string;
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ barra?: string }>;
}) {
  const { barra } = await searchParams;
  const tipos = await getTiposBarra();
  const activo = tipos.find((t) => t.slug === barra) ?? tipos[0];

  const rows = activo
    ? ((await sql`
        select p.id, p.nombre, p.emoji, p.imagen_url, p.precio_extra, p.disponible,
               c.nombre as categoria
        from productos p join categorias c on c.id = p.categoria_id
        where c.tipo_barra_id = ${activo.id}
        order by c.orden, p.orden`) as unknown as Row[])
    : [];

  const grupos = new Map<string, Row[]>();
  for (const r of rows) {
    const arr = grupos.get(r.categoria) ?? [];
    arr.push(r);
    grupos.set(r.categoria, arr);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Productos
      </h1>
      <p className="mt-1 text-muted">
        Elige la barra y edita nombre, precio extra y disponibilidad.
      </p>

      <div className="mt-6">
        <BarSelector
          tipos={tipos}
          activo={activo?.slug ?? ""}
          basePath="/admin/productos"
        />
      </div>

      {grupos.size === 0 && (
        <p className="text-muted">Esta barra aún no tiene productos.</p>
      )}

      <div className="space-y-8">
        {[...grupos.entries()].map(([categoria, items]) => (
          <section key={categoria}>
            <h2 className="mb-3 font-semibold uppercase tracking-wide text-faint">
              {categoria}
            </h2>
            <div className="space-y-2">
              {items.map((p) => (
                <form
                  key={p.id}
                  action={updateProducto}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-3"
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
                    className="w-40 text-xs text-muted file:mr-2 file:rounded-full file:border-0 file:bg-chamoy/10 file:px-3 file:py-1.5 file:font-semibold file:text-chamoy"
                  />
                  <input
                    name="nombre"
                    defaultValue={p.nombre}
                    className="min-w-40 flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-chamoy"
                  />
                  <label className="flex items-center gap-1.5 text-sm text-muted">
                    Precio extra
                    <span className="text-faint">$</span>
                    <input
                      name="precio_extra"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={Number(p.precio_extra)}
                      className="w-24 rounded-lg border border-line bg-surface px-3 py-2 text-sm tabular-nums outline-none focus:border-chamoy"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <input
                      name="disponible"
                      type="checkbox"
                      defaultChecked={p.disponible}
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
          </section>
        ))}
      </div>
    </div>
  );
}
