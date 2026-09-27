import type { Metadata } from "next";
import { BuildSelect } from "@/components/customizer/BuildSelect";

export const metadata: Metadata = { title: "Choose your build" };

export default function CustomizeEntryPage() {
  return <BuildSelect />;
}
