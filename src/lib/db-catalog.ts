// Acceso a datos del catálogo (SOLO servidor — usa DATABASE_URL).
// Mapea las filas de Supabase a los mismos tipos que usa el wizard,
// usando `slug` como id estable. Reemplaza al catálogo estático.

import { sql } from "@/lib/db";
import type {
  Ajustes,
  Catalogo,
  Categoria,
  CategoriaId,
  Extra,
  Paquete,
  Producto,
} from "@/lib/types";

export async function getCatalogo(): Promise<Catalogo> {
  const [cats, prods, paqs, limites, extras] = await Promise.all([
    sql`select id, slug, nombre, instruccion, limite_default, orden
        from categorias where activa order by orden`,
    sql`select id, categoria_id, slug, nombre, emoji, disponible, orden
        from productos order by orden`,
    sql`select id, slug, nombre, descripcion, precio_base, precio_por_invitado,
               recipientes, servicios, destacado, orden
        from paquetes where activo order by orden`,
    sql`select pl.paquete_id, c.slug as categoria_slug, pl.limite
        from paquete_limites pl join categorias c on c.id = pl.categoria_id`,
    sql`select slug, nombre, emoji, precio, disponible, orden
        from extras order by orden`,
  ]);

  // Productos agrupados por categoría
  const porCategoria = new Map<string, Producto[]>();
  for (const p of prods) {
    const arr = porCategoria.get(p.categoria_id) ?? [];
    arr.push({
      id: p.slug,
      nombre: p.nombre,
      emoji: p.emoji ?? "🍬",
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

  // Límites por paquete → { categoriaSlug: limite }
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
