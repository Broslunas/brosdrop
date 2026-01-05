
import { Metadata } from "next"
import LoginClient from "@/components/auth/LoginClient"

export const metadata: Metadata = {
  title: "Iniciar Sesión | BrosDrop",
  description: "Accede a tu cuenta de BrosDrop para gestionar tus archivos compartidos.",
}

export default function LoginPage() {
  return <LoginClient />
}
