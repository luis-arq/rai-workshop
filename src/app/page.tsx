import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Fondos suaves de color */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-40 h-[46vw] w-[46vw] rounded-full bg-chamoy/30 blur-3xl" />
        <div className="absolute -right-32 top-24 h-[38vw] w-[38vw] rounded-full bg-mango/25 blur-3xl" />
        <div className="absolute bottom-[-20vw] left-1/3 h-[34vw] w-[34vw] rounded-full bg-lime/20 blur-3xl" />
      </div>

      {/* Nav mínima */}
      <header className="mx-auto flex w-full max-w-5xl items-center gap-3 px-6 pt-8">
        <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-chamoy to-mango shadow-lg shadow-chamoy/30" />
        <span className="font-display text-xl font-semibold tracking-tight">Samai</span>
        <span className="ml-auto font-mono text-xs text-faint">Barras de snacks para eventos</span>
      </header>

      {/* Hero */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-20">
        <p className="animate-rise mb-5 flex items-center gap-2 text-sm font-semibold tracking-wide text-chamoy">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-chamoy" />
          Diseña · Cotiza · Celebra
        </p>

        <h1 className="animate-rise font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Diseña la barra
          <br />
          <span className="text-chamoy italic">perfecta</span> para tu evento.
        </h1>

        <p className="animate-rise mt-6 max-w-xl text-lg text-muted sm:text-xl">
          Bodas, XV años, cumpleaños o eventos de empresa. Arma tu barra de
          snacks paso a paso y recibe tu cotización personalizada en menos de{" "}
          <strong className="text-foreground">3 minutos</strong>.
        </p>

        <div className="animate-rise mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/configura"
            className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-chamoy px-8 text-lg font-semibold text-white shadow-xl shadow-chamoy/30 transition-transform hover:scale-[1.03] focus:outline-none focus-visible:ring-4 focus-visible:ring-chamoy/40"
          >
            Comenzar
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <span className="text-sm text-faint">
            Sin registro · Sin compromiso
          </span>
        </div>

        <div className="animate-rise mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
          <span className="flex items-center gap-2">
            <span className="text-mango">★★★★★</span> +300 eventos
          </span>
          <span className="hidden h-4 w-px bg-line sm:block" />
          <span>🍟 Papas · 🍬 Gomitas · 🥜 Cacahuates · 🥭 Fruta con chile</span>
        </div>
      </main>
    </div>
  );
}
