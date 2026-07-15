"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { OPCIONES_INVITADOS } from "@/lib/catalog";
import { categoriaDe, paqueteDe } from "@/lib/catalog-helpers";
import {
  calcularCotizacion,
  formatoMXN,
  limiteDeCategoria,
} from "@/lib/pricing";
import { linkCorreo, linkWhatsApp } from "@/lib/quote";
import { guardarCotizacion } from "@/lib/quote-actions";
import type {
  Ajustes,
  Catalogo,
  CategoriaId,
  DatosEvento,
  Extra,
  Paquete,
  Seleccion,
  TipoBarra,
} from "@/lib/types";
import ProductGrid from "./ProductGrid";
import SummaryPanel from "./SummaryPanel";

type Paso =
  | { kind: "invitados" }
  | { kind: "paquete" }
  | { kind: "categoria"; categoriaId: CategoriaId }
  | { kind: "extras" }
  | { kind: "evento" }
  | { kind: "resumen" };

export default function Wizard({
  catalogo,
  ajustes,
  tipoBarra,
}: {
  catalogo: Catalogo;
  ajustes: Ajustes;
  tipoBarra?: TipoBarra;
}) {
  // Los pasos de categoría se derivan del catálogo (orden de la DB).
  const PASOS: Paso[] = useMemo(
    () => [
      { kind: "invitados" },
      { kind: "paquete" },
      ...catalogo.categorias.map(
        (c): Paso => ({ kind: "categoria", categoriaId: c.id })
      ),
      { kind: "extras" },
      { kind: "evento" },
      { kind: "resumen" },
    ],
    [catalogo]
  );

  const productosInicial = useMemo(() => {
    const o = {} as Record<CategoriaId, string[]>;
    for (const c of catalogo.categorias) o[c.id] = [];
    return o;
  }, [catalogo]);

  const paqueteDestacado =
    catalogo.paquetes.find((p) => p.destacado)?.id ??
    catalogo.paquetes[0]?.id ??
    null;

  const [pasoIdx, setPasoIdx] = useState(0);
  const [seleccion, setSeleccion] = useState<Seleccion>({
    invitados: null,
    paqueteId: paqueteDestacado,
    productos: productosInicial,
    extras: [],
    evento: {
      nombre: "",
      correo: "",
      telefono: "",
      fecha: "",
      hora: "",
      lugar: "",
      comentarios: "",
    },
  });

  const paso = PASOS[pasoIdx];
  const progreso = Math.round(((pasoIdx + 1) / PASOS.length) * 100);
  const cot = useMemo(
    () => calcularCotizacion(seleccion, catalogo, ajustes),
    [seleccion, catalogo, ajustes]
  );
  const fmt = (n: number) => formatoMXN(n, ajustes.moneda);

  // ---- Handlers ----
  function setInvitados(n: number) {
    setSeleccion((s) => ({ ...s, invitados: n }));
  }

  function setPaquete(id: string) {
    setSeleccion((s) => {
      const productos = { ...s.productos };
      for (const cat of catalogo.categorias) {
        const lim = limiteDeCategoria(catalogo, id, cat.id, cat.limiteDefault);
        productos[cat.id] = (productos[cat.id] ?? []).slice(0, lim);
      }
      return { ...s, paqueteId: id, productos };
    });
  }

  function toggleProducto(catId: CategoriaId, id: string) {
    setSeleccion((s) => {
      const actual = s.productos[catId] ?? [];
      const cat = categoriaDe(catalogo, catId);
      const lim = limiteDeCategoria(
        catalogo,
        s.paqueteId,
        catId,
        cat?.limiteDefault ?? 2
      );
      let next: string[];
      if (actual.includes(id)) {
        next = actual.filter((x) => x !== id);
      } else {
        if (actual.length >= lim) return s;
        next = [...actual, id];
      }
      return { ...s, productos: { ...s.productos, [catId]: next } };
    });
  }

  function toggleExtra(id: string) {
    setSeleccion((s) => ({
      ...s,
      extras: s.extras.includes(id)
        ? s.extras.filter((x) => x !== id)
        : [...s.extras, id],
    }));
  }

  function setEvento(campo: keyof DatosEvento, valor: string) {
    setSeleccion((s) => ({ ...s, evento: { ...s.evento, [campo]: valor } }));
  }

  // ---- Validación para avanzar ----
  function puedeAvanzar(): boolean {
    switch (paso.kind) {
      case "invitados":
        return seleccion.invitados !== null;
      case "paquete":
        return seleccion.paqueteId !== null;
      case "categoria": {
        const cat = categoriaDe(catalogo, paso.categoriaId);
        const lim = limiteDeCategoria(
          catalogo,
          seleccion.paqueteId,
          paso.categoriaId,
          cat?.limiteDefault ?? 2
        );
        return (seleccion.productos[paso.categoriaId] ?? []).length === lim;
      }
      case "evento": {
        const e = seleccion.evento;
        return (
          e.nombre.trim() !== "" && e.telefono.trim() !== "" && e.fecha !== ""
        );
      }
      default:
        return true;
    }
  }

  const avanzar = () => setPasoIdx((i) => Math.min(i + 1, PASOS.length - 1));
  const retroceder = () => setPasoIdx((i) => Math.max(i - 1, 0));
  const esResumen = paso.kind === "resumen";

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Barra superior con progreso */}
      <header className="sticky top-0 z-20 border-b border-line bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Logo height="h-10" />
          </Link>
          {tipoBarra && (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm font-medium">
                {tipoBarra.emoji} {tipoBarra.nombre}
              </span>
              <Link
                href="/configura"
                className="text-xs font-semibold text-chamoy hover:underline"
              >
                Cambiar
              </Link>
            </div>
          )}
          <div className="ml-auto flex items-center gap-3">
            <span className="font-mono text-xs text-faint">
              Paso {pasoIdx + 1} de {PASOS.length}
            </span>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-surface-2 sm:w-40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-chamoy to-mango transition-all duration-500"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Cuerpo */}
      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-8 px-5 py-8 lg:grid-cols-[1fr_360px]">
        <div className="pb-28 lg:pb-8">
          <div key={pasoIdx} className="animate-rise">
            {paso.kind === "invitados" && (
              <StepInvitados valor={seleccion.invitados} onSelect={setInvitados} />
            )}
            {paso.kind === "paquete" && (
              <StepPaquete
                paquetes={catalogo.paquetes}
                valor={seleccion.paqueteId}
                moneda={ajustes.moneda}
                onSelect={setPaquete}
              />
            )}
            {paso.kind === "categoria" && (
              <StepCategoria
                categoriaId={paso.categoriaId}
                catalogo={catalogo}
                seleccion={seleccion}
                onToggle={toggleProducto}
              />
            )}
            {paso.kind === "extras" && (
              <StepExtras
                extras={catalogo.extras}
                seleccionados={seleccion.extras}
                moneda={ajustes.moneda}
                onToggle={toggleExtra}
              />
            )}
            {paso.kind === "evento" && (
              <StepEvento evento={seleccion.evento} onChange={setEvento} />
            )}
            {paso.kind === "resumen" && (
              <StepResumen
                seleccion={seleccion}
                catalogo={catalogo}
                ajustes={ajustes}
                tipoBarraId={tipoBarra?.id ?? ""}
              />
            )}
          </div>

          {/* Navegación (desktop) */}
          {!esResumen && (
            <div className="mt-8 hidden items-center gap-3 lg:flex">
              {pasoIdx > 0 && (
                <button
                  onClick={retroceder}
                  className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-muted transition-colors hover:bg-surface-2"
                >
                  ← Atrás
                </button>
              )}
              <button
                onClick={avanzar}
                disabled={!puedeAvanzar()}
                className="ml-auto rounded-full bg-chamoy px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-chamoy/25 transition-transform enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>

        {/* Panel lateral (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <SummaryPanel
              seleccion={seleccion}
              catalogo={catalogo}
              ajustes={ajustes}
            />
          </div>
        </aside>
      </div>

      {/* Barra inferior fija (mobile) */}
      {!esResumen && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            {pasoIdx > 0 && (
              <button
                onClick={retroceder}
                aria-label="Atrás"
                className="rounded-full border border-line px-4 py-3 text-sm font-semibold text-muted"
              >
                ←
              </button>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs text-faint">
                {paqueteDe(catalogo, seleccion.paqueteId)?.nombre ?? "—"}
                {seleccion.invitados ? ` · ${seleccion.invitados} inv.` : ""}
              </div>
              <div className="font-display text-lg font-semibold tabular-nums text-chamoy">
                {fmt(cot.total)}
              </div>
            </div>
            <button
              onClick={avanzar}
              disabled={!puedeAvanzar()}
              className="rounded-full bg-chamoy px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-chamoy/25 disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Encabezado ---------------- */
function Encabezado({ titulo, sub }: { titulo: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {titulo}
      </h2>
      {sub && <p className="mt-2 text-muted">{sub}</p>}
    </div>
  );
}

/* ---------------- Paso 1: Invitados ---------------- */
function StepInvitados({
  valor,
  onSelect,
}: {
  valor: number | null;
  onSelect: (n: number) => void;
}) {
  return (
    <div>
      <Encabezado
        titulo="¿Cuántos invitados?"
        sub="Con esto calculamos la cantidad perfecta de snacks."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {OPCIONES_INVITADOS.map((n, i) => {
          const activo = valor === n;
          const label = i === OPCIONES_INVITADOS.length - 1 ? `${n}+` : `${n}`;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onSelect(n)}
              aria-pressed={activo}
              className={[
                "rounded-2xl border p-6 text-center transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-chamoy/30",
                activo
                  ? "border-chamoy bg-chamoy/8 shadow-md shadow-chamoy/10"
                  : "border-line bg-surface hover:-translate-y-0.5 hover:border-chamoy/50",
              ].join(" ")}
            >
              <div className="font-display text-3xl font-semibold">{label}</div>
              <div className="mt-1 text-xs text-faint">invitados</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Paso 2: Paquete ---------------- */
function StepPaquete({
  paquetes,
  valor,
  moneda,
  onSelect,
}: {
  paquetes: Paquete[];
  valor: string | null;
  moneda: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <Encabezado
        titulo="Elige tu paquete"
        sub="Define recipientes, variedad y servicios. Puedes personalizar todo después."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {paquetes.map((p) => {
          const activo = valor === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              aria-pressed={activo}
              className={[
                "relative rounded-2xl border p-5 text-left transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-chamoy/30",
                activo
                  ? "border-chamoy bg-chamoy/8 shadow-md shadow-chamoy/10"
                  : "border-line bg-surface hover:-translate-y-0.5 hover:border-chamoy/50",
              ].join(" ")}
            >
              {p.destacado && (
                <span className="absolute right-4 top-4 rounded-full bg-mango/15 px-2.5 py-1 text-[11px] font-bold text-mango">
                  Más elegido
                </span>
              )}
              <div className="font-display text-2xl font-semibold">{p.nombre}</div>
              <div className="mt-1 text-sm text-muted">{p.descripcion}</div>
              <div className="mt-3 font-mono text-sm text-chamoy">
                Desde {formatoMXN(p.precioBase, moneda)}
              </div>
              <ul className="mt-3 space-y-1 text-xs text-muted">
                <li>🫙 {p.recipientes} recipientes</li>
                {p.servicios.map((s) => (
                  <li key={s}>✓ {s}</li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Pasos de categoría ---------------- */
function StepCategoria({
  categoriaId,
  catalogo,
  seleccion,
  onToggle,
}: {
  categoriaId: CategoriaId;
  catalogo: Catalogo;
  seleccion: Seleccion;
  onToggle: (catId: CategoriaId, id: string) => void;
}) {
  const cat = categoriaDe(catalogo, categoriaId)!;
  const lim = limiteDeCategoria(
    catalogo,
    seleccion.paqueteId,
    categoriaId,
    cat.limiteDefault
  );
  const elegidos = seleccion.productos[categoriaId] ?? [];
  const completo = elegidos.length === lim;

  return (
    <div>
      <Encabezado titulo={cat.nombre} sub={cat.instruccionBase} />
      <div className="mb-4 flex items-center gap-2">
        <span
          className={[
            "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
            completo ? "bg-lime/15 text-lime" : "bg-mango/15 text-mango",
          ].join(" ")}
        >
          {completo ? "✓ ¡Listo!" : `Elige ${lim}`}
          <span className="font-mono text-xs opacity-80">
            {elegidos.length}/{lim}
          </span>
        </span>
      </div>
      <ProductGrid
        productos={cat.productos}
        seleccionados={elegidos}
        limite={lim}
        onToggle={(id) => onToggle(categoriaId, id)}
      />
    </div>
  );
}

/* ---------------- Paso: Extras ---------------- */
function StepExtras({
  extras,
  seleccionados,
  moneda,
  onToggle,
}: {
  extras: Extra[];
  seleccionados: string[];
  moneda: string;
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <Encabezado
        titulo="Dale tu toque"
        sub="Extras opcionales para que tu barra sea inolvidable."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {extras.map((e) => {
          const activo = seleccionados.includes(e.id);
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => onToggle(e.id)}
              disabled={!e.disponible}
              aria-pressed={activo}
              className={[
                "flex items-center gap-3 rounded-2xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-chamoy/30",
                activo
                  ? "border-chamoy bg-chamoy/8 shadow-md shadow-chamoy/10"
                  : "border-line bg-surface hover:-translate-y-0.5 hover:border-chamoy/50",
                !e.disponible ? "cursor-not-allowed opacity-45" : "",
              ].join(" ")}
            >
              <span className="text-2xl" aria-hidden>
                {e.emoji}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{e.nombre}</span>
                <span className="font-mono text-xs text-chamoy">
                  + {formatoMXN(e.precio, moneda)}
                </span>
              </span>
              <span
                className={[
                  "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold transition-colors",
                  activo
                    ? "border-chamoy bg-chamoy text-white"
                    : "border-line text-transparent",
                ].join(" ")}
              >
                ✓
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Paso: Datos del evento ---------------- */
function StepEvento({
  evento,
  onChange,
}: {
  evento: DatosEvento;
  onChange: (campo: keyof DatosEvento, valor: string) => void;
}) {
  const input =
    "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-chamoy focus-visible:ring-4 focus-visible:ring-chamoy/20";
  return (
    <div>
      <Encabezado
        titulo="Último paso para tu cotización"
        sub="¿A dónde y para cuándo? Te respondemos en menos de 24 horas."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Nombre *</span>
          <input
            className={input}
            value={evento.nombre}
            onChange={(e) => onChange("nombre", e.target.value)}
            placeholder="Tu nombre"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Teléfono *</span>
          <input
            className={input}
            inputMode="tel"
            value={evento.telefono}
            onChange={(e) => onChange("telefono", e.target.value)}
            placeholder="10 dígitos"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Correo</span>
          <input
            className={input}
            type="email"
            value={evento.correo}
            onChange={(e) => onChange("correo", e.target.value)}
            placeholder="tucorreo@ejemplo.com"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Lugar</span>
          <input
            className={input}
            value={evento.lugar}
            onChange={(e) => onChange("lugar", e.target.value)}
            placeholder="Ciudad o salón"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Fecha *</span>
          <input
            className={input}
            type="date"
            value={evento.fecha}
            onChange={(e) => onChange("fecha", e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Hora</span>
          <input
            className={input}
            type="time"
            value={evento.hora}
            onChange={(e) => onChange("hora", e.target.value)}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-semibold">Comentarios</span>
          <textarea
            className={input}
            rows={3}
            value={evento.comentarios}
            onChange={(e) => onChange("comentarios", e.target.value)}
            placeholder="Temática, colores, alergias, etc."
          />
        </label>
      </div>
      <p className="mt-4 text-xs text-faint">* Campos obligatorios</p>
    </div>
  );
}

/* ---------------- Paso: Resumen ---------------- */
function StepResumen({
  seleccion,
  catalogo,
  ajustes,
  tipoBarraId,
}: {
  seleccion: Seleccion;
  catalogo: Catalogo;
  ajustes: Ajustes;
  tipoBarraId: string;
}) {
  const paquete = paqueteDe(catalogo, seleccion.paqueteId);
  const cot = calcularCotizacion(seleccion, catalogo, ajustes);
  const fmt = (n: number) => formatoMXN(n, ajustes.moneda);

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 text-4xl">🎉</div>
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Tu barra está lista
        </h2>
        <p className="mt-2 text-muted">
          Revisa el resumen y envíalo. Sin compromiso — te respondemos en 24 h.
        </p>
      </div>

      <div className="rounded-3xl border border-line bg-surface p-6">
        <Fila etiqueta="Paquete" valor={paquete?.nombre ?? "—"} />
        <Fila etiqueta="Invitados" valor={`${seleccion.invitados ?? "—"}`} />
        {catalogo.categorias.map((cat) => {
          const ids = seleccion.productos[cat.id] ?? [];
          if (ids.length === 0) return null;
          const nombres = ids
            .map((id) => cat.productos.find((p) => p.id === id)?.nombre ?? id)
            .join(", ");
          return <Fila key={cat.id} etiqueta={cat.nombre} valor={nombres} />;
        })}
        {seleccion.extras.length > 0 && (
          <Fila
            etiqueta="Extras"
            valor={seleccion.extras
              .map((id) => catalogo.extras.find((e) => e.id === id)?.nombre ?? id)
              .join(", ")}
          />
        )}

        <div className="mt-4 border-t border-line pt-4">
          <div className="flex justify-between text-sm text-muted">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">{fmt(cot.subtotal)}</span>
          </div>
          {cot.ivaAplica && (
            <div className="mt-1 flex justify-between text-sm text-muted">
              <span>IVA (16%)</span>
              <span className="font-mono tabular-nums">{fmt(cot.iva)}</span>
            </div>
          )}
          <div className="mt-3 flex items-end justify-between">
            <span className="font-semibold">Total estimado</span>
            <span className="font-display text-4xl font-semibold tabular-nums text-chamoy">
              {fmt(cot.total)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={linkWhatsApp(seleccion, catalogo, ajustes)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            guardarCotizacion(seleccion, "whatsapp", tipoBarraId).catch(() => {});
          }}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-[#25D366]/25 transition-transform hover:scale-[1.02]"
        >
          📲 Enviar por WhatsApp
        </a>
        <a
          href={linkCorreo(seleccion, catalogo, ajustes)}
          onClick={() => {
            guardarCotizacion(seleccion, "correo", tipoBarraId).catch(() => {});
          }}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 py-4 text-base font-semibold transition-colors hover:bg-surface-2"
        >
          ✉️ Solicitar por correo
        </a>
      </div>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-faint">
        🔒 Sin compromiso · Respuesta en menos de 24 horas
      </p>
    </div>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex gap-4 border-b border-line py-2.5 last:border-b-0">
      <span className="w-28 shrink-0 text-sm text-faint">{etiqueta}</span>
      <span className="text-sm font-medium">{valor}</span>
    </div>
  );
}
