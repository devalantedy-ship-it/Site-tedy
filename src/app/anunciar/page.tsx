"use client";

// Criar anúncio em 4 etapas: 1) o que (vender/comprar + categoria) 2) detalhes 3) preço e região 4) contato e revisão.
// À direita, a prévia é o card de verdade, atualizando enquanto preenche.

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, FileText, Globe2, Handshake, Phone, Rocket, Sparkles, Type } from "lucide-react";
import { categories, servers, type CategoryId, type Currency, type Kind, type Listing, type Server } from "@/lib/data";
import { fmtPrice, useMarket } from "@/lib/store";
import { artwork } from "@/lib/poke";
import { CatTile, ListingCard } from "@/components/ui";
import { AddonPicker, ItemPicker, PokemonPicker, dexName, hasShiny } from "@/components/PokemonPicker";
import { Field, Segmented, Stepper, Toggle, maskPhone } from "@/components/Form";

/* eslint-disable @next/next/no-img-element */

export default function Page() {
  return (
    <Suspense>
      <NewListing />
    </Suspense>
  );
}

const STEPS = ["O que", "Detalhes", "Preço", "Publicar"];

function NewListing() {
  const m = useMarket();
  const router = useRouter();
  const sp = useSearchParams();

  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<Kind>(sp.get("tipo") === "compra" ? "compra" : "venda");
  const [category, setCategory] = useState<CategoryId>("pokemon");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [server, setServer] = useState<Server>(m.me?.server ?? "América do Sul");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("R$");
  const [negotiable, setNegotiable] = useState(true);
  const [showWhatsapp, setShowWhatsapp] = useState(!!m.me?.whatsapp);
  const [wa, setWa] = useState("");
  const [level, setLevel] = useState("");
  const [boost, setBoost] = useState("");
  const [shiny, setShiny] = useState(false);
  const [heldItem, setHeldItem] = useState("");
  const [dex, setDex] = useState<number | undefined>();
  const [item, setItem] = useState("");
  const [itemName, setItemName] = useState("");
  const [addon, setAddon] = useState<string | undefined>();
  const [autoTitle, setAutoTitle] = useState(false);

  useEffect(() => {
    if (m.ready && !m.me) router.replace("/entrar?volta=/anunciar");
  }, [m.ready, m.me, router]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // a conta carrega do navegador depois do 1º render: aí liga o WhatsApp e a região da conta
  const meId = m.me?.id;
  useEffect(() => {
    if (!m.me) return;
    setShowWhatsapp(!!m.me.whatsapp);
    setServer(m.me.server);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meId]);

  if (!m.me) return null;

  const isPoke = category === "pokemon";
  const n = Number(price.replace(/\./g, "").replace(",", "."));
  const waDigits = (m.me.whatsapp ?? wa).replace(/\D/g, "");
  const canNext = [true, title.trim().length >= 4, n > 0, true][step];

  const autoSetTitle = (t: string) => {
    if (!title || autoTitle) {
      setTitle(t);
      setAutoTitle(true);
    }
  };

  const draft: Listing = {
    id: "previa",
    kind,
    category,
    title: title.trim() || "Título do anúncio",
    description,
    server,
    price: n > 0 ? n : 0,
    currency,
    negotiable,
    showWhatsapp,
    userId: m.me.id,
    createdAt: new Date().toISOString(),
    status: "ativo",
    views: 0,
    ...(isPoke || category === "char" ? { level: Number(level) || undefined } : {}),
    ...(isPoke ? { dex, boost: boost === "" ? undefined : Number(boost), shiny, heldItem: heldItem.trim() || undefined } : {}),
    ...(category === "item" && item ? { item } : {}),
    ...(category === "addon" && addon ? { addon, dex } : {}),
  };

  const publish = () => {
    if (!(title.trim().length >= 4 && n > 0)) return;
    if (showWhatsapp && !m.me!.whatsapp && wa.replace(/\D/g, "")) m.updateMe({ whatsapp: wa.replace(/\D/g, "") });
    const { id: _i, userId: _u, createdAt: _c, status: _s, views: _v, ...data } = draft;
    const id = m.createListing({ ...data, title: title.trim(), description: description.trim(), showWhatsapp: showWhatsapp && !!waDigits });
    if (id) router.push(`/anuncio?id=${id}`);
  };

  const quick = currency === "KK" ? [100, 300, 500, 1000] : [20, 50, 100, 200];

  return (
    <div className="mx-auto max-w-6xl">
      {/* topo com progresso */}
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-sell">novo anúncio</div>
          <h1 className="mt-1 font-pixel text-4xl sm:text-5xl">{kind === "venda" ? "Bora vender!" : "O que você procura?"}</h1>
        </div>
        <ol className="flex items-center gap-1.5 sm:gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                disabled={i > step}
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-xs font-bold transition ${
                  i === step ? "bg-sell text-white shadow-[0_3px_0_#8e2632]" : i < step ? "bg-white/10 text-ink hover:bg-white/15" : "bg-white/5 text-mute"
                }`}
              >
                <span className={`grid h-6 w-6 place-items-center rounded-full ${i === step ? "bg-white/25" : i < step ? "bg-ok/25 text-ok" : "bg-white/10"}`}>
                  {i < step ? <Check size={13} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && <span className={`h-0.5 w-3 rounded sm:w-6 ${i < step ? "bg-ok/60" : "bg-white/10"}`} />}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-[2rem] border border-white/10 bg-[#0a223c]/90 p-5 shadow-[0_30px_60px_-30px_#000] backdrop-blur-xl sm:p-8">
          <div key={step} className="pop flex flex-col gap-7">
            {step === 0 && (
              <>
                <section>
                  <h2 className="mb-3 font-pixel text-2xl">Você quer...</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        { k: "venda", t: "Vender", d: "Anuncie um poke, item, addon, char...", dex: 52, c: "from-[#f37665] to-[#ba2a46]" },
                        { k: "compra", t: "Comprar", d: "Avise o que procura e receba ofertas", dex: 25, c: "from-[#6fd3d8] to-[#1d6f8f]" },
                      ] as const
                    ).map((o) => (
                      <button
                        type="button"
                        key={o.k}
                        onClick={() => setKind(o.k)}
                        className={`relative overflow-hidden rounded-3xl p-5 text-left transition ${
                          kind === o.k ? `bg-linear-to-br ${o.c} text-white shadow-[0_20px_40px_-15px_#000] ring-2 ring-white/40` : "border border-line bg-[#06182c]/60 hover:bg-white/5"
                        }`}
                      >
                        <div className="seigaiha pointer-events-none absolute inset-0 opacity-50" />
                        <img src={artwork(o.dex)} alt="" className={`absolute right-1 top-1 w-14 transition sm:-bottom-3 sm:-right-3 sm:top-auto sm:w-32 ${kind === o.k ? "float" : "opacity-40 grayscale"}`} />
                        <div className="relative flex min-h-24 flex-col justify-end sm:block sm:min-h-20 sm:max-w-[65%]">
                          <div className="font-pixel text-xl sm:text-3xl">{o.t}</div>
                          <div className={`mt-1 hidden text-xs sm:block sm:text-sm ${kind === o.k ? "text-white/85" : "text-mute"}`}>{o.d}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="mb-3 font-pixel text-2xl">Categoria</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {categories.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setCategory(c.id)}
                        className={`flex min-w-0 items-center gap-2.5 rounded-2xl border p-2.5 text-left transition sm:gap-3 sm:p-3 ${
                          category === c.id ? "border-sell bg-sell/15 shadow-[0_0_0_3px_rgb(243_118_101/0.15)]" : "border-line bg-[#06182c]/50 hover:bg-white/5"
                        }`}
                      >
                        <CatTile id={c.id} size={42} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold sm:text-base">{c.label}</span>
                          <span className="block truncate text-[11px] text-mute">{c.hint}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {step === 1 && (
              <>
                {isPoke && (
                  <PokemonPicker
                    dex={dex}
                    shiny={shiny}
                    onPick={(d, name) => {
                      setDex(d);
                      if (d) autoSetTitle((shiny ? "Shiny " : "") + name);
                    }}
                  />
                )}
                {category === "item" && (
                  <ItemPicker
                    item={item || undefined}
                    name={itemName}
                    onPick={(s, name) => {
                      setItem(s ?? "");
                      setItemName(name);
                      if (name) autoSetTitle(name);
                    }}
                  />
                )}
                {category === "addon" && (
                  <AddonPicker
                    addon={addon}
                    dex={dex}
                    onPick={(ad, d) => {
                      setAddon(ad);
                      setDex(d);
                      if (ad) autoSetTitle(`${ad}${d ? ` (${dexName(d) ?? ""})` : ""}`);
                    }}
                  />
                )}

                {isPoke && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Level">
                      <Stepper value={level} onChange={setLevel} step={10} max={1000} placeholder="—" />
                    </Field>
                    <Field label="Boost">
                      <Stepper value={boost} onChange={setBoost} step={5} max={100} prefix="+" placeholder="+0" />
                    </Field>
                    <Field label="Held item" className="sm:col-span-2" right={<span className="text-xs text-mute">opcional</span>}>
                      <input value={heldItem} onChange={(e) => setHeldItem(e.target.value)} className="field" placeholder="Ex.: X-Attack T5" />
                    </Field>
                    <div className="sm:col-span-2">
                      <Toggle
                        checked={shiny}
                        onChange={(v) => {
                          setShiny(v);
                          if (dex && autoTitle) setTitle((v ? "Shiny " : "") + (dexName(dex) ?? ""));
                        }}
                        icon={<Sparkles size={18} />}
                        label="É shiny"
                        hint={dex ? (hasShiny(dex) ? "Esse Pokémon tem versão shiny no otPokémon." : "Esse Pokémon não tem shiny no otPokémon.") : "Escolha o Pokémon pra conferir."}
                      />
                    </div>
                  </div>
                )}
                {category === "char" && (
                  <Field label="Level do personagem">
                    <Stepper value={level} onChange={setLevel} step={10} max={1000} placeholder="—" />
                  </Field>
                )}

                <Field label="Título" icon={<Type size={18} />} right={<span className="text-xs text-mute">{title.length}/70</span>}>
                  <input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setAutoTitle(false);
                    }}
                    maxLength={70}
                    className="field h-12"
                    placeholder={kind === "venda" ? "Ex.: Shiny Charizard +50" : "Ex.: Procuro Gyarados shiny +30"}
                  />
                </Field>

                <Field label="Descrição" right={<span className="text-xs text-mute">{description.length}/500</span>}>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                    rows={4}
                    className="field resize-none"
                    placeholder="Detalhes, forma de entrega, horário que você está online..."
                  />
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <section>
                  <h2 className="mb-1 font-pixel text-2xl">{kind === "compra" ? "Quanto você paga?" : "Quanto custa?"}</h2>
                  <p className="mb-4 text-sm text-mute">{category === "kk" && currency === "R$" ? "Preço por 1 KK." : "Em reais ou em KK do jogo."}</p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 rounded-3xl border border-line bg-[#06182c]/70 px-5 py-4 focus-within:border-volt">
                        <span className="font-pixel text-2xl text-mute">{currency === "R$" ? "R$" : "KK"}</span>
                        <input
                          value={price}
                          onChange={(e) => setPrice(e.target.value.replace(/[^\d,]/g, ""))}
                          inputMode="decimal"
                          placeholder="0"
                          autoFocus
                          className="w-full bg-transparent font-pixel text-4xl text-volt outline-none placeholder:text-mute/40"
                        />
                      </div>
                    </div>
                    <div className="sm:w-48">
                      <Segmented size="lg" value={currency} onChange={setCurrency} options={[{ value: "R$", label: "Reais" }, { value: "KK", label: "KK" }]} />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quick.map((q) => (
                      <button
                        type="button"
                        key={q}
                        onClick={() => setPrice(String(q))}
                        className="rounded-full border border-line bg-white/5 px-3.5 py-1.5 text-sm font-semibold text-mute transition hover:border-volt/50 hover:text-volt"
                      >
                        {fmtPrice(q, currency)}
                      </button>
                    ))}
                  </div>
                </section>

                <Toggle checked={negotiable} onChange={setNegotiable} icon={<Handshake size={18} />} label="Aceito propostas" hint="Mostra o botão “Fazer proposta” no anúncio." />

                <section>
                  <h2 className="mb-3 flex items-center gap-2 font-pixel text-2xl">
                    <Globe2 size={22} className="text-mute" /> Região
                  </h2>
                  <Segmented size="lg" value={server} onChange={setServer} options={servers.map((s) => ({ value: s, label: s }))} />
                </section>
              </>
            )}

            {step === 3 && (
              <>
                <section>
                  <h2 className="mb-3 font-pixel text-2xl">Contato</h2>
                  <Toggle
                    checked={showWhatsapp}
                    onChange={setShowWhatsapp}
                    icon={<Phone size={18} />}
                    label="Mostrar “Chamar no WhatsApp”"
                    hint="Além do chat do site, o comprador pode te chamar direto."
                  />
                  {showWhatsapp && !m.me.whatsapp && (
                    <Field label="Seu WhatsApp" icon={<Phone size={18} />} className="mt-3">
                      <input value={wa} onChange={(e) => setWa(maskPhone(e.target.value))} className="field h-12" placeholder="(11) 99999-9999" inputMode="tel" />
                    </Field>
                  )}
                  {showWhatsapp && m.me.whatsapp && <p className="mt-2 text-xs text-mute">Usando o número da sua conta: {maskPhone(m.me.whatsapp)}</p>}
                </section>

                <section className="rounded-3xl border border-line bg-[#06182c]/60 p-5">
                  <h2 className="mb-4 flex items-center gap-2 font-pixel text-2xl">
                    <FileText size={20} className="text-mute" /> Revisão
                  </h2>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    {[
                      ["Tipo", kind === "venda" ? "Vendo" : "Compro"],
                      ["Categoria", categories.find((c) => c.id === category)?.label],
                      ["Título", title || "—"],
                      ["Preço", n > 0 ? fmtPrice(n, currency) : "—"],
                      ["Região", server],
                      ["Propostas", negotiable ? "Aceita" : "Preço fixo"],
                      ["WhatsApp", showWhatsapp && waDigits ? "Sim" : "Não"],
                    ].map(([k, v]) => (
                      <div key={k} className={k === "Título" ? "col-span-2" : ""}>
                        <dt className="text-[11px] font-bold uppercase tracking-wider text-mute">{k}</dt>
                        <dd className="font-semibold">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {(title.trim().length < 4 || !(n > 0)) && <p className="mt-4 text-sm text-sell">Falta {title.trim().length < 4 ? "o título" : "o preço"}. Volte e preencha.</p>}
                </section>
              </>
            )}
          </div>

          {/* navegação */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
            {step > 0 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="btn btn-ghost rounded-full px-5">
                <ArrowLeft size={16} /> Voltar
              </button>
            ) : (
              <span />
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" disabled={!canNext} onClick={() => setStep(step + 1)} className="btn btn-volt rounded-full px-7 py-3 disabled:opacity-40">
                Continuar <ArrowRight size={16} />
              </button>
            ) : (
              <button type="button" onClick={publish} disabled={!(title.trim().length >= 4 && n > 0)} className="btn btn-volt rounded-full px-7 py-3 text-base disabled:opacity-40">
                <Rocket size={18} /> Publicar anúncio
              </button>
            )}
          </div>
        </div>

        {/* prévia ao vivo */}
        <aside className="self-start lg:sticky lg:top-28">
          <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-mute">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
            </span>
            Prévia ao vivo
          </div>
          <div className="pointer-events-none">
            <ListingCard l={draft} />
          </div>
          <p className="mt-3 text-xs text-mute">É assim que seu anúncio aparece na lista.</p>
        </aside>
      </div>
    </div>
  );
}
