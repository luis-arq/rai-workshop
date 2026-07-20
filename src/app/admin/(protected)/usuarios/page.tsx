import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { crearUsuario, eliminarUsuario } from "@/lib/admin-actions";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  email: string;
  created_at: string;
}

function fecha(d: string) {
  return new Date(d).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function UsuariosPage() {
  const yo = await requireAdmin();
  const rows = (await sql`
    select id, email, created_at from auth.users order by created_at`) as unknown as Row[];

  const inputCls =
    "rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-chamoy";

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Usuarios
      </h1>
      <p className="mt-1 text-muted">
        Personas que pueden entrar al panel. Crea accesos nuevos o cambia
        contraseñas.
      </p>

      <div className="mt-8 space-y-2">
        {rows.map((u) => (
          <div
            key={u.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-4"
          >
            <div className="flex-1">
              <div className="font-medium">
                {u.email}
                {u.id === yo.id && (
                  <span className="ml-2 rounded-full bg-chamoy/10 px-2 py-0.5 text-xs font-semibold text-chamoy">
                    tú
                  </span>
                )}
              </div>
              <div className="text-xs text-faint">Desde {fecha(u.created_at)}</div>
            </div>
            {u.id !== yo.id ? (
              <DeleteButton
                action={eliminarUsuario}
                id={u.id}
                message={`¿Eliminar el acceso de ${u.email}?`}
                label="Eliminar"
              />
            ) : (
              <span className="text-xs text-faint">No puedes eliminarte</span>
            )}
          </div>
        ))}
      </div>

      {/* Crear / actualizar usuario */}
      <div className="mt-8 rounded-3xl border border-line bg-surface p-6">
        <h2 className="font-display text-xl font-semibold">
          Agregar acceso o cambiar contraseña
        </h2>
        <p className="mt-1 text-sm text-muted">
          Si el correo ya existe, se actualiza su contraseña. Mínimo 6
          caracteres.
        </p>
        <form action={crearUsuario} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-muted">Correo</span>
            <input
              name="correo"
              type="email"
              required
              placeholder="esposa@correo.com"
              className={`w-64 ${inputCls}`}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-muted">
              Contraseña
            </span>
            <input
              name="password"
              type="text"
              required
              minLength={6}
              placeholder="mínimo 6 caracteres"
              className={`w-56 ${inputCls}`}
            />
          </label>
          <button className="rounded-full bg-chamoy px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]">
            Guardar
          </button>
        </form>
        <p className="mt-3 text-xs text-faint">
          🔒 Comparte la contraseña de forma segura. Cada quien puede tener su
          propio correo y contraseña.
        </p>
      </div>
    </div>
  );
}
