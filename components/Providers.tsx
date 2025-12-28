"use client"

import { SessionProvider } from "next-auth/react"
import ModalProvider from "@/components/ModalProvider"
import { ThemeProvider } from "@/components/ThemeProvider"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ModalProvider>
          {children}
        </ModalProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}

