"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Plus, Search } from "lucide-react";
import { categories, servers, type Listing, type Server } from "@/lib/data";
import { fmtPrice, useMarket } from "@/lib/store";
import { artwork } from "@/lib/poke";
import { CatTile, KindBadge, ListingCard, holoHandlers } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

/* eslint-disable @next/next/no-img-element */

export default function Home() {
  const { listings } = useMarket();
  const active = listings.filter((l) => l.status !== "concluido");
  const sells = active.filter((l) => l.kind === "venda");
  const buys = active.filter((l) => l.kind === "compra");

  return (
    <div className="flex flex-col gap-28 sm:gap-36">
      <Hero count={active.length} />

      <div className="-mt-20 sm:-mt-28">
        <Ticker />
      </div>

      {/* 1. vender: texto à esquerda, cartões inclinados à direita */}
      <section className="grid grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-2">
        <Reveal from="left">
          <Kicker>pra quem vende</Kicker>
          <h2 className="font-pixel text-4xl leading-tight sm:text-5xl">
            Aquele shiny parado
            <br />
            na bag <span className="text-sell">vira KK.</span>
          </h2>
          <p className="mt-4 max-w-md text-lg text-mute">
            Anuncie com level, boost e held. Escolha o Pokémon, o addon ou o item e o ícone aparece sozinho. Receba propostas em R$ ou KK.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/anunciar?tipo=venda" className="btn btn-volt rounded-full px-6 py-3">
              <Plus size={18} /> Anunciar grátis
            </Link>
            <Link href="/anuncios?tipo=venda" className="btn btn-ghost rounded-full px-6 py-3">
              Ver à venda <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
        <Reveal from="right" delay={120}>
          <div className="tilt-stack mx-auto max-w-md [--back:linear-gradient(135deg,#f37665,#ba2a46)] [--back-r:-7deg] [--front-r:3deg]">
            <div className="glass seigaiha flex flex-col gap-3 rounded-[1.75rem] p-4">
              {sells.slice(0, 3).map((l) => (
                <MiniRow key={l.id} l={l} />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* 2. procura-se: invertido */}
      <section className="grid grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-2">
        <Reveal from="left" className="order-2 lg:order-1">
          <div className="tilt-stack mx-auto max-w-md [--back:linear-gradient(135deg,#6fd3d8,#1d6f8f)] [--back-r:6deg] [--front-r:-3deg]">
            <div className="glass seigaiha flex flex-col gap-3 rounded-[1.75rem] p-4">
              {buys.slice(0, 3).map((l) => (
                <MiniRow key={l.id} l={l} />
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal from="right" delay={120} className="order-1 lg:order-2">
          <Kicker color="text-buy">pra quem compra</Kicker>
          <h2 className="font-pixel text-4xl leading-tight sm:text-5xl">
            Não achou?
            <br />
            <span className="text-buy">Pede que alguém tem.</span>
          </h2>
          <p className="mt-4 max-w-md text-lg text-mute">
            Crie um pedido de compra dizendo o que você quer e quanto paga. Quem tiver chama você no chat.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/anunciar?tipo=compra" className="btn rounded-full bg-buy px-6 py-3 text-[#06323a] shadow-[0_4px_0_#1d6f8f]">
              Criar pedido
            </Link>
            <Link href="/anuncios?tipo=compra" className="btn btn-ghost rounded-full px-6 py-3">
              Ver pedidos <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* 3. faixa grande arredondada com Pokémon nas laterais */}
      <ChatBand />

      {/* 4. escolha sua região */}
      <RegionPicker />

      {/* 5. categorias */}
      <section>
        <Reveal className="mb-8 text-center">
          <Kicker>explorar</Kicker>
          <h2 className="font-pixel text-4xl sm:text-5xl">O que você procura?</h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c, i) => (
            <Reveal key={c.id} from="zoom" delay={i * 70}>
              <Link
                href={`/anuncios?cat=${c.id}`}
                {...holoHandlers()}
                className="holo glass group flex h-full flex-col items-center gap-3 rounded-3xl p-5 text-center"
              >
                <CatTile id={c.id} size={84} bob />
                <div>
                  <div className="font-pixel text-lg group-hover:text-sell">{c.label}</div>
                  <div className="text-xs text-mute">{c.hint}</div>
                </div>
                <div className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-mute">{active.filter((l) => l.category === c.id).length} anúncios</div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 6. vitrine */}
      <section>
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Kicker>acabou de chegar</Kicker>
            <h2 className="font-pixel text-4xl sm:text-5xl">À venda agora</h2>
          </div>
          <Link href="/anuncios?tipo=venda" className="btn btn-ghost rounded-full">
            Ver todos <ArrowRight size={16} />
          </Link>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sells.slice(0, 6).map((l, i) => (
            <Reveal key={l.id} delay={(i % 3) * 90}>
              <ListingCard l={l} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* 7. passo a passo com imagem fixa */}
      <Steps />

      {/* 8. FAQ */}
      <Faq />

      {/* 9. chamada final */}
      <Reveal from="zoom">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-[#f37665] via-[#d9485a] to-[#8e2632] px-6 py-16 text-center shadow-[0_40px_80px_-30px_#ba2a46] sm:py-20">
          <div className="seigaiha pointer-events-none absolute inset-0 opacity-60" />
          <img src={artwork(131)} alt="" className="float pointer-events-none absolute -bottom-10 -left-10 hidden w-72 opacity-95 drop-shadow-[0_20px_30px_#0006] md:block" />
          <img src={artwork(25)} alt="" className="float-2 pointer-events-none absolute -right-4 top-8 hidden w-44 drop-shadow-[0_20px_30px_#0006] md:block" />
          <div className="relative mx-auto max-w-xl">
            <h2 className="font-pixel text-4xl text-white sm:text-5xl">Anuncie agora e comece a negociar</h2>
            <p className="mt-3 text-white/85">É grátis. Leva 1 minuto.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/anunciar" className="btn rounded-full bg-[#fbeedd] px-7 py-3 text-[#8e2632] shadow-[0_4px_0_#5c1420]">
                <Plus size={18} /> Criar anúncio
              </Link>
              <Link href="/anuncios" className="btn rounded-full border border-white/40 px-7 py-3 text-white hover:bg-white/10">
                Ver anúncios
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

function Kicker({ children, color = "text-sell" }: { children: React.ReactNode; color?: string }) {
  return <div className={`mb-3 text-sm font-extrabold uppercase tracking-[0.2em] ${color}`}>{children}</div>;
}

function Hero({ count }: { count: number }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <section className="relative -mt-24 flex min-h-[100svh] flex-col items-center justify-center px-2 pb-24 pt-28 text-center">
      <div className="rise">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#0b2440]/55 px-3.5 py-1.5 text-xs font-bold text-ink backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
          </span>
          {count} anúncios rolando agora
        </span>
      </div>
      <div className="rise" style={{ animationDelay: "80ms" }}>
        <h1 className="mt-6 font-pixel text-5xl leading-[1.02] [text-shadow:0_4px_0_#0b2440,0_0_40px_rgb(11_36_64/0.95)] sm:text-7xl lg:text-8xl">
          O mercado dos
          <br />
          <span className="text-shine drop-shadow-[0_4px_0_#0b2440] [text-shadow:none]">treinadores</span>
        </h1>
      </div>
      <div className="rise" style={{ animationDelay: "160ms" }}>
        <p className="mx-auto mt-6 max-w-xl rounded-2xl bg-[#0b2440]/45 px-4 py-2 text-lg text-ink backdrop-blur-sm sm:text-xl">
          Compre, venda e troque Pokémon, addons, itens, chars e KK do otPokémon. Negocie no chat ou chame no WhatsApp.
        </p>
      </div>
      <div className="rise w-full" style={{ animationDelay: "240ms" }}>
        <form
          className="mx-auto mt-8 flex w-full max-w-xl gap-2 rounded-full border border-white/20 bg-[#0b2440]/75 p-1.5 shadow-[0_20px_60px_-20px_#000] backdrop-blur-xl"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/anuncios?q=${encodeURIComponent(q)}`);
          }}
        >
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-12 w-full rounded-full bg-transparent pl-11 pr-3 outline-none placeholder:text-mute"
              placeholder="Shiny Gyarados, addon, stones, 100kk..."
            />
          </div>
          <button className="btn btn-volt rounded-full px-6">Buscar</button>
        </form>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/anuncios" className="btn rounded-full bg-[#fbeedd] px-6 py-3 text-[#0b2440] shadow-[0_4px_0_#a8957c]">
            Ver anúncios <ArrowRight size={16} />
          </Link>
          <Link href="/anunciar" className="btn rounded-full border border-white/30 bg-[#0b2440]/50 px-6 py-3 backdrop-blur hover:bg-[#0b2440]/75">
            <Plus size={16} /> Anunciar grátis
          </Link>
        </div>
      </div>
      <a href="#mais" className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-ink drop-shadow" aria-label="Rolar">
        <ChevronDown size={30} />
      </a>
      <span id="mais" className="absolute bottom-0" />
    </section>
  );
}

function MiniRow({ l }: { l: Listing }) {
  return (
    <Link href={`/anuncio?id=${l.id}`} className="flex items-center gap-3 rounded-2xl bg-[#0b2440]/60 p-3 transition hover:bg-[#0b2440]/90">
      <CatTile id={l.category} l={l} size={60} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <KindBadge kind={l.kind} />
          <span className="truncate text-[11px] text-mute">{l.server}</span>
        </div>
        <div className="truncate font-bold">{l.title}</div>
      </div>
      <div className="shrink-0 font-pixel text-base text-volt sm:text-lg">{fmtPrice(l.price, l.currency)}</div>
    </Link>
  );
}

function ChatBand() {
  const lines: ({ me: boolean; t: string } | { offer: string })[] = [
    { me: false, t: "Opa! Ainda tem o Gyarados shiny?" },
    { me: true, t: "Tenho sim, +50 com held de defesa 🔥" },
    { offer: "R$ 150,00" },
    { me: true, t: "Fechado! Te chamo no jogo agora." },
  ];
  return (
    <section className="relative">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-b from-[#fbd3b8] via-[#f7a98f] to-[#f37665] px-6 pb-14 pt-14 text-[#3a1420] sm:px-10">
        <div className="seigaiha pointer-events-none absolute inset-0 [--c:rgb(142_38_50/0.08)]" />
        <Reveal className="relative mx-auto max-w-xl text-center">
          <div className="mb-3 text-sm font-extrabold uppercase tracking-[0.2em] text-[#8e2632]">negociação</div>
          <h2 className="font-pixel text-4xl leading-tight sm:text-5xl">Proposta, contraproposta, fechou.</h2>
          <p className="mt-3 text-[#3a1420]/75">Chat dentro do site com botão de proposta. Se o vendedor liberar, chama direto no WhatsApp.</p>
        </Reveal>
        <div className="relative mx-auto mt-10 flex max-w-md flex-col gap-2.5 rounded-3xl bg-[#0b2440] p-5 shadow-[0_30px_60px_-20px_#3a1420]">
          {lines.map((m, i) => (
            <Reveal
              key={i}
              delay={i * 350}
              from={"offer" in m ? "zoom" : m.me ? "right" : "left"}
              className={"offer" in m ? "self-start" : m.me ? "self-end" : "self-start"}
            >
              {"offer" in m ? (
                <div className="rounded-2xl border border-volt/40 bg-volt/10 px-4 py-3 text-ink">
                  <div className="text-xs text-mute">Proposta</div>
                  <div className="font-pixel text-2xl text-volt">{m.offer}</div>
                  <div className="text-xs font-bold text-ok">Aceita ✓</div>
                </div>
              ) : (
                <div className={`max-w-[16rem] rounded-2xl px-4 py-2 text-sm ${m.me ? "rounded-br-md bg-sell text-white" : "rounded-bl-md bg-white/10 text-ink"}`}>{m.t}</div>
              )}
            </Reveal>
          ))}
        </div>
      </div>
      {/* Pokémon saindo pelas laterais da faixa */}
      <img src={artwork(130, true)} alt="" className="float pointer-events-none absolute -left-16 top-1/2 hidden w-80 -translate-y-1/2 drop-shadow-[0_30px_30px_#0007] xl:block" />
      <img src={artwork(54)} alt="" className="float-2 pointer-events-none absolute -right-10 bottom-6 hidden w-52 drop-shadow-[0_30px_30px_#0007] xl:block" />
    </section>
  );
}

const regionArt: Record<Server, { dex: number; text: string; color: string }> = {
  "América do Sul": { dex: 25, text: "A região mais movimentada. Muita troca de shiny, stones e KK todo dia.", color: "from-[#ffd36e] to-[#f39a4d]" },
  Europa: { dex: 131, text: "Servidor europeu. Bom pra quem joga de madrugada no Brasil e quer preço diferente.", color: "from-[#a8e1ff] to-[#4f8fd8]" },
};

function RegionPicker() {
  const { listings, users } = useMarket();
  const [region, setRegion] = useState<Server>("América do Sul");
  const info = regionArt[region];
  const list = listings.filter((l) => l.server === region && l.status !== "concluido");
  return (
    <section className={`relative overflow-hidden rounded-[2.5rem] bg-linear-to-br ${info.color} text-[#0b2440]`}>
      <div className="seigaiha pointer-events-none absolute inset-0 [--c:rgb(11_36_64/0.07)]" />
      <div className="relative grid grid-cols-[minmax(0,1fr)] items-center gap-6 p-7 sm:p-12 lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <h2 className="font-pixel text-4xl sm:text-5xl">Escolha sua região!</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {servers.map((s) => (
              <button
                key={s}
                onClick={() => setRegion(s)}
                className={`rounded-full px-5 py-2.5 text-sm font-extrabold transition ${
                  region === s ? "bg-[#0b2440] text-ink shadow-[0_4px_0_#000a]" : "bg-white/50 hover:bg-white/80"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <h3 className="mt-7 font-pixel text-2xl">{region}</h3>
          <p className="mt-2 max-w-md text-[#0b2440]/80">{info.text}</p>
          <div className="mt-5 flex gap-3">
            <div className="rounded-2xl bg-white/45 px-4 py-2.5">
              <div className="font-pixel text-2xl">{list.length}</div>
              <div className="text-xs font-bold uppercase">anúncios</div>
            </div>
            <div className="rounded-2xl bg-white/45 px-4 py-2.5">
              <div className="font-pixel text-2xl">{users.filter((u) => u.server === region).length * 187}</div>
              <div className="text-xs font-bold uppercase">treinadores</div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            {list.slice(0, 3).map((l) => (
              <Link key={l.id} href={`/anuncio?id=${l.id}`} className="flex items-center gap-3 rounded-2xl bg-white/45 p-2 pr-4 transition hover:bg-white/75">
                <CatTile id={l.category} l={l} size={44} />
                <span className="min-w-0 flex-1 truncate font-bold">{l.title}</span>
                <span className="shrink-0 font-pixel">{fmtPrice(l.price, l.currency)}</span>
              </Link>
            ))}
          </div>
          <Link href={`/anuncios?srv=${encodeURIComponent(region)}`} className="btn mt-6 rounded-full bg-[#0b2440] px-6 py-3 text-ink shadow-[0_4px_0_#000a]">
            Ver anúncios da região <ArrowRight size={16} />
          </Link>
        </Reveal>
        <div className="relative grid place-items-center">
          <div className="absolute h-72 w-72 rounded-full bg-white/40 blur-3xl" />
          <img key={region} src={artwork(info.dex)} alt="" className="pop float relative w-64 drop-shadow-[0_30px_30px_#0b244055] sm:w-96" />
        </div>
      </div>
    </section>
  );
}

const stepsData = [
  { t: "Anuncie", d: "Escolha a categoria, o Pokémon, addon ou item com ícone, level, boost e held. Preço em R$ ou KK.", dex: 129, shiny: false },
  { t: "Negocie", d: "Converse no chat e mande propostas. O outro lado aceita, recusa ou faz contraproposta.", dex: 130, shiny: false },
  { t: "Feche", d: "Combinou? Entregue no jogo. O dono do anúncio marca como concluído.", dex: 130, shiny: true },
  { t: "Avalie", d: "Um avalia o outro. As estrelas ficam no perfil pra todo mundo ver.", dex: 151, shiny: false },
];

function Steps() {
  const [on, setOn] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setOn(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);
  const s = stepsData[on];
  return (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-2">
      <div className="lg:sticky lg:top-28 lg:h-[70vh]">
        <div className="glass seigaiha relative grid h-72 place-items-center overflow-hidden rounded-[2.5rem] sm:h-96 lg:h-full">
          <div className="absolute h-64 w-64 rounded-full bg-sell/30 blur-3xl" />
          <img key={on} src={artwork(s.dex, s.shiny)} alt="" className="pop float relative w-60 drop-shadow-[0_30px_30px_#0008] sm:w-80" />
          <span className="absolute bottom-5 left-6 font-pixel text-7xl text-white/10">0{on + 1}</span>
        </div>
      </div>
      <div>
        <Kicker>como funciona</Kicker>
        <ul className="flex flex-col">
          {stepsData.map((st, i) => (
            <li
              key={st.t}
              data-i={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-on={on === i}
              className="step flex min-h-[38vh] flex-col justify-center border-l-2 border-white/10 pl-6 data-[on=true]:border-sell lg:min-h-[45vh]"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">👉</span>
                <h3 className="font-pixel text-5xl sm:text-6xl">{st.t}</h3>
              </div>
              <p className="mt-3 max-w-md text-lg text-mute">{st.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const faqs = [
  ["É de graça?", "Sim. Criar conta, anunciar e negociar não custa nada."],
  ["O site é oficial do otPokémon?", "Não. É um site feito por jogadores, sem ligação com a equipe do jogo nem com a Nintendo."],
  ["Como sei se o vendedor é confiável?", "Veja as estrelas e o número de negócios fechados no perfil. Em negócio grande, divida a entrega e o pagamento em partes."],
  ["Posso negociar pelo WhatsApp?", "Pode, se o vendedor marcar a opção no anúncio. Mas o chat do site fica guardado se der algum problema."],
  ["Dá pra vender personagem?", "Dá. Use a categoria Personagens e combine a troca de e-mail pelo chat."],
];

function Faq() {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <Reveal className="mb-8 text-center">
        <h2 className="font-pixel text-4xl sm:text-5xl">FAQ</h2>
      </Reveal>
      <div className="flex flex-col gap-3">
        {faqs.map(([q, a], i) => (
          <Reveal key={q} delay={i * 60}>
            <details className="glass group rounded-2xl px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center gap-3 font-bold">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sell/20 text-sell transition group-open:rotate-45">+</span>
                {q}
              </summary>
              <p className="mt-3 pl-10 text-mute">{a}</p>
            </details>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-10 text-center">
        <img src={artwork(54)} alt="" className="mx-auto w-24" />
        <div className="mt-2 font-pixel text-2xl">Ainda tem dúvidas?</div>
        <Link href="/como-funciona" className="btn btn-ghost mt-4 rounded-full px-6">
          Ver como funciona <ArrowRight size={16} />
        </Link>
      </Reveal>
    </section>
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
    <div className="relative -mx-4 overflow-hidden border-y border-white/10 bg-[#0b2440]/75 py-3.5 backdrop-blur [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div className="marquee gap-10 pr-10">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex shrink-0 items-center gap-2 text-sm font-semibold text-ink/85">
            <img src={artwork(129)} alt="" className="h-5 w-5" /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}
