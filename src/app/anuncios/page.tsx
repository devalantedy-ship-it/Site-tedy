"use client";

import { Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { categories, servers } from "@/lib/data";
import { useMarket } from "@/lib/store";
import { ListingCard } from "@/components/ui";

export default function Page() {
  return (
    <Suspense>
      <Listings />
    </Suspense>
  );
}

function Listings() {
  const { listings } = useMarket();
  const sp = useSearchParams();
  const router = useRouter();
  const path = usePathname();

  const tipo = sp.get("tipo") ?? "";
  const cat = sp.get("cat") ?? "";
  const srv = sp.get("srv") ?? "";
  const moeda = sp.get("moeda") ?? "";
  const q = sp.get("q") ?? "";
  const ordem = sp.get("ordem") ?? "recentes";
  const shiny = sp.get("shiny") === "1";
  const fechados = sp.get("fechados") === "1";

  const set = (k: string, v: string) => {
    const p = new URLSearchParams(sp.toString());
    if (v) p.set(k, v);
    else p.delete(k);
    router.replace(`${path}?${p.toString()}`, { scroll: false });
  };

  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const r = listings.filter(
      (l) =>
        (!tipo || l.kind === tipo) &&
        (!cat || l.category === cat) &&
        (!srv || l.server === srv) &&
        (!moeda || l.currency === moeda) &&
        (!shiny || l.shiny) &&
        (fechados || l.status !== "concluido") &&
        words.every((w) => (l.title + " " + l.description + " " + (l.heldItem ?? "")).toLowerCase().includes(w)),
    );
    if (ordem === "menor") r.sort((a, b) => a.price - b.price);
    else if (ordem === "maior") r.sort((a, b) => b.price - a.price);
    else if (ordem === "vistos") r.sort((a, b) => b.views - a.views);
    else r.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return r;
  }, [listings, tipo, cat, srv, moeda, q, ordem, shiny, fechados]);

  const [showF, setShowF] = useState(false);
  const title = tipo === "compra" ? "Pedidos de compra" : tipo === "venda" ? "À venda" : "Todos os anúncios";

  const chip = (k: string, v: string, label: string, cur: string) => (
    <button
      key={k + v}
      onClick={() => set(k, cur === v ? "" : v)}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        cur === v ? "border-volt bg-volt/15 text-volt" : "border-line text-mute hover:text-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <h1 className="font-pixel text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-mute">{list.length} resultado{list.length === 1 ? "" : "s"}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className={`${showF ? "flex" : "hidden"} lg:flex flex-col gap-5 self-start rounded-2xl border border-line bg-panel p-4 lg:sticky lg:top-20`}>
          <div className="flex items-center gap-2 font-bold">
            <SlidersHorizontal size={16} /> Filtros
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
            <input
              defaultValue={q}
              onKeyDown={(e) => e.key === "Enter" && set("q", (e.target as HTMLInputElement).value)}
              onBlur={(e) => set("q", e.target.value)}
              className="field pl-9"
              placeholder="Buscar..."
            />
          </div>
          <Group label="Tipo">
            {chip("tipo", "venda", "Vendo", tipo)}
            {chip("tipo", "compra", "Compro", tipo)}
          </Group>
          <Group label="Categoria">{categories.map((c) => chip("cat", c.id, c.label, cat))}</Group>
          <Group label="Servidor">{servers.map((s) => chip("srv", s, s, srv))}</Group>
          <Group label="Moeda">
            {chip("moeda", "R$", "Reais", moeda)}
            {chip("moeda", "KK", "KK", moeda)}
          </Group>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={shiny} onChange={(e) => set("shiny", e.target.checked ? "1" : "")} className="accent-[#ffd23f]" />
            Só shiny
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={fechados} onChange={(e) => set("fechados", e.target.checked ? "1" : "")} className="accent-[#ffd23f]" />
            Mostrar concluídos
          </label>
          <button onClick={() => router.replace(path)} className="text-left text-xs text-mute underline">
            Limpar filtros
          </button>
        </aside>

        <div>
          <div className="mb-3 flex justify-between gap-2 lg:justify-end">
            <button onClick={() => setShowF((v) => !v)} className="btn btn-ghost lg:hidden">
              <SlidersHorizontal size={16} /> {showF ? "Esconder filtros" : "Filtros"}
            </button>
            <select value={ordem} onChange={(e) => set("ordem", e.target.value)} className="field w-auto py-2 text-sm">
              <option value="recentes">Mais recentes</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
              <option value="vistos">Mais vistos</option>
            </select>
          </div>
          {list.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((l) => (
                <ListingCard key={l.id} l={l} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-10 text-center text-mute">
              Nada encontrado com esses filtros.
              <br />
              Que tal criar um pedido de compra? Quem tiver chama você.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-mute">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
