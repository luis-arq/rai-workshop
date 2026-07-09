import { extraDe, paqueteDe } from "./catalog-helpers";
import type {
  Ajustes,
  Catalogo,
  CategoriaId,
  Cotizacion,
  Seleccion,
} from "./types";

// El precio SIEMPRE se calcula aquí. En el cliente para mostrar en vivo, y en
// el servidor (con el catálogo de la DB) como fuente de verdad al guardar.
export function calcularCotizacion(
  seleccion: Seleccion,
  catalogo: Catalogo,
  ajustes: Ajustes
): Cotizacion {
  const paquete = paqueteDe(catalogo, seleccion.paqueteId);
  const invitados = seleccion.invitados ?? 0;

  const base = paquete ? paquete.precioBase : 0;
  const porInvitados = paquete ? paquete.precioPorInvitado * invitados : 0;
  const extras = seleccion.extras.reduce((sum, id) => {
    const e = extraDe(catalogo, id);
    return sum + (e ? e.precio : 0);
  }, 0);

  const subtotal = base + porInvitados + extras;
  const iva = ajustes.ivaAplica ? Math.round(subtotal * ajustes.ivaTasa) : 0;
  const total = subtotal + iva;

  return { subtotal, iva, total, ivaAplica: ajustes.ivaAplica };
}

export const formatoMXN = (n: number, moneda = "MXN") =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: moneda,
    maximumFractionDigits: 0,
  }).format(n);

// Límite de selección de una categoría según el paquete elegido.
export function limiteDeCategoria(
  catalogo: Catalogo,
  paqueteId: string | null,
  categoriaId: CategoriaId,
  limiteDefault: number
): number {
  const paquete = paqueteDe(catalogo, paqueteId);
  return paquete?.limites[categoriaId] ?? limiteDefault;
}
