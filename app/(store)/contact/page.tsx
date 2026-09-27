import type { Metadata } from "next";
import { ContactView } from "@/components/layout/ContactView";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return <ContactView />;
}
