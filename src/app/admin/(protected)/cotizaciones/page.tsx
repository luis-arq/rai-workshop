import { sql } from "@/lib/db";
import { formatoMXN } from "@/lib/pricing";
import { updateEstadoCotizacion } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  invitados: number | null;
  total: string;
  estado: string;
  canal: string | null;
  fecha_evento: string | null;
  hora: string | null;
  lugar: string | null;
  comentarios: string | null;
  creada_en: string;
  nombre: string | null;
  correo: string | null;
  telefono: string | null;
  paquete: string | null;
  barra: string | null;
  barra_emoji: string | null;
}

const ESTADOS = [
  { v: "nueva", label: "Nueva" },
  { v: "proceso", label: "En proceso" },
  { v: "ganada", label: "Ganada" },
  { v: "perdida", label: "Perdida" },
];

const estiloEstado: Record<string, string> = {
  nueva: "bg-chamoy/12 text-chamoy",
  proceso: "bg-mango/15 text-mango",
  ganada: "bg-lime/15 text-lime",
  perdida: "bg-faint/15 text-faint",
};

function fecha(d: string | Date | null) {
  if (!d) return "—";
  // fecha_evento es tipo `date` (sin hora); formateamos en UTC para no
  // correr el día por zona horaria.
  return new Date(d).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function CotizacionesPage() {
  const rows = (await sql`
    select co.id, co.invitados, co.total, co.estado, co.canal,
           co.fecha_evento, co.hora, co.lugar, co.comentarios, co.creada_en,
           cl.nombre, cl.correo, cl.telefono, p.nombre as paquete,
           tb.nombre as barra, tb.emoji as barra_emoji
    from cotizaciones co
    left join clientes cl on cl.id = co.cliente_id
    left join paquetes p on p.id = co.paquete_id
    left join tipos_barra tb on tb.id = co.tipo_barra_id
    order by co.creada_en desc`) as unknown as Row[];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Cotizaciones
      </h1>
      <p className="mt-1 text-muted">
        {rows.length === 0
          ? "Aún no hay cotizaciones. Aparecerán aquí cuando alguien envíe una desde el configurador."
          : `${rows.length} cotización${rows.length === 1 ? "" : "es"} recibidas.`}
      </p>

      <div className="mt-8 space-y-3">
        {rows.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-line bg-surface p-5"
          >
            <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{c.nombre ?? "Sin nombre"}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      estiloEstado[c.estado] ?? "bg-surface-2 text-muted"
                    }`}
                  >
                    {ESTADOS.find((e) => e.v === c.estado)?.label ?? c.estado}
                  </span>
                  {c.canal && (
                    <span className="text-xs text-faint">
                      {c.canal === "whatsapp" ? "📲 WhatsApp" : "✉️ Correo"}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-muted">
                  {c.telefono && <span>{c.telefono}</span>}
                  {c.telefono && c.correo && <span> · </span>}
                  {c.correo && <span>{c.correo}</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                  {c.barra && (
                    <span className="font-medium text-foreground">
                      {c.barra_emoji} {c.barra}
                    </span>
                  )}
                  <span>🎁 {c.paquete ?? "—"}</span>
                  <span>👥 {c.invitados ?? "—"} invitados</span>
                  <span>
                    📅 {fecha(c.fecha_evento)}
                    {c.hora ? ` ${c.hora}` : ""}
                  </span>
                  {c.lugar && <span>📍 {c.lugar}</span>}
                </div>
                {c.comentarios && (
                  <p className="mt-2 text-sm text-muted">💬 {c.comentarios}</p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="font-display text-2xl font-semibold tabular-nums text-chamoy">
                  {formatoMXN(Number(c.total))}
                </span>
                <form action={updateEstadoCotizacion} className="flex gap-2">
                  <input type="hidden" name="id" value={c.id} />
                  <select
                    name="estado"
                    defaultValue={c.estado}
                    className="rounded-lg border border-line bg-surface px-2 py-1.5 text-sm outline-none focus:border-chamoy"
                  >
                    {ESTADOS.map((e) => (
                      <option key={e.v} value={e.v}>
                        {e.label}
                      </option>
                    ))}
                  </select>
                  <button className="rounded-lg bg-chamoy px-3 py-1.5 text-sm font-semibold text-white">
                    Guardar
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
