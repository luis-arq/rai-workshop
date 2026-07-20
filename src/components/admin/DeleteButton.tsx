"use client";

// Botón de eliminar con confirmación. Recibe un server action como prop.
export default function DeleteButton({
  action,
  id,
  message,
  label = "Eliminar",
}: {
  action: (formData: FormData) => void;
  id: string;
  message: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="rounded-full border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10">
        {label}
      </button>
    </form>
  );
}
