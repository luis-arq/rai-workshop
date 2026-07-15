import { getTiposBarra } from "@/lib/db-catalog";
import { updateTipoBarra } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function BarrasPage() {
  const tipos = await getTiposBarra();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Barras
      </h1>
      <p className="mt-1 text-muted">
        Habilita o deshabilita cada tipo de barra. Las deshabilitadas no
        aparecen en el configurador, pero no se borran.
      </p>

      <div className="mt-8 space-y-3">
        {tipos.map((t) => (
          <form
            key={t.id}
            action={updateTipoBarra}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-4"
          >
            <input type="hidden" name="id" value={t.id} />
            <input
              name="emoji"
              defaultValue={t.emoji}
              aria-label="Emoji"
              className="w-14 rounded-lg border border-line bg-surface px-3 py-2 text-center text-lg outline-none focus:border-chamoy"
            />
            <input
              name="nombre"
              defaultValue={t.nombre}
              className="min-w-48 flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium outline-none focus:border-chamoy"
            />
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                name="activo"
                type="checkbox"
                defaultChecked={t.activo}
                className="h-4 w-4 accent-chamoy"
              />
              {t.activo ? "Habilitada" : "Deshabilitada"}
            </label>
            <button className="rounded-full bg-chamoy px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]">
              Guardar
            </button>
          </form>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-surface-2 p-5 text-sm text-muted">
        💡 Para editar los productos y precios de cada barra, ve a{" "}
        <b>Productos</b>, <b>Extras</b> o <b>Paquetes</b> y elige la barra arriba.
      </div>
    </div>
  );
}
