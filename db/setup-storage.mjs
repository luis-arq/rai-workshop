// Configura el almacenamiento de imágenes de productos en Supabase Storage:
// crea el bucket público "productos" y las políticas para que el admin
// (usuario autenticado) pueda subir y todos puedan ver.
//
// Uso: node --env-file=.env.local db/setup-storage.mjs

import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

async function main() {
  console.log("→ Bucket 'productos' (público)…");
  await sql`
    insert into storage.buckets (id, name, public)
    values ('productos', 'productos', true)
    on conflict (id) do update set public = true`;

  console.log("→ Políticas de acceso…");
  const policies = [
    ["samai_productos_read", `create policy samai_productos_read on storage.objects
        for select to public using (bucket_id = 'productos')`],
    ["samai_productos_insert", `create policy samai_productos_insert on storage.objects
        for insert to authenticated with check (bucket_id = 'productos')`],
    ["samai_productos_update", `create policy samai_productos_update on storage.objects
        for update to authenticated using (bucket_id = 'productos')`],
    ["samai_productos_delete", `create policy samai_productos_delete on storage.objects
        for delete to authenticated using (bucket_id = 'productos')`],
  ];
  for (const [name, ddl] of policies) {
    await sql.unsafe(`drop policy if exists ${name} on storage.objects`);
    await sql.unsafe(ddl);
    console.log(`   ✓ ${name}`);
  }

  console.log("\n✅ Storage listo.");
}

main().catch((e) => { console.error("❌", e.message); process.exitCode = 1; }).finally(() => sql.end());
