import type { Metadata } from "next";
import { Manrope, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import { MarketProvider } from "@/lib/store";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/data";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const pixel = Pixelify_Sans({ subsets: ["latin"], variable: "--font-pixelify" });

export const metadata: Metadata = {
  title: { default: `${site.name} · ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  robots: { index: false }, // protótipo
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${pixel.variable}`}>
      <body className="antialiased">
        <MarketProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6">{children}</main>
          <Footer />
        </MarketProvider>
      </body>
    </html>
  );
}
