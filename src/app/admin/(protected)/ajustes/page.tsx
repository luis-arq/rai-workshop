import { getAjustes } from "@/lib/db-catalog";
import { updateAjustes } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const a = await getAjustes();
  const input =
    "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-chamoy";

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Ajustes
      </h1>
      <p className="mt-1 text-muted">
        Datos del negocio. Estos valores se usan en las cotizaciones que reciben.
      </p>

      <form
        action={updateAjustes}
        className="mt-8 max-w-lg space-y-5 rounded-3xl border border-line bg-surface p-6"
      >
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">WhatsApp</span>
          <input
            name="whatsapp"
            defaultValue={a.whatsapp}
            className={input}
            inputMode="numeric"
            placeholder="527775674691"
          />
          <span className="mt-1 block text-xs text-faint">
            Formato internacional sin signos: 52 + 10 dígitos (México).
          </span>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Correo</span>
          <input
            name="correo"
            type="email"
            defaultValue={a.correo}
            className={input}
            placeholder="hola@samai.mx"
          />
        </label>

        <div className="flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              name="iva_aplica"
              type="checkbox"
              defaultChecked={a.ivaAplica}
              className="h-4 w-4 accent-chamoy"
            />
            <span className="font-semibold">Cobrar IVA</span>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-muted">IVA %</span>
            <input
              name="iva_pct"
              type="number"
              min="0"
              max="100"
              step="1"
              defaultValue={Math.round(a.ivaTasa * 100)}
              className="w-24 rounded-lg border border-line bg-surface px-3 py-2 text-sm tabular-nums outline-none focus:border-chamoy"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-muted">Moneda</span>
            <input
              name="moneda"
              defaultValue={a.moneda}
              className="w-24 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-chamoy"
            />
          </label>
        </div>

        <button className="rounded-full bg-chamoy px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-chamoy/25 transition-transform hover:scale-[1.02]">
          Guardar ajustes
        </button>
      </form>
    </div>
  );
}
