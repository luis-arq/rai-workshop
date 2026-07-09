"use server";

import { sql } from "@/lib/db";
import { getAjustes, getCatalogo } from "@/lib/db-catalog";
import { calcularCotizacion } from "@/lib/pricing";
import type { Seleccion } from "@/lib/types";

// Acción PÚBLICA (el cliente no tiene sesión). Guarda la cotización en la DB
// recalculando el precio en el servidor con el catálogo vigente — nunca se
// confía en el total que manda el navegador.
export async function guardarCotizacion(
  seleccion: Seleccion,
  canal: "whatsapp" | "correo"
) {
  const [catalogo, ajustes] = await Promise.all([getCatalogo(), getAjustes()]);
  const cot = calcularCotizacion(seleccion, catalogo, ajustes);
  const ev = seleccion.evento;

  const nombre = ev.nombre?.trim() || null;
  const correo = ev.correo?.trim() || null;
  const telefono = ev.telefono?.trim() || null;

  // Cliente (uno por cotización en el MVP; se puede deduplicar luego).
  let clienteId: string | null = null;
  if (nombre || correo || telefono) {
    const [c] = await sql`
      insert into clientes (nombre, correo, telefono)
      values (${nombre}, ${correo}, ${telefono})
      returning id`;
    clienteId = c.id;
  }

  // slug de paquete → uuid
  let paqueteId: string | null = null;
  if (seleccion.paqueteId) {
    const [p] = await sql`select id from paquetes where slug = ${seleccion.paqueteId}`;
    paqueteId = p?.id ?? null;
  }

  await sql`
    insert into cotizaciones (
      cliente_id, paquete_id, invitados, subtotal, iva, total,
      estado, canal, seleccion, fecha_evento, hora, lugar, comentarios
    ) values (
      ${clienteId}, ${paqueteId}, ${seleccion.invitados},
      ${cot.subtotal}, ${cot.iva}, ${cot.total},
      'nueva', ${canal}, ${sql.json(
        seleccion as unknown as Parameters<typeof sql.json>[0]
      )},
      ${ev.fecha || null}, ${ev.hora || null}, ${ev.lugar || null},
      ${ev.comentarios || null}
    )`;
}
