import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/contexts/Web3Context";

export const metadata: Metadata = {
  title: "Supply Chain Tracker",
  description: "Sistema de trazabilidad blockchain para cadenas de suministro",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}

