import type { Metadata, Viewport } from "next";
import "@fontsource-variable/montserrat";
import "@fontsource-variable/public-sans";
import "./globals.css";
import { Revelar } from "@/components/comum/Revelar";

export const metadata: Metadata = {
  title: "InterWorld — compare intercâmbios e embarque pagando menos",
  description:
    "Compare o mesmo curso de idioma, na mesma escola, entre várias agências de intercâmbio: Dublin, Malta, Toronto, Londres, Sydney e mais.",
};

export const viewport: Viewport = {
  themeColor: "#0b2551",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Revelar />
      </body>
    </html>
  );
}
