import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { I18nProvider } from "@/lib/i18n/context";
import { AppShell } from "@/components/layout/AppShell";
import { DocumentMeta } from "@/components/layout/DocumentMeta";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "MARTURBS LIVE — Experiencia Premium",
  description:
    "Plataforma exclusiva de videollamadas privadas con las modelos más selectas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${outfit.variable} ${syne.variable} antialiased relative`}
      >
        <I18nProvider>
          <DocumentMeta />
          <AuthProvider>
            <div className="relative z-10 min-h-screen flex flex-col">
              <AppShell>{children}</AppShell>
            </div>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
