// Logo de la marca. La imagen vive en /public/samai-logo.jpg.
// Usa <img> simple (no next/image) para evitar configuración extra.
export default function Logo({
  height = "h-10",
  className = "",
}: {
  height?: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/samai-logo.jpg"
      alt="Samai — barra de snacks para eventos"
      className={`${height} w-auto rounded-xl ${className}`}
    />
  );
}
