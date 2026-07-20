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

function slugify(s: string): string {
  const base = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "item"}-${Date.now().toString(36).slice(-4)}`;
}

// ---- Crear / eliminar productos ----
export async function crearProducto(formData: FormData) {
  await requireAdmin();
  const categoriaId = String(formData.get("categoria_id"));
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!categoriaId || !nombre) return;
  const [{ orden }] = await sql`
    select coalesce(max(orden), -1) + 1 as orden from productos where categoria_id = ${categoriaId}`;
  await sql`
    insert into productos (categoria_id, slug, nombre, emoji, orden)
    values (${categoriaId}, ${slugify(nombre)}, ${nombre}, '🍬', ${orden})`;
  revalidatePath("/admin/productos");
  revalidatePath("/configura");
}

export async function eliminarProducto(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  if (!id) return;
  await sql`delete from productos where id = ${id}`;
  revalidatePath("/admin/productos");
  revalidatePath("/configura");
}

// ---- Crear / eliminar extras ----
export async function crearExtra(formData: FormData) {
  await requireAdmin();
  const tipoBarraId = String(formData.get("tipo_barra_id"));
  const nombre = String(formData.get("nombre") ?? "").trim();
  const precio = num(formData.get("precio"));
  if (!tipoBarraId || !nombre) return;
  const [{ orden }] = await sql`
    select coalesce(max(orden), -1) + 1 as orden from extras where tipo_barra_id = ${tipoBarraId}`;
  await sql`
    insert into extras (tipo_barra_id, slug, nombre, emoji, precio, orden)
    values (${tipoBarraId}, ${slugify(nombre)}, ${nombre}, '✨', ${precio}, ${orden})`;
  revalidatePath("/admin/extras");
  revalidatePath("/configura");
}

export async function eliminarExtra(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  if (!id) return;
  await sql`delete from extras where id = ${id}`;
  revalidatePath("/admin/extras");
  revalidatePath("/configura");
}

// ---- Crear / eliminar barras ----
export async function crearTipoBarra(formData: FormData) {
  await requireAdmin();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "").trim() || "🍽️";
  if (!nombre) return;
  const [{ orden }] = await sql`select coalesce(max(orden), -1) + 1 as orden from tipos_barra`;
  // Nace deshabilitada (aún sin productos).
  const [tb] = await sql`
    insert into tipos_barra (slug, nombre, emoji, activo, orden)
    values (${slugify(nombre)}, ${nombre}, ${emoji}, false, ${orden})
    returning id`;

  // Sembramos una categoría y un paquete inicial para que sea usable.
  const [cat] = await sql`
    insert into categorias (slug, nombre, instruccion, limite_default, orden, tipo_barra_id)
    values (${slugify("productos")}, 'Productos', 'Elige tus productos.', 3, 0, ${tb.id})
    returning id`;
  const [paq] = await sql`
    insert into paquetes (slug, nombre, descripcion, precio_base, precio_por_invitado,
                          recipientes, servicios, destacado, orden, tipo_barra_id)
    values (${slugify("basico")}, 'Básico', ${nombre}, 2500, 40, 6,
            ${sql.json([])}, false, 0, ${tb.id})
    returning id`;
  await sql`
    insert into paquete_limites (paquete_id, categoria_id, limite)
    values (${paq.id}, ${cat.id}, 3)`;

  revalidatePath("/admin/barras");
}

export async function eliminarTipoBarra(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  if (!id) return;
  // Las cotizaciones ya no apuntan a esta barra; su catálogo se borra en cascada.
  await sql`update cotizaciones set tipo_barra_id = null where tipo_barra_id = ${id}`;
  await sql`delete from tipos_barra where id = ${id}`;
  revalidatePath("/admin/barras");
  revalidatePath("/configura");
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

  // Imagen opcional → Supabase Storage.
  const imagen = formData.get("imagen");
  if (imagen instanceof File && imagen.size > 0) {
    const url = await subirImagen("productos", `p/${id}`, imagen);
    if (url) await sql`update productos set imagen_url = ${url} where id = ${id}`;
  }

  revalidatePath("/admin/productos");
  revalidatePath("/configura");
}

// Sube un archivo al bucket y regresa la URL pública (con versión para
// evitar caché). Regresa null si algo falla.
async function subirImagen(
  bucket: string,
  base: string,
  file: File
): Promise<string | null> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${base}.${ext}`;
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
  if (error) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function updateExtra(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const nombre = String(formData.get("nombre") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "").trim();
  const precio = num(formData.get("precio"));
  const disponible = formData.get("disponible") === "on";
  if (!id || !nombre) return;
  await sql`
    update extras
    set nombre = ${nombre}, emoji = ${emoji}, precio = ${precio},
        disponible = ${disponible}
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

// ---- Usuarios admin ----
// Crea (o actualiza la contraseña de) un usuario admin directamente en
// Supabase Auth. Reutiliza la lógica probada de db/create-admin.mjs.
export async function crearUsuario(formData: FormData) {
  await requireAdmin();
  const correo = String(formData.get("correo") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!correo || password.length < 6) return;

  const [{ schema }] = await sql`
    select n.nspname as schema from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'crypt' limit 1`;
  const crypt = (pw: string) =>
    sql`${sql(schema)}.crypt(${pw}::text, ${sql(schema)}.gen_salt('bf'::text))`;

  const [existente] = await sql`select id from auth.users where email = ${correo}`;
  let id: string;
  if (existente) {
    id = existente.id;
    await sql`
      update auth.users set encrypted_password = ${crypt(password)},
        updated_at = now(), email_confirmed_at = coalesce(email_confirmed_at, now())
      where id = ${id}`;
  } else {
    const [row] = await sql`
      insert into auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
      ) values (
        gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated', ${correo}, ${crypt(password)},
        now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'
      ) returning id`;
    id = row.id;
  }

  // GoTrue exige cadenas vacías (no NULL) en columnas de token.
  await sql`
    update auth.users set
      confirmation_token = coalesce(confirmation_token, ''),
      recovery_token = coalesce(recovery_token, ''),
      email_change = coalesce(email_change, ''),
      email_change_token_new = coalesce(email_change_token_new, ''),
      email_change_token_current = coalesce(email_change_token_current, ''),
      phone_change = coalesce(phone_change, ''),
      phone_change_token = coalesce(phone_change_token, ''),
      reauthentication_token = coalesce(reauthentication_token, '')
    where id = ${id}`;

  const [ident] = await sql`
    select 1 from auth.identities where user_id = ${id} and provider = 'email'`;
  if (!ident) {
    await sql`
      insert into auth.identities (
        id, provider_id, user_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      ) values (
        gen_random_uuid(), ${correo}, ${id},
        jsonb_build_object('sub', ${id}::text, 'email', ${correo}),
        'email', now(), now(), now()
      )`;
  }
  revalidatePath("/admin/usuarios");
}

export async function eliminarUsuario(formData: FormData) {
  const yo = await requireAdmin();
  const id = String(formData.get("id"));
  if (!id || id === yo.id) return; // no permitir borrarse a sí mismo
  await sql`delete from auth.identities where user_id = ${id}`;
  await sql`delete from auth.users where id = ${id}`;
  revalidatePath("/admin/usuarios");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
