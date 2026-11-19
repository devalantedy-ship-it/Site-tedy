"use client";

import Link from "next/link";
import { Coins, Gem, Sparkles, Star, Swords, UserRound, Wrench } from "lucide-react";
import { categories, type CategoryId, type Listing, type User } from "@/lib/data";
import { fmtPrice, useMarket } from "@/lib/store";

export const catIcon: Record<CategoryId, typeof Gem> = {
  pokemon: Swords,
  item: Gem,
  char: UserRound,
  kk: Coins,
  servico: Wrench,
};

const catColor: Record<CategoryId, string> = {
  pokemon: "from-[#ff8a3d] to-[#e2436b]",
  item: "from-[#7b6cff] to-[#3fb6ff]",
  char: "from-[#38d6c4] to-[#2b7bd9]",
  kk: "from-[#ffd23f] to-[#f08a1c]",
  servico: "from-[#9b8cb8] to-[#5b6487]",
};

export function catLabel(id: CategoryId) {
  return categories.find((c) => c.id === id)?.label ?? id;
}

export function CatTile({ id, size = 56, shiny }: { id: CategoryId; size?: number; shiny?: boolean }) {
  const Icon = catIcon[id];
  return (
    <div
      className={`relative grid shrink-0 place-items-center rounded-2xl bg-linear-to-br ${catColor[id]} shadow-[inset_0_-3px_0_#0003]`}
      style={{ width: size, height: size }}
    >
      <Icon className="text-white drop-shadow" size={size * 0.45} strokeWidth={2.2} />
      {shiny && (
        <Sparkles className="absolute -right-1.5 -top-1.5 rounded-full bg-bg p-0.5 text-volt" size={size * 0.36} />
      )}
    </div>
  );
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

export function ListingCard({ l }: { l: Listing }) {
  const { userById } = useMarket();
  const u = userById(l.userId);
  return (
    <Link
      href={`/anuncio?id=${l.id}`}
      className={`rise group flex flex-col gap-3 rounded-2xl border border-line bg-panel p-4 transition hover:-translate-y-0.5 hover:border-volt/50 ${
        l.status === "concluido" ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <CatTile id={l.category} shiny={l.shiny} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <KindBadge kind={l.kind} />
            <StatusBadge status={l.status} />
            <span className="text-[11px] text-mute">{l.server}</span>
          </div>
          <h3 className="line-clamp-2 font-bold leading-snug group-hover:text-volt">{l.title}</h3>
        </div>
      </div>
      {(l.level || l.boost != null || l.heldItem) && (
        <div className="flex flex-wrap gap-1.5 text-[11px] text-mute">
          {l.level ? <span className="rounded bg-panel-2 px-1.5 py-0.5">Lv {l.level}</span> : null}
          {l.boost != null ? <span className="rounded bg-panel-2 px-1.5 py-0.5">+{l.boost}</span> : null}
          {l.heldItem ? <span className="rounded bg-panel-2 px-1.5 py-0.5">{l.heldItem}</span> : null}
        </div>
      )}
      <div className="mt-auto flex items-end justify-between gap-2">
        <div>
          <div className="text-[11px] text-mute">{l.kind === "compra" ? "Paga até" : l.category === "kk" ? "por KK" : "Preço"}</div>
          <div className="font-pixel text-xl text-volt">{fmtPrice(l.price, l.currency)}</div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-mute">
          <Avatar user={u} size={22} />
          <span className="max-w-24 truncate">{u?.nick}</span>
        </div>
      </div>
    </Link>
  );
}
