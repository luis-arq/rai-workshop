// Helpers puros sobre un Catalogo cargado. Seguros en cliente y servidor
// (no tocan la base de datos).

import type { Catalogo, CategoriaId } from "./types";

export const paqueteDe = (cat: Catalogo, id: string | null) =>
  cat.paquetes.find((p) => p.id === id) ?? null;

export const extraDe = (cat: Catalogo, id: string) =>
  cat.extras.find((e) => e.id === id) ?? null;

export const categoriaDe = (cat: Catalogo, id: CategoriaId) =>
  cat.categorias.find((c) => c.id === id) ?? null;

export const productoDe = (cat: Catalogo, id: string) => {
  for (const c of cat.categorias) {
    const p = c.productos.find((x) => x.id === id);
    if (p) return p;
  }
  return null;
};
