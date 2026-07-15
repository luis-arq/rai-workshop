import Link from "next/link";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getStats() {
  const [[prod], [cot], [nuevas], [barras]] = await Promise.all([
    sql`select count(*)::int n from productos`,
    sql`select count(*)::int n from cotizaciones`,
    sql`select count(*)::int n from cotizaciones where estado = 'nueva'`,
    sql`select count(*) filter (where activo)::int activas, count(*)::int total from tipos_barra`,
  ]);
  return {
    productos: prod.n,
    cotizaciones: cot.n,
    nuevas: nuevas.n,
    barrasActivas: barras.activas,
    barrasTotal: barras.total,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    {
      href: "/admin/cotizaciones",
      label: "Cotizaciones",
      valor: stats.cotizaciones,
      hint: stats.nuevas > 0 ? `${stats.nuevas} nueva${stats.nuevas === 1 ? "" : "s"} por revisar` : "Leads recibidos",
    },
    {
      href: "/admin/barras",
      label: "Barras",
      valor: `${stats.barrasActivas}/${stats.barrasTotal}`,
      hint: "Tipos de barra habilitados",
    },
    { href: "/admin/productos", label: "Productos", valor: stats.productos, hint: "Edita por barra" },
    { href: "/admin/paquetes", label: "Paquetes", valor: "—", hint: "Precios por barra" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Dashboard
      </h1>
      <p className="mt-1 text-muted">
        Administra tu catálogo. Los cambios se reflejan al instante en el
        configurador.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-2xl border border-line bg-surface p-6 shadow-sm transition-transform hover:-translate-y-0.5 hover:border-chamoy/50"
          >
            <div className="font-display text-4xl font-semibold tabular-nums text-chamoy">
              {c.valor}
            </div>
            <div className="mt-1 font-semibold">{c.label}</div>
            <div className="mt-1 text-sm text-muted">{c.hint}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-surface-2 p-5 text-sm text-muted">
        💡 Consejo: para desactivar un producto agotado, quítale la palomita de
        “Disponible” y guarda. Desaparece del configurador sin borrarlo.
      </div>
    </div>
  );
}
