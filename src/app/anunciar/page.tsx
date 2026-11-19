"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { categories, servers, type CategoryId, type Currency, type Kind, type Server } from "@/lib/data";
import { fmtPrice, useMarket } from "@/lib/store";
import { CatTile, KindBadge } from "@/components/ui";

export default function Page() {
  return (
    <Suspense>
      <NewListing />
    </Suspense>
  );
}

function NewListing() {
  const m = useMarket();
  const router = useRouter();
  const sp = useSearchParams();

  const [kind, setKind] = useState<Kind>(sp.get("tipo") === "compra" ? "compra" : "venda");
  const [category, setCategory] = useState<CategoryId>("pokemon");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [server, setServer] = useState<Server>(m.me?.server ?? "Kanto");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("R$");
  const [negotiable, setNegotiable] = useState(true);
  const [showWhatsapp, setShowWhatsapp] = useState(!!m.me?.whatsapp);
  const [wa, setWa] = useState("");
  const [level, setLevel] = useState("");
  const [boost, setBoost] = useState("");
  const [shiny, setShiny] = useState(false);
  const [heldItem, setHeldItem] = useState("");

  useEffect(() => {
    if (m.ready && !m.me) router.replace("/entrar?volta=/anunciar");
  }, [m.ready, m.me, router]);

  if (!m.me) return null;

  const n = Number(price.replace(",", "."));
  const ok = title.trim().length >= 4 && n > 0;
  const isPoke = category === "pokemon";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ok) return;
    if (showWhatsapp && !m.me!.whatsapp && wa.replace(/\D/g, "")) m.updateMe({ whatsapp: wa.replace(/\D/g, "") });
    const id = m.createListing({
      kind,
      category,
      title: title.trim(),
      description: description.trim(),
      server,
      price: n,
      currency,
      negotiable,
      showWhatsapp: showWhatsapp && !!(m.me!.whatsapp || wa.replace(/\D/g, "")),
      ...(isPoke || category === "char" ? { level: Number(level) || undefined } : {}),
      ...(isPoke ? { boost: boost === "" ? undefined : Number(boost), shiny, heldItem: heldItem.trim() || undefined } : {}),
    });
    if (id) router.push(`/anuncio?id=${id}`);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-pixel text-3xl">Novo anúncio</h1>
      <p className="mt-1 text-sm text-mute">Venda o que você tem ou avise o que está procurando.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <form onSubmit={submit} className="flex flex-col gap-6 rounded-3xl glass p-6">
          <div className="grid grid-cols-2 gap-2">
            {(["venda", "compra"] as Kind[]).map((k) => (
              <button
                type="button"
                key={k}
                onClick={() => setKind(k)}
                className={`rounded-2xl border p-4 text-left transition ${
                  kind === k ? (k === "venda" ? "border-sell bg-sell/10" : "border-buy bg-buy/10") : "border-line hover:bg-panel-2"
                }`}
              >
                <div className="font-bold">{k === "venda" ? "Quero vender" : "Quero comprar"}</div>
                <div className="text-xs text-mute">{k === "venda" ? "Anuncie um poke, item, char..." : "Avise o que procura e receba ofertas"}</div>
              </button>
            ))}
          </div>

          <div>
            <div className="mb-2 text-sm font-semibold">Categoria</div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-xs font-semibold transition ${
                    category === c.id ? "border-volt bg-volt/10" : "border-line hover:bg-panel-2"
                  }`}
                >
                  <CatTile id={c.id} size={36} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <label className="text-sm">
            <span className="mb-1 block font-semibold">Título</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={70}
              className="field"
              placeholder={kind === "venda" ? "Ex.: Shiny Charizard +50" : "Ex.: Procuro Gyarados shiny +30"}
            />
          </label>

          {isPoke && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="text-sm">
                <span className="mb-1 block font-semibold">Level</span>
                <input value={level} onChange={(e) => setLevel(e.target.value.replace(/\D/g, ""))} className="field" inputMode="numeric" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-semibold">Boost</span>
                <input value={boost} onChange={(e) => setBoost(e.target.value.replace(/\D/g, ""))} className="field" inputMode="numeric" placeholder="+0" />
              </label>
              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block font-semibold">Held item</span>
                <input value={heldItem} onChange={(e) => setHeldItem(e.target.value)} className="field" placeholder="Ex.: X-Attack T5" />
              </label>
              <label className="col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={shiny} onChange={(e) => setShiny(e.target.checked)} className="accent-[#ffd23f]" /> É shiny
              </label>
            </div>
          )}
          {category === "char" && (
            <label className="text-sm">
              <span className="mb-1 block font-semibold">Level do personagem</span>
              <input value={level} onChange={(e) => setLevel(e.target.value.replace(/\D/g, ""))} className="field" inputMode="numeric" />
            </label>
          )}

          <label className="text-sm">
            <span className="mb-1 block font-semibold">Descrição</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="field resize-y"
              placeholder="Detalhes, forma de entrega, horário que você está online..."
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block font-semibold">Servidor</span>
              <select value={server} onChange={(e) => setServer(e.target.value as Server)} className="field">
                {servers.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-semibold">
                {kind === "compra" ? "Quanto paga (até)" : "Preço"}
                {category === "kk" && currency === "R$" ? " por 1 KK" : ""}
              </span>
              <div className="flex gap-2">
                <input value={price} onChange={(e) => setPrice(e.target.value)} className="field" inputMode="decimal" placeholder="0" />
                <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="field w-24">
                  <option>R$</option>
                  <option>KK</option>
                </select>
              </div>
            </label>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-panel-2 p-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} className="accent-[#ffd23f]" />
              Aceito propostas
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showWhatsapp} onChange={(e) => setShowWhatsapp(e.target.checked)} className="accent-[#ffd23f]" />
              Mostrar botão “Chamar no WhatsApp”
            </label>
            {showWhatsapp && !m.me.whatsapp && (
              <input value={wa} onChange={(e) => setWa(e.target.value)} className="field" placeholder="Seu WhatsApp com DDD" inputMode="tel" />
            )}
          </div>

          <button disabled={!ok} className="btn btn-volt self-end px-8 disabled:opacity-40">
            Publicar anúncio
          </button>
        </form>

        <aside className="self-start lg:sticky lg:top-20">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-mute">Prévia</div>
          <div className="flex flex-col gap-3 rounded-2xl glass p-4">
            <div className="flex items-start gap-3">
              <CatTile id={category} shiny={isPoke && shiny} />
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-1.5">
                  <KindBadge kind={kind} />
                  <span className="text-[11px] text-mute">{server}</span>
                </div>
                <div className="line-clamp-2 font-bold">{title || "Título do anúncio"}</div>
              </div>
            </div>
            <div className="font-pixel text-xl text-volt">{n > 0 ? fmtPrice(n, currency) : "—"}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
