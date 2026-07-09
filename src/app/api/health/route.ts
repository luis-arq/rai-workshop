import { NextResponse } from "next/server";

// Diagnóstico temporal: verifica variables de entorno y conexión a la DB.
// No expone secretos, solo si existen y el resultado de una consulta simple.
export const dynamic = "force-dynamic";

export async function GET() {
  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ),
  };

  let db: string | null = null;
  let error: string | null = null;

  if (env.DATABASE_URL) {
    try {
      const { sql } = await import("@/lib/db");
      const r = await sql`select count(*)::int n from productos`;
      db = `ok:${r[0].n} productos`;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  } else {
    error = "DATABASE_URL no está definida";
  }

  return NextResponse.json({ env, db, error });
}
