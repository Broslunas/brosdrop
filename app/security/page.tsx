
import { Metadata } from "next"
import SecurityClient from "@/components/security/SecurityClient"

export const metadata: Metadata = {
  title: "Seguridad y Privacidad | BrosDrop",
  description: "Entiende cómo BrosDrop protege tus archivos con encriptación de extremo a extremo y almacenamiento seguro.",
}

export default function SecurityPage() {
  return <SecurityClient />
}
