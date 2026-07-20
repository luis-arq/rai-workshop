// Acceso a datos del catálogo (SOLO servidor — usa DATABASE_URL).
// El catálogo ahora está segmentado por tipo de barra.

import { sql } from "@/lib/db";
import type {
  Ajustes,
  Catalogo,
  Categoria,
  CategoriaId,
  Extra,
  Paquete,
  Producto,
  TipoBarra,
} from "@/lib/types";

// Tipos de barra activos (para el selector del cliente).
export async function getTiposBarraActivos(): Promise<TipoBarra[]> {
  const rows = await sql`
    select id, slug, nombre, emoji, descripcion, activo
    from tipos_barra where activo = true order by orden`;
  return rows.map(mapTipo);
}

// Todos los tipos (para el admin).
export async function getTiposBarra(): Promise<TipoBarra[]> {
  const rows = await sql`
    select id, slug, nombre, emoji, descripcion, activo
    from tipos_barra order by orden`;
  return rows.map(mapTipo);
}

export async function getTipoBarraPorSlug(
  slug: string
): Promise<TipoBarra | null> {
  const [row] = await sql`
    select id, slug, nombre, emoji, descripcion, activo
    from tipos_barra where slug = ${slug}`;
  return row ? mapTipo(row) : null;
}

function mapTipo(r: Record<string, unknown>): TipoBarra {
  return {
    id: r.id as string,
    slug: r.slug as string,
    nombre: r.nombre as string,
    emoji: (r.emoji as string) ?? "🍿",
    descripcion: (r.descripcion as string) ?? "",
    activo: r.activo as boolean,
  };
}

// Catálogo de UN tipo de barra.
export async function getCatalogo(tipoBarraId: string): Promise<Catalogo> {
  const [cats, prods, paqs, limites, extras] = await Promise.all([
    sql`select id, slug, nombre, instruccion, limite_default, orden
        from categorias where activa and tipo_barra_id = ${tipoBarraId} order by orden`,
    sql`select p.id, p.categoria_id, p.slug, p.nombre, p.emoji, p.imagen_url, p.disponible, p.orden
        from productos p join categorias c on c.id = p.categoria_id
        where c.tipo_barra_id = ${tipoBarraId} order by p.orden`,
    sql`select id, slug, nombre, descripcion, precio_base, precio_por_invitado,
               recipientes, servicios, destacado, orden
        from paquetes where activo and tipo_barra_id = ${tipoBarraId} order by orden`,
    sql`select pl.paquete_id, c.slug as categoria_slug, pl.limite
        from paquete_limites pl join categorias c on c.id = pl.categoria_id
        where c.tipo_barra_id = ${tipoBarraId}`,
    sql`select slug, nombre, emoji, precio, disponible, orden
        from extras where tipo_barra_id = ${tipoBarraId} order by orden`,
  ]);

  const porCategoria = new Map<string, Producto[]>();
  for (const p of prods) {
    const arr = porCategoria.get(p.categoria_id) ?? [];
    arr.push({
      id: p.slug,
      nombre: p.nombre,
      emoji: p.emoji ?? "🍬",
      imagenUrl: p.imagen_url ?? null,
      disponible: p.disponible,
    });
    porCategoria.set(p.categoria_id, arr);
  }

  const categorias: Categoria[] = cats.map((c) => ({
    id: c.slug as CategoriaId,
    nombre: c.nombre,
    instruccionBase: c.instruccion ?? "",
    limiteDefault: c.limite_default,
    productos: porCategoria.get(c.id) ?? [],
  }));

  const limitesPorPaquete = new Map<string, Partial<Record<CategoriaId, number>>>();
  for (const l of limites) {
    const m = limitesPorPaquete.get(l.paquete_id) ?? {};
    m[l.categoria_slug as CategoriaId] = l.limite;
    limitesPorPaquete.set(l.paquete_id, m);
  }

  const paquetes: Paquete[] = paqs.map((p) => ({
    id: p.slug,
    nombre: p.nombre,
    descripcion: p.descripcion ?? "",
    precioBase: Number(p.precio_base),
    precioPorInvitado: Number(p.precio_por_invitado),
    recipientes: p.recipientes,
    servicios: Array.isArray(p.servicios) ? p.servicios : [],
    destacado: p.destacado,
    limites: limitesPorPaquete.get(p.id) ?? {},
  }));

  const extrasMapped: Extra[] = extras.map((e) => ({
    id: e.slug,
    nombre: e.nombre,
    emoji: e.emoji ?? "✨",
    precio: Number(e.precio),
    disponible: e.disponible,
  }));

  return { categorias, paquetes, extras: extrasMapped };
}

export async function getAjustes(): Promise<Ajustes> {
  const [row] = await sql`select whatsapp, correo, iva_aplica, iva_tasa, moneda
                          from ajustes where id = 1`;
  return {
    whatsapp: row?.whatsapp ?? "5215500000000",
    correo: row?.correo ?? "hola@samai.mx",
    ivaAplica: row?.iva_aplica ?? true,
    ivaTasa: row ? Number(row.iva_tasa) : 0.16,
    moneda: row?.moneda ?? "MXN",
  };
}
