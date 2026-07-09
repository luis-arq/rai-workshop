// Crea (o actualiza) un usuario admin en Supabase Auth.
//
// Uso:
//   node --env-file=.env.local db/create-admin.mjs [correo] [password]
// Por defecto: admin@samai.mx / Samai2026!
//
// Nota: crea el usuario directamente en auth.users con contraseña bcrypt
// (pgcrypto). Cámbiala luego desde el panel o el dashboard de Supabase.

import postgres from "postgres";

const correo = process.argv[2] || "admin@samai.mx";
const password = process.argv[3] || "Samai2026!";

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

// Resuelve el esquema donde vive pgcrypto (Supabase suele ponerlo en "extensions").
async function cryptSchema() {
  const [r] = await sql`
    select n.nspname as schema
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'crypt' limit 1`;
  return r?.schema || "public";
}

async function main() {
  const schema = await cryptSchema();
  const crypt = (pw) =>
    sql`${sql(schema)}.crypt(${pw}::text, ${sql(schema)}.gen_salt('bf'::text))`;

  const [existente] = await sql`select id from auth.users where email = ${correo}`;

  let id;
  if (existente) {
    id = existente.id;
    await sql`
      update auth.users
      set encrypted_password = ${crypt(password)}, updated_at = now(),
          email_confirmed_at = coalesce(email_confirmed_at, now())
      where id = ${id}`;
    console.log(`✅ Contraseña actualizada para ${correo}`);
  } else {
    [{ id }] = await sql`
      insert into auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data
      ) values (
        gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
        'authenticated', 'authenticated', ${correo}, ${crypt(password)},
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}', '{}'
      ) returning id`;
    console.log(`✅ Admin creado: ${correo}`);
  }

  // GoTrue espera cadenas vacías (no NULL) en las columnas de token.
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

  // La columna auth.identities.email es generada; no se inserta.
  const [ident] = await sql`select 1 from auth.identities where user_id = ${id} and provider = 'email'`;
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
    console.log("   + identidad email creada");
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
