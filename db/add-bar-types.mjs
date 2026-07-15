// Migración: agrega "tipos de barra" (snacks, dulce, salada, paletas, mocktails,
// cantaritos). Cada barra tiene su propio catálogo (categorías/productos/paquetes/
// extras). Mueve lo existente a "Snacks" y siembra las 5 nuevas con ejemplos.
//
// Uso:  node --env-file=.env.local db/add-bar-types.mjs
// Idempotente.

import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

const P = (base, inv) => ({ base, inv }); // helper precio

// Definición de las barras nuevas (contenido de EJEMPLO, editable en el panel).
const NUEVAS = [
  {
    slug: "dulce", nombre: "Barra Dulce", emoji: "🍬",
    desc: "Dulces mexicanos, chocolates y gomitas para los golosos.",
    categorias: [
      { slug: "dulce-mexicano", nombre: "Dulces mexicanos", inst: "Los clásicos que a todos gustan.", limite: 3, prods: [
        ["pulparindo", "Pulparindo", "🟥"], ["vero-mango", "Vero Mango", "🥭"], ["rockaleta", "Rockaleta", "🍭"],
        ["pelon", "Pelón Pelo Rico", "🎀"], ["duvalin", "Duvalín", "🥄"], ["mazapan", "Mazapán", "🌸"], ["bubulubu", "Bubulubu", "🍫"]] },
      { slug: "chocolates", nombre: "Chocolates", inst: "Para los amantes del chocolate.", limite: 2, prods: [
        ["carlos-v", "Carlos V", "🍫"], ["kisses", "Kisses", "💋"], ["bombon", "Bombones", "☁️"], ["chocorroles", "Chocorroles", "🌀"], ["mm", "M&M", "🔴"]] },
    ],
    paquetes: [["basico","Básico",P(2500,35),6,["Montaje básico","2 h de servicio"],{ "dulce-mexicano":3,"chocolates":2 }],
               ["premium","Premium",P(3200,50),9,["Montaje decorado","3 h de servicio","1 apoyo"],{ "dulce-mexicano":3,"chocolates":2 }]],
    extras: [["fuente-chocolate","Fuente de chocolate","🍫",1200],["chamoy","Chamoy Premium","🫙",250],["letrero","Letrero con nombre","✨",500]],
  },
  {
    slug: "salada", nombre: "Barra Salada", emoji: "🥨",
    desc: "Botanas, frituras y semillas para picar toda la noche.",
    categorias: [
      { slug: "botanas", nombre: "Botanas", inst: "Lo salado y crujiente.", limite: 3, prods: [
        ["chicharron", "Chicharrón", "🍤"], ["churritos", "Churritos", "🌀"], ["palomitas", "Palomitas", "🍿"], ["nachos", "Nachos", "🧀"], ["pretzels", "Pretzels", "🥨"], ["cacahuate-jap", "Cacahuate japonés", "🥜"]] },
      { slug: "semillas", nombre: "Semillas", inst: "El toque saludable.", limite: 2, prods: [
        ["pepitas", "Pepitas", "🎃"], ["habas", "Habas", "🫘"], ["nuez", "Nuez", "🌰"], ["almendra", "Almendra", "🥜"]] },
    ],
    paquetes: [["basico","Básico",P(2400,35),6,["Montaje básico","2 h de servicio"],{ "botanas":3,"semillas":2 }],
               ["premium","Premium",P(3100,48),9,["Montaje decorado","3 h de servicio","1 apoyo"],{ "botanas":3,"semillas":2 }]],
    extras: [["queso-nachos","Queso para nachos","🧀",350],["salsas","Salsas surtidas","🌶️",200],["limon","Limón y sal","🍋",100]],
  },
  {
    slug: "paletas", nombre: "Barra de Paletas de Hielo", emoji: "🍦",
    desc: "Paletas de agua y crema para refrescar tu evento.",
    categorias: [
      { slug: "paletas-agua", nombre: "Paletas de agua", inst: "Frescas y frutales.", limite: 4, prods: [
        ["p-limon", "Limón", "🍋"], ["p-fresa", "Fresa", "🍓"], ["p-mango", "Mango", "🥭"], ["p-sandia", "Sandía", "🍉"], ["p-tamarindo", "Tamarindo", "🟤"], ["p-pina", "Piña", "🍍"]] },
      { slug: "paletas-crema", nombre: "Paletas de crema", inst: "Cremosas y ricas.", limite: 3, prods: [
        ["pc-fresa", "Fresa con crema", "🍓"], ["pc-nuez", "Nuez", "🌰"], ["pc-choco", "Chocolate", "🍫"], ["pc-vainilla", "Vainilla", "🍦"], ["pc-cajeta", "Cajeta", "🍮"]] },
    ],
    paquetes: [["basico","Básico",P(2800,45),6,["Congelador","2 h de servicio"],{ "paletas-agua":4,"paletas-crema":3 }],
               ["premium","Premium",P(3600,60),9,["Congelador","3 h de servicio","1 apoyo"],{ "paletas-agua":4,"paletas-crema":3 }]],
    extras: [["chamoy","Chamoy Premium","🫙",250],["tajin","Tajín","🧂",100],["cobertura","Cobertura de chocolate","🍫",400]],
  },
  {
    slug: "mocktails", nombre: "Barra de Mocktails", emoji: "🍹",
    desc: "Cócteles sin alcohol, servidos al momento.",
    categorias: [
      { slug: "mocktails", nombre: "Mocktails", inst: "Elige tus favoritos.", limite: 4, prods: [
        ["mojito", "Mojito sin alcohol", "🌿"], ["pina-colada", "Piña colada", "🍍"], ["margarita", "Margarita sin alcohol", "🍋"], ["sangria", "Sangría sin alcohol", "🍷"], ["limonada-coco", "Limonada de coco", "🥥"], ["fresa-limon", "Fresa-limón", "🍓"]] },
    ],
    paquetes: [["basico","Básico",P(3500,60),4,["Bartender","3 h de servicio","Cristalería"],{ "mocktails":4 }],
               ["premium","Premium",P(4500,80),6,["Bartender","4 h de servicio","Cristalería premium","Decoración"],{ "mocktails":4 }]],
    extras: [["vasos","Vasos personalizados","🥤",450],["garnish","Garnish premium","🍒",300],["hielo-seco","Efecto hielo seco","💨",600]],
  },
  {
    slug: "cantaritos", nombre: "Barra de Cantaritos", emoji: "🍊",
    desc: "Cantaritos en barro, escarchados y bien preparados.",
    categorias: [
      { slug: "cantarito-sabor", nombre: "Sabores", inst: "El sabor de tu cantarito.", limite: 3, prods: [
        ["c-clasico", "Clásico", "🍊"], ["c-jamaica", "Jamaica", "🌺"], ["c-tamarindo", "Tamarindo", "🟤"], ["c-mango", "Mango", "🥭"], ["c-pina", "Piña", "🍍"], ["c-fresa", "Fresa", "🍓"]] },
    ],
    paquetes: [["basico","Básico",P(3200,55),4,["Barra montada","3 h de servicio","Barro incluido"],{ "cantarito-sabor":3 }],
               ["premium","Premium",P(4200,75),6,["Barra montada","4 h de servicio","Barro personalizado","Decoración"],{ "cantarito-sabor":3 }]],
    extras: [["escarchado","Escarchado de chamoy","🫙",200],["fruta-extra","Fruta extra","🍉",250],["barro-personalizado","Barro personalizado","🏺",500]],
  },
];

async function main() {
  console.log("→ Tabla tipos_barra…");
  await sql`create table if not exists tipos_barra (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null, nombre text not null, emoji text,
    descripcion text, activo boolean not null default true, orden int not null default 0)`;

  console.log("→ Columnas tipo_barra_id…");
  await sql`alter table categorias add column if not exists tipo_barra_id uuid references tipos_barra(id) on delete cascade`;
  await sql`alter table paquetes  add column if not exists tipo_barra_id uuid references tipos_barra(id) on delete cascade`;
  await sql`alter table extras    add column if not exists tipo_barra_id uuid references tipos_barra(id) on delete cascade`;

  console.log("→ Registrando las 6 barras…");
  const orden = { snacks:1, dulce:2, salada:3, paletas:4, mocktails:5, cantaritos:6 };
  const meta = {
    snacks: ["Barra de Snacks", "🍿", "La clásica: papas, gomitas, cacahuates y fruta con chile."],
    dulce: ["Barra Dulce","🍬",""], salada:["Barra Salada","🥨",""], paletas:["Barra de Paletas de Hielo","🍦",""],
    mocktails:["Barra de Mocktails","🍹",""], cantaritos:["Barra de Cantaritos","🍊",""],
  };
  const idBySlug = {};
  for (const slug of Object.keys(orden)) {
    const [nombre, emoji, desc] = meta[slug];
    const [row] = await sql`
      insert into tipos_barra (slug, nombre, emoji, descripcion, activo, orden)
      values (${slug}, ${nombre}, ${emoji}, ${desc}, true, ${orden[slug]})
      on conflict (slug) do update set nombre=excluded.nombre, emoji=excluded.emoji, orden=excluded.orden
      returning id`;
    idBySlug[slug] = row.id;
  }

  console.log("→ Asignando catálogo existente a Snacks…");
  await sql`update categorias set tipo_barra_id=${idBySlug.snacks} where tipo_barra_id is null`;
  await sql`update paquetes   set tipo_barra_id=${idBySlug.snacks} where tipo_barra_id is null`;
  await sql`update extras     set tipo_barra_id=${idBySlug.snacks} where tipo_barra_id is null`;

  console.log("→ Ajustando llaves únicas (slug por barra)…");
  for (const [t, key] of [["categorias","categorias_slug_key"],["paquetes","paquetes_slug_key"],["extras","extras_slug_key"]]) {
    await sql.unsafe(`alter table ${t} drop constraint if exists ${key}`);
    await sql.unsafe(`alter table ${t} drop constraint if exists ${t}_tipo_slug_key`);
    await sql.unsafe(`alter table ${t} add constraint ${t}_tipo_slug_key unique (tipo_barra_id, slug)`);
  }

  console.log("→ Sembrando las 5 barras nuevas (ejemplos)…");
  for (const b of NUEVAS) {
    const tid = idBySlug[b.slug];
    const catId = {};
    let co = 0;
    for (const c of b.categorias) {
      const [row] = await sql`
        insert into categorias (slug, nombre, instruccion, limite_default, orden, tipo_barra_id)
        values (${c.slug}, ${c.nombre}, ${c.inst}, ${c.limite}, ${co++}, ${tid})
        on conflict (tipo_barra_id, slug) do update set nombre=excluded.nombre, instruccion=excluded.instruccion, limite_default=excluded.limite_default, orden=excluded.orden
        returning id`;
      catId[c.slug] = row.id;
      let po = 0;
      for (const [slug, nombre, emoji] of c.prods) {
        await sql`insert into productos (categoria_id, slug, nombre, emoji, orden)
          values (${row.id}, ${slug}, ${nombre}, ${emoji}, ${po++})
          on conflict (categoria_id, slug) do update set nombre=excluded.nombre, emoji=excluded.emoji`;
      }
    }
    let pqo = 0;
    for (const [slug, nombre, precio, recip, servicios, limites] of b.paquetes) {
      const destacado = slug === "premium";
      const [row] = await sql`
        insert into paquetes (slug, nombre, descripcion, precio_base, precio_por_invitado, recipientes, servicios, destacado, orden, tipo_barra_id)
        values (${slug}, ${nombre}, ${b.desc}, ${precio.base}, ${precio.inv}, ${recip}, ${sql.json(servicios)}, ${destacado}, ${pqo++}, ${tid})
        on conflict (tipo_barra_id, slug) do update set precio_base=excluded.precio_base, precio_por_invitado=excluded.precio_por_invitado, recipientes=excluded.recipientes, servicios=excluded.servicios, destacado=excluded.destacado
        returning id`;
      for (const [catSlug, lim] of Object.entries(limites)) {
        await sql`insert into paquete_limites (paquete_id, categoria_id, limite)
          values (${row.id}, ${catId[catSlug]}, ${lim})
          on conflict (paquete_id, categoria_id) do update set limite=excluded.limite`;
      }
    }
    let eo = 0;
    for (const [slug, nombre, emoji, precio] of b.extras) {
      await sql`insert into extras (slug, nombre, emoji, precio, orden, tipo_barra_id)
        values (${slug}, ${nombre}, ${emoji}, ${precio}, ${eo++}, ${tid})
        on conflict (tipo_barra_id, slug) do update set nombre=excluded.nombre, emoji=excluded.emoji, precio=excluded.precio`;
    }
    console.log(`   ✓ ${b.nombre}`);
  }

  const barras = await sql`select t.nombre, t.activo, count(distinct c.id)::int cats
    from tipos_barra t left join categorias c on c.tipo_barra_id=t.id group by t.id, t.nombre, t.orden order by t.orden`;
  console.log("\n✅ Barras:");
  barras.forEach(b => console.log(`   ${b.activo?"🟢":"⚪"} ${b.nombre} (${b.cats} categorías)`));
}

main().catch(e => { console.error("❌", e.message); process.exitCode = 1; }).finally(() => sql.end());
