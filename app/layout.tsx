
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/PageTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: {
    default: "BrosDrop - Intercambio de Archivos Premium",
    template: "%s | BrosDrop",
  },
  description: "Comparte archivos de forma simple, segura y con estilo. BrosDrop ofrece alojamiento temporal de archivos con velocidades premium y una interfaz hermosa.",
  applicationName: "BrosDrop",
  authors: [{ name: "Broslunas", url: "https://broslunas.com" }],
  generator: "Next.js",
  keywords: ["intercambio de archivos", "subida segura", "alojamiento temporal", "nube", "broslunas", "brosdrop", "file sharing", "compartir archivos"],
  creator: "Broslunas",
  publisher: "Broslunas",
  icons: {
    icon: "https://cdn.broslunas.com/favicon.ico",
    shortcut: "https://cdn.broslunas.com/favicon.ico",
    apple: "https://cdn.broslunas.com/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://brosdrop.com",
    title: "BrosDrop - Intercambio de Archivos Premium",
    description: "Comparte archivos de forma simple, segura y con estilo. La mejor forma de enviar archivos por todo el mundo.",
    siteName: "BrosDrop",
    images: [
      {
        url: "https://cdn.broslunas.com/favicon.ico",
        width: 1200,
        height: 630,
        alt: "BrosDrop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrosDrop - Intercambio de Archivos Premium",
    description: "Comparte archivos de forma simple, segura y con estilo.",
    creator: "@broslunas",
    images: ["https://cdn.broslunas.com/favicon.ico"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground flex flex-col`}
      >
        <Providers>
           <PageTransition />
           <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none fixed" />
           <Header />
           <main className="flex-grow flex flex-col relative z-10">
              {children}
           </main>
           <Footer />
        </Providers>
      </body>
    </html>
  );
}

