import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BarTypePicker from "@/components/BarTypePicker";
import { getTiposBarraActivos } from "@/lib/db-catalog";

export const metadata: Metadata = {
  title: "Elige tu barra — Samai",
  description: "Elige el tipo de barra para tu evento y diseña tu cotización.",
};

export const dynamic = "force-dynamic";

export default async function ConfiguraPage() {
  const tipos = await getTiposBarraActivos();

  // Si solo hay una barra activa, saltamos directo a su configurador.
  if (tipos.length === 1) redirect(`/configura/${tipos[0].slug}`);

  return <BarTypePicker tipos={tipos} />;
}
