import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Comparador de Intercâmbio — compare cursos e agências",
  description:
    "Compare preços de cursos de idioma no exterior entre agências parceiras: destino, duração, tipo de curso e acomodação.",
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
