import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Wizard from "@/components/wizard/Wizard";
import {
  getAjustes,
  getCatalogo,
  getTipoBarraPorSlug,
} from "@/lib/db-catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tipo = await getTipoBarraPorSlug(slug);
  return {
    title: tipo ? `${tipo.nombre} — Samai` : "Diseña tu barra — Samai",
  };
}

export default async function ConfiguraBarraPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tipo = await getTipoBarraPorSlug(slug);

  // Barra inexistente o deshabilitada → de vuelta al selector.
  if (!tipo || !tipo.activo) redirect("/configura");

  const [catalogo, ajustes] = await Promise.all([
    getCatalogo(tipo.id),
    getAjustes(),
  ]);

  return <Wizard catalogo={catalogo} ajustes={ajustes} tipoBarra={tipo} />;
}
