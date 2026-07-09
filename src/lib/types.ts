// Tipos centrales del configurador Samai.
// Hoy el catálogo vive en catalog.ts; mañana estas mismas formas se leerán
// desde Supabase sin cambiar la UI.

export type CategoriaId = "papas" | "gomitas" | "cacahuates" | "frutas";

export interface Producto {
  id: string;
  nombre: string;
  emoji: string;
  disponible: boolean;
}

export interface Categoria {
  id: CategoriaId;
  nombre: string;
  instruccionBase: string; // texto que se muestra arriba del paso
  limiteDefault: number; // límite si el paquete no lo sobreescribe
  productos: Producto[];
}

export interface Paquete {
  id: string;
  nombre: string;
  destacado?: boolean;
  descripcion: string;
  precioBase: number;
  precioPorInvitado: number;
  recipientes: number;
  servicios: string[];
  // Límite de selección por categoría para este paquete.
  limites: Partial<Record<CategoriaId, number>>;
}

export interface Extra {
  id: string;
  nombre: string;
  emoji: string;
  precio: number;
  disponible: boolean;
}

export interface DatosEvento {
  nombre: string;
  correo: string;
  telefono: string;
  fecha: string;
  hora: string;
  lugar: string;
  comentarios: string;
}

export interface Seleccion {
  invitados: number | null;
  paqueteId: string | null;
  productos: Record<CategoriaId, string[]>;
  extras: string[];
  evento: DatosEvento;
}

export interface Cotizacion {
  subtotal: number;
  iva: number;
  total: number;
  ivaAplica: boolean;
}

// Catálogo cargado (desde la base de datos o el archivo estático).
export interface Catalogo {
  categorias: Categoria[];
  paquetes: Paquete[];
  extras: Extra[];
}

// Ajustes del negocio (tabla `ajustes`).
export interface Ajustes {
  whatsapp: string;
  correo: string;
  ivaAplica: boolean;
  ivaTasa: number;
  moneda: string;
}
