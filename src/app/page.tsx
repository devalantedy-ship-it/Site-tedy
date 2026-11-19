"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Handshake, MessageCircle, Search, ShieldCheck } from "lucide-react";
import { categories, site } from "@/lib/data";
import { useMarket } from "@/lib/store";
import { CatTile, ListingCard } from "@/components/ui";

export default function Home() {
  const { listings } = useMarket();
  const router = useRouter();
  const [q, setQ] = useState("");
  const active = listings.filter((l) => l.status !== "concluido");
  const sells = active.filter((l) => l.kind === "venda").slice(0, 6);
  const buys = active.filter((l) => l.kind === "compra").slice(0, 4);

  return (
    <div className="flex flex-col gap-14">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-panel px-6 py-12 sm:px-12 sm:py-16">
        <div className="dots pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-volt/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-block rounded-full border border-volt/40 bg-volt/10 px-3 py-1 text-xs font-bold text-volt">
            {active.length} anúncios ativos agora
          </span>
          <h1 className="mt-4 font-pixel text-4xl leading-tight sm:text-5xl">
            Troque, venda e encontre <span className="text-volt">o poke que falta</span> no seu time.
          </h1>
          <p className="mt-4 text-mute">{site.description}</p>
          <form
            className="mt-7 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/anuncios?q=${encodeURIComponent(q)}`);
            }}
          >
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="field h-12 pl-10"
                placeholder="Shiny Charizard, stones, 100kk..."
              />
            </div>
            <button className="btn btn-volt h-12 px-5">Buscar</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Link href="/anunciar?tipo=venda" className="btn btn-ghost">Quero vender</Link>
            <Link href="/anunciar?tipo=compra" className="btn btn-ghost">Estou procurando algo</Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-pixel text-2xl">Categorias</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/anuncios?cat=${c.id}`}
              className="flex items-center gap-3 rounded-2xl border border-line bg-panel p-3 transition hover:border-volt/50"
            >
              <CatTile id={c.id} size={44} />
              <div className="min-w-0">
                <div className="font-bold">{c.label}</div>
                <div className="truncate text-xs text-mute">{c.hint}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-pixel text-2xl">À venda agora</h2>
          <Link href="/anuncios?tipo=venda" className="flex items-center gap-1 text-sm text-volt hover:underline">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sells.map((l) => (
            <ListingCard key={l.id} l={l} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-buy/30 bg-buy/5 p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-pixel text-2xl text-buy">Procura-se</h2>
            <p className="text-sm text-mute">Jogadores procurando. Tem o que eles querem? Chame e faça sua proposta.</p>
          </div>
          <Link href="/anuncios?tipo=compra" className="flex items-center gap-1 text-sm text-buy hover:underline">
            Ver pedidos <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {buys.map((l) => (
            <ListingCard key={l.id} l={l} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Handshake, t: "Faça propostas", d: "Mande uma oferta com valor em R$ ou KK. O vendedor aceita, recusa ou responde no chat." },
          { icon: MessageCircle, t: "Chat ou WhatsApp", d: "Negocie aqui dentro. Se o vendedor liberar, dá pra chamar direto no WhatsApp." },
          { icon: ShieldCheck, t: "Reputação", d: "Depois de fechar, um avalia o outro. Veja as estrelas antes de mandar o pagamento." },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="rounded-2xl border border-line bg-panel p-5">
            <Icon className="text-volt" />
            <h3 className="mt-3 font-bold">{t}</h3>
            <p className="mt-1 text-sm text-mute">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
