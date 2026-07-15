"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

// Todas las mutaciones verifican sesión de admin antes de escribir.
// El precio y los datos son la fuente de verdad del servidor.

function num(v: FormDataEntryValue | null): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export async function updateProducto(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const nombre = String(formData.get("nombre") ?? "").trim();
  const precio = num(formData.get("precio_extra"));
  const disponible = formData.get("disponible") === "on";
  if (!id || !nombre) return;
  await sql`
    update productos
    set nombre = ${nombre}, precio_extra = ${precio}, disponible = ${disponible}
    where id = ${id}`;
  revalidatePath("/admin/productos");
}

export async function updateExtra(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const nombre = String(formData.get("nombre") ?? "").trim();
  const precio = num(formData.get("precio"));
  const disponible = formData.get("disponible") === "on";
  if (!id || !nombre) return;
  await sql`
    update extras
    set nombre = ${nombre}, precio = ${precio}, disponible = ${disponible}
    where id = ${id}`;
  revalidatePath("/admin/extras");
}

export async function updatePaquete(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const nombre = String(formData.get("nombre") ?? "").trim();
  const base = num(formData.get("precio_base"));
  const porInv = num(formData.get("precio_por_invitado"));
  if (!id || !nombre) return;
  await sql`
    update paquetes
    set nombre = ${nombre}, precio_base = ${base}, precio_por_invitado = ${porInv}
    where id = ${id}`;
  revalidatePath("/admin/paquetes");
}

export async function updateTipoBarra(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const nombre = String(formData.get("nombre") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "").trim();
  const activo = formData.get("activo") === "on";
  if (!id || !nombre) return;
  await sql`
    update tipos_barra
    set nombre = ${nombre}, emoji = ${emoji}, activo = ${activo}
    where id = ${id}`;
  revalidatePath("/admin/barras");
  revalidatePath("/configura");
}

export async function updateAjustes(formData: FormData) {
  await requireAdmin();
  const whatsapp = String(formData.get("whatsapp") ?? "").replace(/\D/g, "");
  const correo = String(formData.get("correo") ?? "").trim();
  const ivaAplica = formData.get("iva_aplica") === "on";
  // El campo se captura como porcentaje (16), se guarda como fracción (0.16).
  const pct = Number(formData.get("iva_pct"));
  const ivaTasa = Number.isFinite(pct) ? Math.min(1, Math.max(0, pct / 100)) : 0.16;
  const moneda = String(formData.get("moneda") ?? "MXN").trim() || "MXN";
  await sql`
    insert into ajustes (id, whatsapp, correo, iva_aplica, iva_tasa, moneda)
    values (1, ${whatsapp}, ${correo}, ${ivaAplica}, ${ivaTasa}, ${moneda})
    on conflict (id) do update set
      whatsapp = excluded.whatsapp, correo = excluded.correo,
      iva_aplica = excluded.iva_aplica, iva_tasa = excluded.iva_tasa,
      moneda = excluded.moneda`;
  revalidatePath("/admin/ajustes");
}

export async function updateEstadoCotizacion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const estado = String(formData.get("estado"));
  const permitidos = ["nueva", "proceso", "ganada", "perdida"];
  if (!id || !permitidos.includes(estado)) return;
  await sql`update cotizaciones set estado = ${estado} where id = ${id}`;
  revalidatePath("/admin/cotizaciones");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
