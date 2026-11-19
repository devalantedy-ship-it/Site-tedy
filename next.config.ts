import type { NextConfig } from "next";

// Enquanto não tem Vercel, o protótipo fica no GitHub Pages em
// devalantedy-ship-it.github.io/Site-tedy. O build da publicação usa PAGES_BASE_PATH=/Site-tedy.
// Quando for pra Vercel (com Supabase), dá pra tirar output/basePath daqui.
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
