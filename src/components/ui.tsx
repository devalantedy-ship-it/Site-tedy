"use client";

import Link from "next/link";
import { Sparkles, Star } from "lucide-react";
import { artwork, categoryArt, itemSprite } from "@/lib/poke";
import { categories, type CategoryId, type Listing, type User } from "@/lib/data";
import { fmtPrice, useMarket } from "@/lib/store";

export function catLabel(id: CategoryId) {
  return categories.find((c) => c.id === id)?.label ?? id;
}

/** Imagem do anúncio: arte oficial do pokémon, sprite do item, ou a imagem da categoria. */
export function listingArt(l: Pick<Listing, "category" | "dex" | "item" | "shiny">) {
  if (l.dex) return { src: artwork(l.dex, !!l.shiny), pixel: false };
  if (l.item) return { src: itemSprite(l.item), pixel: true };
  return { src: categoryArt[l.category], pixel: l.category !== "pokemon" };
}

/** Medalhão redondo com a imagem (estilo carimbo/hanko, com ondas no fundo). */
export function CatTile({
  id,
  size = 56,
  shiny,
  bob,
  l,
}: {
  id: CategoryId;
  size?: number;
  shiny?: boolean;
  bob?: boolean;
  l?: Pick<Listing, "category" | "dex" | "item" | "shiny">;
}) {
  const art = listingArt(l ?? { category: id, shiny });
  return (
    <div
      className="seigaiha relative grid shrink-0 place-items-center rounded-full bg-linear-to-b from-[#1d4d78] to-[#0d2c4c] shadow-[inset_0_0_0_2px_rgb(251_233_214/0.25),0_8px_20px_-8px_#000]"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={art.src}
        alt=""
        loading="lazy"
        className={`${art.pixel ? "[image-rendering:pixelated]" : ""} ${bob ? "float" : ""} drop-shadow-[0_6px_6px_rgb(0_0_0/0.45)]`}
        style={{ width: size * (art.pixel ? 0.78 : 1.12), height: size * (art.pixel ? 0.78 : 1.12), objectFit: "contain", maxWidth: "none" }}
      />
      {(shiny ?? l?.shiny) && (
        <Sparkles className="absolute -right-0.5 -top-0.5 text-volt drop-shadow-[0_0_6px_#ffbe76]" size={Math.max(12, size * 0.26)} />
      )}
    </div>
  );
}

/** Liga o efeito holográfico: brilho segue o mouse e o card inclina um pouco. */
export function holoHandlers() {
  return {
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", `${x * 100}%`);
      el.style.setProperty("--my", `${y * 100}%`);
      el.style.setProperty("--rx", `${(0.5 - y) * 6}deg`);
      el.style.setProperty("--ry", `${(x - 0.5) * 8}deg`);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.setProperty("--rx", "0deg");
      e.currentTarget.style.setProperty("--ry", "0deg");
    },
  };
}

export function KindBadge({ kind }: { kind: Listing["kind"] }) {
  return kind === "venda" ? (
    <span className="rounded-md bg-sell/15 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-sell">Vendo</span>
  ) : (
    <span className="rounded-md bg-buy/15 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-buy">Compro</span>
  );
}

export function StatusBadge({ status }: { status: Listing["status"] }) {
  if (status === "ativo") return null;
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
        status === "concluido" ? "bg-ok/15 text-ok" : "bg-volt/15 text-volt"
      }`}
    >
      {status === "concluido" ? "Concluído" : "Em negociação"}
    </span>
  );
}

export function Avatar({ user, size = 36 }: { user?: User; size?: number }) {
  const nick = user?.nick ?? "?";
  const hue = [...nick].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-pixel font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.42, background: `hsl(${hue} 55% 42%)` }}
    >
      {nick.slice(0, 1).toUpperCase()}
    </div>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? "fill-volt text-volt" : "text-line"} />
      ))}
    </span>
  );
}

export function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "agora";
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `há ${d} dia${d > 1 ? "s" : ""}`;
  const mo = Math.floor(d / 30);
  return `há ${mo} ${mo > 1 ? "meses" : "mês"}`;
}

export function ListingCard({ l, i = 0 }: { l: Listing; i?: number }) {
  const { userById } = useMarket();
  const u = userById(l.userId);
  const accent = l.kind === "venda" ? "from-sell/70" : "from-buy/70";
  return (
    <Link
      href={`/anuncio?id=${l.id}`}
      {...holoHandlers()}
      style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
      className={`rise holo glass group flex flex-col gap-3 overflow-hidden rounded-2xl p-4 ${l.status === "concluido" ? "opacity-55 saturate-50" : ""}`}
    >
      {l.shiny && l.status !== "concluido" && <span className="shiny-border" />}
      <span className={`absolute inset-x-0 top-0 h-px bg-linear-to-r ${accent} via-transparent to-transparent`} />
      <div className="flex items-start gap-3">
        <CatTile id={l.category} l={l} size={64} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <KindBadge kind={l.kind} />
            <StatusBadge status={l.status} />
            <span className="text-[11px] text-mute">{l.server}</span>
          </div>
          <h3 className="line-clamp-2 font-bold leading-snug transition group-hover:text-volt">{l.title}</h3>
        </div>
      </div>
      {(l.level || l.boost != null || l.heldItem) && (
        <div className="flex flex-wrap gap-1.5 font-pixel text-[12px] text-mute">
          {l.level ? <span className="rounded bg-white/5 px-1.5 py-0.5">LV {l.level}</span> : null}
          {l.boost != null ? <span className="rounded bg-volt/10 px-1.5 py-0.5 text-volt">+{l.boost}</span> : null}
          {l.heldItem ? <span className="rounded bg-violet/10 px-1.5 py-0.5 text-violet">{l.heldItem}</span> : null}
        </div>
      )}
      <div className="mt-auto flex items-end justify-between gap-2 border-t border-white/5 pt-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-mute">
            {l.kind === "compra" ? "Paga até" : l.category === "kk" && l.currency === "R$" ? "por 1 KK" : "Preço"}
          </div>
          <div className="glow-text font-pixel text-2xl leading-none text-volt">{fmtPrice(l.price, l.currency)}</div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-mute">
          <Avatar user={u} size={22} />
          <span className="max-w-24 truncate">{u?.nick}</span>
        </div>
      </div>
    </Link>
  );
}
