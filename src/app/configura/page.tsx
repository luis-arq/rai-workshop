import type { Metadata } from "next";
import Wizard from "@/components/wizard/Wizard";
import { getAjustes, getCatalogo } from "@/lib/db-catalog";

export const metadata: Metadata = {
  title: "Diseña tu barra — Samai",
  description: "Arma tu barra de snacks paso a paso y recibe tu cotización.",
};

// El catálogo se lee en cada carga; lo que el admin edite se refleja al instante.
export const dynamic = "force-dynamic";

export default async function ConfiguraPage() {
  const [catalogo, ajustes] = await Promise.all([getCatalogo(), getAjustes()]);
  return <Wizard catalogo={catalogo} ajustes={ajustes} />;
}
