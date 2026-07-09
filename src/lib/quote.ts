import { extraDe, paqueteDe, productoDe } from "./catalog-helpers";
import { calcularCotizacion, formatoMXN } from "./pricing";
import type { Ajustes, Catalogo, Seleccion } from "./types";

// Construye el texto de resumen que viaja por WhatsApp o correo.
export function construirResumen(
  seleccion: Seleccion,
  catalogo: Catalogo,
  ajustes: Ajustes
): string {
  const paquete = paqueteDe(catalogo, seleccion.paqueteId);
  const cot = calcularCotizacion(seleccion, catalogo, ajustes);
  const fmt = (n: number) => formatoMXN(n, ajustes.moneda);
  const L: string[] = [];

  L.push("🍬 *Cotización Samai*");
  L.push("");
  L.push(`*Paquete:* ${paquete?.nombre ?? "—"}`);
  L.push(`*Invitados:* ${seleccion.invitados ?? "—"}`);
  L.push("");

  for (const cat of catalogo.categorias) {
    const ids = seleccion.productos[cat.id] ?? [];
    if (ids.length === 0) continue;
    const nombres = ids
      .map((id) => productoDe(catalogo, id)?.nombre ?? id)
      .join(", ");
    L.push(`*${cat.nombre}:* ${nombres}`);
  }

  if (seleccion.extras.length > 0) {
    const nombres = seleccion.extras
      .map((id) => {
        const e = extraDe(catalogo, id);
        return e ? `${e.nombre} (${fmt(e.precio)})` : id;
      })
      .join(", ");
    L.push(`*Extras:* ${nombres}`);
  }

  L.push("");
  L.push(`Subtotal: ${fmt(cot.subtotal)}`);
  if (cot.ivaAplica) L.push(`IVA (16%): ${fmt(cot.iva)}`);
  L.push(`*Total estimado: ${fmt(cot.total)}*`);

  const ev = seleccion.evento;
  if (ev.nombre || ev.fecha || ev.telefono) {
    L.push("");
    L.push("*Datos del evento*");
    if (ev.nombre) L.push(`Nombre: ${ev.nombre}`);
    if (ev.telefono) L.push(`Teléfono: ${ev.telefono}`);
    if (ev.correo) L.push(`Correo: ${ev.correo}`);
    if (ev.fecha) L.push(`Fecha: ${ev.fecha}${ev.hora ? ` ${ev.hora}` : ""}`);
    if (ev.lugar) L.push(`Lugar: ${ev.lugar}`);
    if (ev.comentarios) L.push(`Comentarios: ${ev.comentarios}`);
  }

  return L.join("\n");
}

export function linkWhatsApp(
  seleccion: Seleccion,
  catalogo: Catalogo,
  ajustes: Ajustes
): string {
  const texto = encodeURIComponent(
    construirResumen(seleccion, catalogo, ajustes)
  );
  return `https://wa.me/${ajustes.whatsapp}?text=${texto}`;
}

export function linkCorreo(
  seleccion: Seleccion,
  catalogo: Catalogo,
  ajustes: Ajustes
): string {
  const asunto = encodeURIComponent("Solicitud de cotización — Samai");
  const cuerpo = encodeURIComponent(
    construirResumen(seleccion, catalogo, ajustes).replace(/\*/g, "")
  );
  return `mailto:${ajustes.correo}?subject=${asunto}&body=${cuerpo}`;
}
