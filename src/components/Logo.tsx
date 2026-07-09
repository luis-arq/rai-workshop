// Logo de la marca (fondo transparente). La versión clara se usa en modo oscuro
// para que la caligrafía oscura no se pierda sobre fondos oscuros.
export default function Logo({
  height = "h-10",
  className = "",
}: {
  height?: string;
  className?: string;
}) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/samai-logo.png"
        alt="Samai — barra de snacks para eventos"
        className={`${height} w-auto dark:hidden ${className}`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/samai-logo-light.png"
        alt=""
        aria-hidden="true"
        className={`${height} hidden w-auto dark:block ${className}`}
      />
    </>
  );
}
