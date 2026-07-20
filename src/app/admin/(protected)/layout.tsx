import Link from "next/link";
import Logo from "@/components/Logo";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "@/lib/admin-actions";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/cotizaciones", label: "Cotizaciones" },
  { href: "/admin/barras", label: "Barras" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/extras", label: "Extras" },
  { href: "/admin/paquetes", label: "Paquetes" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/ajustes", label: "Ajustes" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-5 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo height="h-9" />
            <span className="text-xs text-faint">admin</span>
          </Link>
          <nav className="ml-4 hidden gap-1 sm:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <form action={signOut} className="ml-auto">
            <button className="rounded-full border border-line px-4 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2">
              Salir
            </button>
          </form>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-5 pb-2 sm:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-muted"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}
