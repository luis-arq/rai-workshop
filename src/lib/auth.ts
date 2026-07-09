import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// Exige sesión de admin. Úsalo en cada página y server action del panel.
// Si no hay sesión, redirige al login.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return user;
}
