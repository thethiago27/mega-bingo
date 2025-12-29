import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const beVietnamPro = Outfit({
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Mega Bingo",
  description: "Sistema de Bingo Online em Tempo Real",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${beVietnamPro.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
