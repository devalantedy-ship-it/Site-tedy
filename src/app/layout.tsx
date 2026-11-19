import type { Metadata } from "next";
import { Dela_Gothic_One, Manrope } from "next/font/google";
import "./globals.css";
import { MarketProvider } from "@/lib/store";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Background } from "@/components/Background";
import { site } from "@/lib/data";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const display = Dela_Gothic_One({ weight: "400", subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: { default: `${site.name} · ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  robots: { index: false }, // protótipo
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${display.variable}`}>
      <body className="antialiased">
        <MarketProvider>
          <Background />
          <Header />
          <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6">{children}</main>
          <Footer />
        </MarketProvider>
      </body>
    </html>
  );
}
