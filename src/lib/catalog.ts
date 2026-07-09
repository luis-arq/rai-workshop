import type { Categoria, Extra, Paquete } from "./types";

// Opciones de número de invitados.
export const OPCIONES_INVITADOS = [30, 50, 80, 100, 150, 200];

export const PAQUETES: Paquete[] = [
  {
    id: "basico",
    nombre: "Básico",
    descripcion: "Lo esencial para una fiesta rica y sin complicaciones.",
    precioBase: 2500,
    precioPorInvitado: 40,
    recipientes: 6,
    servicios: ["Montaje básico", "2 horas de servicio"],
    limites: { papas: 2, gomitas: 3, cacahuates: 1, frutas: 1 },
  },
  {
    id: "premium",
    nombre: "Premium",
    destacado: true,
    descripcion: "El favorito. Más variedad, más recipientes, mejor montaje.",
    precioBase: 3200,
    precioPorInvitado: 55,
    recipientes: 9,
    servicios: ["Montaje decorado", "3 horas de servicio", "1 persona de apoyo"],
    limites: { papas: 2, gomitas: 3, cacahuates: 2, frutas: 2 },
  },
  {
    id: "deluxe",
    nombre: "Deluxe",
    descripcion: "La barra que se roba la fiesta. Máxima variedad y presencia.",
    precioBase: 4500,
    precioPorInvitado: 75,
    recipientes: 12,
    servicios: [
      "Montaje premium",
      "4 horas de servicio",
      "2 personas de apoyo",
      "Decoración incluida",
    ],
    limites: { papas: 3, gomitas: 4, cacahuates: 2, frutas: 3 },
  },
  {
    id: "corporativo",
    nombre: "Corporativo",
    descripcion: "Pensado para empresas: factura, logística y personal uniformado.",
    precioBase: 5000,
    precioPorInvitado: 65,
    recipientes: 12,
    servicios: [
      "Facturación",
      "Montaje corporativo",
      "Personal uniformado",
      "Logística de sede",
    ],
    limites: { papas: 3, gomitas: 3, cacahuates: 2, frutas: 2 },
  },
];

export const CATEGORIAS: Categoria[] = [
  {
    id: "papas",
    nombre: "Papas",
    instruccionBase: "Elige tus papas favoritas.",
    limiteDefault: 2,
    productos: [
      { id: "doritos-nacho", nombre: "Doritos Nacho", emoji: "🧀", disponible: true },
      { id: "doritos-flamin", nombre: "Doritos Flamin Hot", emoji: "🔥", disponible: true },
      { id: "sabritas", nombre: "Sabritas", emoji: "🥔", disponible: true },
      { id: "ruffles", nombre: "Ruffles", emoji: "🌀", disponible: true },
      { id: "chips-jalapeno", nombre: "Chips Jalapeño", emoji: "🌶️", disponible: true },
      { id: "cheetos", nombre: "Cheetos", emoji: "🟠", disponible: true },
      { id: "takis", nombre: "Takis", emoji: "🌯", disponible: true },
    ],
  },
  {
    id: "gomitas",
    nombre: "Gomitas",
    instruccionBase: "Las gomitas nunca fallan.",
    limiteDefault: 3,
    productos: [
      { id: "panditas", nombre: "Panditas", emoji: "🐻", disponible: true },
      { id: "aros-durazno", nombre: "Aros de Durazno", emoji: "🍑", disponible: true },
      { id: "gusanos", nombre: "Gusanos Ácidos", emoji: "🪱", disponible: true },
      { id: "ositos", nombre: "Ositos", emoji: "🧸", disponible: true },
      { id: "cerezas", nombre: "Cerezas", emoji: "🍒", disponible: true },
      { id: "moras", nombre: "Moras", emoji: "🫐", disponible: true },
      { id: "dedos", nombre: "Dedos", emoji: "👆", disponible: true },
      { id: "huevitos", nombre: "Huevitos", emoji: "🥚", disponible: true },
      { id: "aros-sandia", nombre: "Aros de Sandía", emoji: "🍉", disponible: true },
      { id: "lombrices", nombre: "Lombrices", emoji: "🐍", disponible: true },
    ],
  },
  {
    id: "cacahuates",
    nombre: "Cacahuates",
    instruccionBase: "El toque salado y crujiente.",
    limiteDefault: 2,
    productos: [
      { id: "japones", nombre: "Japonés", emoji: "🥜", disponible: true },
      { id: "enchilado", nombre: "Enchilado", emoji: "🌶️", disponible: true },
      { id: "salado", nombre: "Salado", emoji: "🧂", disponible: true },
      { id: "garapinado", nombre: "Garapiñado", emoji: "🍬", disponible: true },
      { id: "de-la-rosa", nombre: "Mazapán (De la Rosa)", emoji: "🌸", disponible: true },
    ],
  },
  {
    id: "frutas",
    nombre: "Frutas",
    instruccionBase: "El toque fresco con chile y limón.",
    limiteDefault: 2,
    productos: [
      { id: "mango", nombre: "Mango", emoji: "🥭", disponible: true },
      { id: "pepino", nombre: "Pepino", emoji: "🥒", disponible: true },
      { id: "pina", nombre: "Piña", emoji: "🍍", disponible: true },
      { id: "sandia", nombre: "Sandía", emoji: "🍉", disponible: true },
      { id: "melon", nombre: "Melón", emoji: "🍈", disponible: true },
      { id: "jicama", nombre: "Jícama", emoji: "🤍", disponible: true },
      { id: "fresa", nombre: "Fresa", emoji: "🍓", disponible: true },
      { id: "uvas", nombre: "Uvas", emoji: "🍇", disponible: true },
    ],
  },
];

export const EXTRAS: Extra[] = [
  { id: "chamoy", nombre: "Chamoy Premium", emoji: "🫙", precio: 250, disponible: true },
  { id: "miguelito", nombre: "Miguelito", emoji: "🌶️", precio: 120, disponible: true },
  { id: "lucas", nombre: "Lucas", emoji: "🍭", precio: 120, disponible: true },
  { id: "tajin", nombre: "Tajín", emoji: "🧂", precio: 100, disponible: true },
  { id: "queso-nachos", nombre: "Queso para Nachos", emoji: "🧀", precio: 350, disponible: true },
  { id: "decoracion", nombre: "Decoración personalizada", emoji: "🎈", precio: 800, disponible: true },
  { id: "barra-iluminada", nombre: "Barra iluminada", emoji: "💡", precio: 900, disponible: true },
  { id: "personal", nombre: "Personal uniformado", emoji: "👔", precio: 600, disponible: true },
  { id: "vasos", nombre: "Vasos personalizados", emoji: "🥤", precio: 450, disponible: true },
  { id: "letrero", nombre: "Letrero con nombre", emoji: "✨", precio: 500, disponible: true },
];

// Helpers de acceso rápido.
export const getPaquete = (id: string | null) =>
  PAQUETES.find((p) => p.id === id) ?? null;

export const getCategoria = (id: string) =>
  CATEGORIAS.find((c) => c.id === id) ?? null;

export const getExtra = (id: string) => EXTRAS.find((e) => e.id === id) ?? null;

export const getProducto = (id: string) => {
  for (const c of CATEGORIAS) {
    const p = c.productos.find((x) => x.id === id);
    if (p) return p;
  }
  return null;
};
