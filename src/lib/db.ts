import postgres from "postgres";

// El pooler de Supabase (plan free) limita a ~15 conexiones en modo sesión.
// Mantenemos un pool chico y con timeout para no agotarlo.
export const sql = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  max: 4,
  idle_timeout: 20,
});
