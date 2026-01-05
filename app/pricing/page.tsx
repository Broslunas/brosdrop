
import { Metadata } from "next"
import PricingClient from "@/components/pricing/PricingClient"

export const metadata: Metadata = {
  title: "Planes y Precios | BrosDrop",
  description: "Elige el plan perfecto para tus necesidades. Desde opciones gratuitas hasta planes profesionales con almacenamiento masivo y marca personalizada.",
}

export default function PricingPage() {
  return <PricingClient />
}
