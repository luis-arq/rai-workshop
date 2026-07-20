import { getTiposBarra } from "@/lib/db-catalog";
import {
  crearTipoBarra,
  eliminarTipoBarra,
  updateTipoBarra,
} from "@/lib/admin-actions";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function BarrasPage() {
  const tipos = await getTiposBarra();
  const inputCls =
    "rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-chamoy";

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Barras
      </h1>
      <p className="mt-1 text-muted">
        Habilita, deshabilita, agrega o elimina tipos de barra. Las
        deshabilitadas no aparecen en el configurador, pero no se borran.
      </p>

      <div className="mt-8 space-y-3">
        {tipos.map((t) => (
          <div
            key={t.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-4"
          >
            <form
              action={updateTipoBarra}
              className="flex flex-1 flex-wrap items-center gap-3"
            >
              <input type="hidden" name="id" value={t.id} />
              <input
                name="emoji"
                defaultValue={t.emoji}
                aria-label="Emoji"
                className={`w-14 text-center text-lg ${inputCls}`}
              />
              <input
                name="nombre"
                defaultValue={t.nombre}
                className={`min-w-48 flex-1 font-medium ${inputCls}`}
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
            <DeleteButton
              action={eliminarTipoBarra}
              id={t.id}
              message={`¿Eliminar "${t.nombre}"? Se borrarán TODOS sus productos, paquetes y extras. No se puede deshacer.`}
            />
          </div>
        ))}

        {/* Agregar barra */}
        <form
          action={crearTipoBarra}
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-line bg-surface-2/50 p-4"
        >
          <input
            name="emoji"
            placeholder="🍽️"
            aria-label="Emoji"
            className={`w-14 text-center text-lg ${inputCls}`}
          />
          <input
            name="nombre"
            required
            placeholder="Nueva barra…"
            className={`min-w-48 flex-1 ${inputCls}`}
          />
          <button className="rounded-full border border-chamoy px-4 py-2 text-sm font-semibold text-chamoy transition-colors hover:bg-chamoy/10">
            Agregar barra
          </button>
        </form>
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-surface-2 p-5 text-sm text-muted">
        💡 Una barra nueva nace <b>deshabilitada</b>. Agrégale productos y
        paquetes en las otras secciones y luego habilítala aquí. Para editar
        productos/precios de cada barra, ve a <b>Productos</b>, <b>Extras</b> o{" "}
        <b>Paquetes</b> y elige la barra arriba.
      </div>
    </div>
  );
}
