import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrapGo | Control de trampas verificable",
  description: "MVP para verificar revisiones de trampas con QR/NFC, foto, hora y ubicación.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-950">{children}</body>
    </html>
  );
}
