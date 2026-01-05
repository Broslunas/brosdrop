
import { Metadata } from "next"
import HomeClient from "@/components/home/HomeClient"

export const metadata: Metadata = {
  title: "BrosDrop - Comparte Archivos Sin Límites",
  description: "La forma más rápida, segura y elegante de enviar tus archivos grandes. Encriptado de extremo a extremo, R2 storage y sin registros.",
  openGraph: {
    title: "BrosDrop - Comparte Archivos Sin Límites",
    description: "La forma más rápida, segura y elegante de enviar tus archivos grandes.",
  },
}

export default function Home() {
  return <HomeClient />
}
