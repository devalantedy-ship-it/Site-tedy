"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Handshake, MessageCircle, Search, ShieldCheck, Zap } from "lucide-react";
import { categories, servers, type Listing } from "@/lib/data";
import { fmtPrice, useMarket } from "@/lib/store";
import { CatTile, KindBadge, ListingCard, holoHandlers } from "@/components/ui";
import { artwork } from "@/lib/poke";

export default function Home() {
  const { listings, users } = useMarket();
  const router = useRouter();
  const [q, setQ] = useState("");
  const active = listings.filter((l) => l.status !== "concluido");
  const sells = active.filter((l) => l.kind === "venda").slice(0, 6);
  const buys = active.filter((l) => l.kind === "compra").slice(0, 4);
  const showcase = [...active.filter((l) => l.kind === "venda")].sort((a, b) => Number(!!b.shiny) - Number(!!a.shiny) || b.views - a.views).slice(0, 3);
  const deals = users.reduce((a, u) => a + u.deals, 0);

  return (
    <div className="flex flex-col gap-16">
      {/* HERO */}
      <section className="relative grid items-center gap-10 pt-4 lg:grid-cols-[1.1fr_1fr] lg:pt-10">
        <div className="relative">
          <span className="rise inline-flex items-center gap-2 rounded-full border border-ok/30 bg-ok/10 px-3 py-1 text-xs font-bold text-ok">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
            </span>
            AO VIVO · {active.length} anúncios rolando
          </span>
          <h1 className="rise mt-5 font-pixel text-5xl leading-[1.02] [text-shadow:0_3px_0_#0b2440,0_0_30px_rgb(11_36_64/0.9)] sm:text-6xl lg:text-7xl" style={{ animationDelay: "60ms" }}>
            O mercado dos
            <br />
            <span className="text-shine drop-shadow-[0_3px_0_#0b2440] [text-shadow:none]">treinadores</span>
            <br />
            <span className="text-ink">de Poketibia.</span>
          </h1>
          <p className="rise mt-5 max-w-lg text-lg text-ink/90 [text-shadow:0_1px_8px_#0b2440]" style={{ animationDelay: "120ms" }}>
            Shiny, held, stones, chars e KK. Anuncie, faça proposta, feche no chat ou no WhatsApp.
          </p>

          <form
            className="rise glass mt-7 flex max-w-xl gap-2 rounded-2xl p-2 shadow-[0_0_60px_-20px_#f37665]"
            style={{ animationDelay: "180ms" }}
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
                className="field h-12 border-transparent bg-transparent pl-10 focus:shadow-none"
                placeholder="Shiny Charizard, stones, 100kk..."
              />
            </div>
            <button className="btn btn-volt h-12 px-6">Buscar</button>
          </form>

          <div className="rise mt-4 flex flex-wrap gap-2" style={{ animationDelay: "240ms" }}>
            {["shiny", "+50", "stones", "kk", "lendário"].map((t) => (
              <Link key={t} href={`/anuncios?q=${t}`} className="rounded-full border border-line bg-white/5 px-3 py-1 text-xs text-mute hover:border-volt/50 hover:text-volt">
                #{t}
              </Link>
            ))}
          </div>
        </div>

        {/* vitrine flutuante */}
        <div className="relative hidden h-[460px] lg:block">
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-volt/25 blur-[90px]" />
          {showcase.map((l, i) => (
            <ShowcaseCard key={l.id} l={l} i={i} />
          ))}
        </div>
      </section>

      <Ticker />

      {/* números */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat n={active.length} label="anúncios ativos" color="text-volt" />
        <Stat n={users.length * 241} label="treinadores" color="text-buy" />
        <Stat n={deals} label="negócios fechados" color="text-sell" />
        <Stat n={servers.length} label="servidores" color="text-violet" />
      </section>

      {/* categorias */}
      <section>
        <SectionTitle kicker="explorar" title="Categorias" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              href={`/anuncios?cat=${c.id}`}
              {...holoHandlers()}
              style={{ animationDelay: `${i * 60}ms` }}
              className="rise holo glass group flex flex-col items-center gap-3 rounded-2xl p-5 text-center"
            >
              <CatTile id={c.id} size={72} bob />
              <div>
                <div className="font-pixel text-lg group-hover:text-volt">{c.label}</div>
                <div className="text-xs text-mute">{c.hint}</div>
              </div>
              <div className="font-pixel text-xs text-mute">{active.filter((l) => l.category === c.id).length} anúncios</div>
            </Link>
          ))}
        </div>
      </section>

      {/* vendas */}
      <section>
        <SectionTitle kicker="acabou de chegar" title="À venda agora" href="/anuncios?tipo=venda" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sells.map((l, i) => (
            <ListingCard key={l.id} l={l} i={i} />
          ))}
        </div>
      </section>

      {/* procura-se */}
      <section className="relative overflow-hidden rounded-3xl border border-buy/30 bg-buy/[0.06] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-buy/20 blur-3xl" />
        <div className="relative mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-pixel text-sm uppercase tracking-widest text-buy">wanted</div>
            <h2 className="font-pixel text-4xl">Procura-se</h2>
            <p className="text-sm text-mute">Tem o que eles querem? Chame e mande sua proposta.</p>
          </div>
          <Link href="/anuncios?tipo=compra" className="btn btn-ghost text-buy">
            Ver todos os pedidos <ArrowRight size={16} />
          </Link>
        </div>
        <div className="relative grid gap-3 sm:grid-cols-2">
          {buys.map((l, i) => (
            <ListingCard key={l.id} l={l} i={i} />
          ))}
        </div>
      </section>

      {/* como funciona */}
      <section>
        <SectionTitle kicker="simples assim" title="Como funciona" />
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { icon: Zap, t: "Anuncie em 1 minuto", d: "Escolha a categoria, coloque level, boost e held, e o preço em R$ ou KK." },
            { icon: Handshake, t: "Proposta e contraproposta", d: "Negocie no chat. Aceitou? Combina a entrega ali mesmo ou chama no WhatsApp." },
            { icon: ShieldCheck, t: "Reputação de verdade", d: "Cada negócio fechado vira estrela no perfil. Veja antes de mandar o Pix." },
          ].map(({ icon: Icon, t, d }, i) => (
            <div key={t} className="glass relative overflow-hidden rounded-2xl p-6">
              <span className="absolute right-4 top-2 font-pixel text-6xl text-white/5">0{i + 1}</span>
              <span className="pixel-corners grid h-12 w-12 place-items-center bg-volt/15 text-volt">
                <Icon />
              </span>
              <h3 className="mt-4 font-pixel text-xl">{t}</h3>
              <p className="mt-1 text-sm text-mute">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* chamada final */}
      <section className="relative overflow-hidden rounded-3xl border border-volt/30 bg-linear-to-br from-volt/15 via-sell/10 to-violet/15 p-8 text-center sm:p-12">
        <div className="dots pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative mx-auto flex max-w-xl flex-col items-center">
          <div className="flex gap-3">
            {[129, 130, 129].map((dex, i) => (
              <span key={i} className={i === 1 ? "float-2" : i === 2 ? "float-3" : "float"}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={artwork(dex, i === 2)} alt="" className={i === 1 ? "h-28 w-28" : "h-16 w-16 self-end"} />
              </span>
            ))}
          </div>
          <h2 className="mt-5 font-pixel text-4xl">Tem poke parado na bag?</h2>
          <p className="mt-2 text-mute">Transforma em KK. Anunciar é grátis.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/anunciar?tipo=venda" className="btn btn-volt px-6">
              Anunciar agora
            </Link>
            <Link href="/anunciar?tipo=compra" className="btn btn-ghost">
              <MessageCircle size={16} /> Pedir algo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ kicker, title, href }: { kicker: string; title: string; href?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <div className="font-pixel text-sm uppercase tracking-widest text-volt/80">▸ {kicker}</div>
        <h2 className="font-pixel text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-sm font-bold text-volt hover:underline">
          Ver todos <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

const poses = [
  "left-[4%] top-[6%] w-[62%] [--r:-6deg] float",
  "right-[0%] top-[30%] w-[60%] [--r:5deg] float-2",
  "left-[14%] bottom-[2%] w-[56%] [--r:-2deg] float-3",
];

function ShowcaseCard({ l, i }: { l: Listing; i: number }) {
  return (
    <Link
      href={`/anuncio?id=${l.id}`}
      className={`absolute ${poses[i]} glass block rounded-2xl p-4 shadow-[0_30px_60px_-20px_#000] transition hover:z-10 hover:scale-105`}
    >
      {l.shiny && <span className="shiny-border" />}
      <div className="flex items-center gap-3">
        <CatTile id={l.category} size={80} l={l} bob />
        <div className="min-w-0">
          <KindBadge kind={l.kind} />
          <div className="mt-1 line-clamp-2 font-bold leading-tight">{l.title}</div>
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <span className="glow-text font-pixel text-2xl text-volt">{fmtPrice(l.price, l.currency)}</span>
        <span className="font-pixel text-xs text-mute">{l.server}</span>
      </div>
    </Link>
  );
}

function Ticker() {
  const { listings, userById } = useMarket();
  const fake = [
    "MistyAqua comprou Shiny Lapras +30 por R$ 140",
    "GaryLendario vendeu 300 KK",
    "BrockRocha fechou Kit de Stones por 800 KK",
    "AshDoKanto vendeu Shiny Scizor +40 por R$ 95",
    "TreinadorX comprou Gengar +70",
  ];
  const real = listings
    .filter((l) => l.status === "concluido")
    .map((l) => `${userById(l.userId)?.nick} ${l.kind === "venda" ? "vendeu" : "comprou"} ${l.title} por ${fmtPrice(l.price, l.currency)}`);
  const items = [...real, ...fake];
  return (
    <div className="relative -mx-4 overflow-hidden border-y border-white/5 bg-black/30 py-3 backdrop-blur [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div className="marquee gap-10 pr-10">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex shrink-0 items-center gap-2 font-pixel text-sm text-mute">
            <span className="text-ok">●</span> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stat({ n, label, color }: { n: number; label: string; color: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 1200);
        setV(Math.round(n * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      // garante o número final mesmo se a animação não rodar (aba escondida etc.)
      setTimeout(() => setV(n), 1500);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [n]);
  return (
    <div ref={ref} className="glass rounded-2xl p-5">
      <div className={`glow-text font-pixel text-4xl ${color}`}>{v.toLocaleString("pt-BR")}</div>
      <div className="text-xs font-bold uppercase tracking-wider text-mute">{label}</div>
    </div>
  );
}
