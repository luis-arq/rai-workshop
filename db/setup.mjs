// Aplica el esquema y siembra el catálogo de Samai en Supabase.
//
// Uso:
//   node --env-file=.env.local db/setup.mjs
//
// Es idempotente: re-correrlo REINICIA el catálogo a estos valores por defecto
// (útil para empezar limpio). El admin editará luego desde el panel.

import postgres from "postgres";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = postgres(process.env.DATABASE_URL, { prepare: false });

// ---- Datos del catálogo (espejo de src/lib/catalog.ts) ----
const CATEGORIAS = [
  { slug: "papas", nombre: "Papas", instruccion: "Elige tus papas favoritas.", limite: 2, orden: 1,
    productos: [
      ["doritos-nacho", "Doritos Nacho", "🧀"], ["doritos-flamin", "Doritos Flamin Hot", "🔥"],
      ["sabritas", "Sabritas", "🥔"], ["ruffles", "Ruffles", "🌀"],
      ["chips-jalapeno", "Chips Jalapeño", "🌶️"], ["cheetos", "Cheetos", "🟠"], ["takis", "Takis", "🌯"],
    ] },
  { slug: "gomitas", nombre: "Gomitas", instruccion: "Las gomitas nunca fallan.", limite: 3, orden: 2,
    productos: [
      ["panditas", "Panditas", "🐻"], ["aros-durazno", "Aros de Durazno", "🍑"],
      ["gusanos", "Gusanos Ácidos", "🪱"], ["ositos", "Ositos", "🧸"], ["cerezas", "Cerezas", "🍒"],
      ["moras", "Moras", "🫐"], ["dedos", "Dedos", "👆"], ["huevitos", "Huevitos", "🥚"],
      ["aros-sandia", "Aros de Sandía", "🍉"], ["lombrices", "Lombrices", "🐍"],
    ] },
  { slug: "cacahuates", nombre: "Cacahuates", instruccion: "El toque salado y crujiente.", limite: 2, orden: 3,
    productos: [
      ["japones", "Japonés", "🥜"], ["enchilado", "Enchilado", "🌶️"], ["salado", "Salado", "🧂"],
      ["garapinado", "Garapiñado", "🍬"], ["de-la-rosa", "Mazapán (De la Rosa)", "🌸"],
    ] },
  { slug: "frutas", nombre: "Frutas", instruccion: "El toque fresco con chile y limón.", limite: 2, orden: 4,
    productos: [
      ["mango", "Mango", "🥭"], ["pepino", "Pepino", "🥒"], ["pina", "Piña", "🍍"],
      ["sandia", "Sandía", "🍉"], ["melon", "Melón", "🍈"], ["jicama", "Jícama", "🤍"],
      ["fresa", "Fresa", "🍓"], ["uvas", "Uvas", "🍇"],
    ] },
];

const PAQUETES = [
  { slug: "basico", nombre: "Básico", desc: "Lo esencial para una fiesta rica y sin complicaciones.",
    base: 2500, porInv: 40, recip: 6, destacado: false, orden: 1,
    servicios: ["Montaje básico", "2 horas de servicio"],
    limites: { papas: 2, gomitas: 3, cacahuates: 1, frutas: 1 } },
  { slug: "premium", nombre: "Premium", desc: "El favorito. Más variedad, más recipientes, mejor montaje.",
    base: 3200, porInv: 55, recip: 9, destacado: true, orden: 2,
    servicios: ["Montaje decorado", "3 horas de servicio", "1 persona de apoyo"],
    limites: { papas: 2, gomitas: 3, cacahuates: 2, frutas: 2 } },
  { slug: "deluxe", nombre: "Deluxe", desc: "La barra que se roba la fiesta. Máxima variedad y presencia.",
    base: 4500, porInv: 75, recip: 12, destacado: false, orden: 3,
    servicios: ["Montaje premium", "4 horas de servicio", "2 personas de apoyo", "Decoración incluida"],
    limites: { papas: 3, gomitas: 4, cacahuates: 2, frutas: 3 } },
  { slug: "corporativo", nombre: "Corporativo", desc: "Pensado para empresas: factura, logística y personal uniformado.",
    base: 5000, porInv: 65, recip: 12, destacado: false, orden: 4,
    servicios: ["Facturación", "Montaje corporativo", "Personal uniformado", "Logística de sede"],
    limites: { papas: 3, gomitas: 3, cacahuates: 2, frutas: 2 } },
];

const EXTRAS = [
  ["chamoy", "Chamoy Premium", "🫙", 250], ["miguelito", "Miguelito", "🌶️", 120],
  ["lucas", "Lucas", "🍭", 120], ["tajin", "Tajín", "🧂", 100],
  ["queso-nachos", "Queso para Nachos", "🧀", 350], ["decoracion", "Decoración personalizada", "🎈", 800],
  ["barra-iluminada", "Barra iluminada", "💡", 900], ["personal", "Personal uniformado", "👔", 600],
  ["vasos", "Vasos personalizados", "🥤", 450], ["letrero", "Letrero con nombre", "✨", 500],
];

async function main() {
  console.log("→ Aplicando esquema…");
  const schema = await readFile(join(__dirname, "schema.sql"), "utf8");
  await sql.unsafe(schema);

  console.log("→ Sembrando categorías y productos…");
  const catId = {};
  for (const c of CATEGORIAS) {
    const [row] = await sql`
      insert into categorias (slug, nombre, instruccion, limite_default, orden)
      values (${c.slug}, ${c.nombre}, ${c.instruccion}, ${c.limite}, ${c.orden})
      on conflict (slug) do update set
        nombre = excluded.nombre, instruccion = excluded.instruccion,
        limite_default = excluded.limite_default, orden = excluded.orden
      returning id`;
    catId[c.slug] = row.id;
    let orden = 0;
    for (const [slug, nombre, emoji] of c.productos) {
      await sql`
        insert into productos (categoria_id, slug, nombre, emoji, orden)
        values (${row.id}, ${slug}, ${nombre}, ${emoji}, ${orden++})
        on conflict (categoria_id, slug) do update set
          nombre = excluded.nombre, emoji = excluded.emoji, orden = excluded.orden`;
    }
  }

  console.log("→ Sembrando paquetes y límites…");
  for (const p of PAQUETES) {
    const [row] = await sql`
      insert into paquetes (slug, nombre, descripcion, precio_base, precio_por_invitado,
                            recipientes, servicios, destacado, orden)
      values (${p.slug}, ${p.nombre}, ${p.desc}, ${p.base}, ${p.porInv},
              ${p.recip}, ${sql.json(p.servicios)}, ${p.destacado}, ${p.orden})
      on conflict (slug) do update set
        nombre = excluded.nombre, descripcion = excluded.descripcion,
        precio_base = excluded.precio_base, precio_por_invitado = excluded.precio_por_invitado,
        recipientes = excluded.recipientes, servicios = excluded.servicios,
        destacado = excluded.destacado, orden = excluded.orden
      returning id`;
    for (const [catSlug, limite] of Object.entries(p.limites)) {
      await sql`
        insert into paquete_limites (paquete_id, categoria_id, limite)
        values (${row.id}, ${catId[catSlug]}, ${limite})
        on conflict (paquete_id, categoria_id) do update set limite = excluded.limite`;
    }
  }

  console.log("→ Sembrando extras…");
  let orden = 0;
  for (const [slug, nombre, emoji, precio] of EXTRAS) {
    await sql`
      insert into extras (slug, nombre, emoji, precio, orden)
      values (${slug}, ${nombre}, ${emoji}, ${precio}, ${orden++})
      on conflict (slug) do update set
        nombre = excluded.nombre, emoji = excluded.emoji,
        precio = excluded.precio, orden = excluded.orden`;
  }

  console.log("→ Ajustes del negocio…");
  await sql`
    insert into ajustes (id, whatsapp, correo, iva_aplica, iva_tasa, moneda)
    values (1, '5215500000000', 'hola@samai.mx', true, 0.16, 'MXN')
    on conflict (id) do nothing`;

  const [{ count: nProd }] = await sql`select count(*)::int as count from productos`;
  const [{ count: nExtra }] = await sql`select count(*)::int as count from extras`;
  console.log(`\n✅ Listo. ${nProd} productos, ${nExtra} extras, ${PAQUETES.length} paquetes.`);
}

main()
  .catch((e) => {
    console.error("\n❌ Error:", e.message);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
