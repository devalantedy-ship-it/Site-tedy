"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowLeft, Eye, Handshake, MessageCircle, Phone, ShieldAlert, Trash2 } from "lucide-react";
import { fmtPrice, useMarket } from "@/lib/store";
import { OfferModal } from "@/components/OfferModal";
import { Avatar, CatTile, KindBadge, ListingCard, Stars, StatusBadge, catLabel, timeAgo } from "@/components/ui";

export default function Page() {
  return (
    <Suspense>
      <ListingPage />
    </Suspense>
  );
}

function ListingPage() {
  const id = useSearchParams().get("id");
  const m = useMarket();
  const router = useRouter();
  const [offerOpen, setOfferOpen] = useState(false);
  const l = m.listings.find((x) => x.id === id);

  if (!m.ready) return null;
  if (!l)
    return (
      <div className="py-20 text-center text-mute">
        Anúncio não encontrado. <Link href="/anuncios" className="text-volt underline">Ver anúncios</Link>
      </div>
    );

  const seller = m.userById(l.userId);
  const mine = m.me?.id === l.userId;
  const closed = l.status === "concluido";
  const wa = l.showWhatsapp && seller?.whatsapp;
  const others = m.listings.filter((x) => x.userId === l.userId && x.id !== l.id && x.status !== "concluido").slice(0, 3);

  const needLogin = () => {
    if (m.me) return false;
    router.push(`/entrar?volta=${encodeURIComponent(`/anuncio?id=${l.id}`)}`);
    return true;
  };

  const chat = () => {
    if (needLogin()) return;
    const c = m.openConversation(l.id);
    if (c) router.push(`/mensagens?c=${c}`);
  };

  const waText = encodeURIComponent(
    `Olá ${seller?.nick}! Vi seu anúncio "${l.title}" (${fmtPrice(l.price, l.currency)}) no site. Ainda está disponível?`,
  );

  return (
    <div>
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-mute hover:text-ink">
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <article className="rounded-3xl glass p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <CatTile id={l.category} size={150} l={l} bob />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <KindBadge kind={l.kind} />
                <StatusBadge status={l.status} />
                <span className="text-xs text-mute">
                  {catLabel(l.category)} · Servidor {l.server}
                </span>
              </div>
              <h1 className="mt-2 font-pixel text-3xl leading-tight">{l.title}</h1>
              <div className="mt-1 flex items-center gap-3 text-xs text-mute">
                <span>Publicado {timeAgo(l.createdAt)}</span>
                <span className="flex items-center gap-1">
                  <Eye size={12} /> {l.views}
                </span>
              </div>
            </div>
          </div>

          {(l.level || l.boost != null || l.heldItem || l.shiny != null) && (
            <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {l.level ? <Attr k="Level" v={String(l.level)} /> : null}
              {l.boost != null ? <Attr k="Boost" v={`+${l.boost}`} /> : null}
              {l.shiny != null ? <Attr k="Shiny" v={l.shiny ? "Sim" : "Não"} /> : null}
              {l.heldItem ? <Attr k="Held item" v={l.heldItem} /> : null}
            </dl>
          )}

          <h2 className="mt-7 text-sm font-bold uppercase tracking-wider text-mute">Descrição</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed">{l.description}</p>

          <div className="mt-7 flex items-start gap-3 rounded-2xl border border-volt/25 bg-volt/5 p-4 text-sm">
            <ShieldAlert className="mt-0.5 shrink-0 text-volt" size={18} />
            <p className="text-mute">
              Confira a reputação antes de pagar. Em negócio grande, prefira entregar ou receber em partes. Nunca passe senha da sua conta
              fora de uma venda de personagem combinada.
            </p>
          </div>
        </article>

        <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-20">
          <div className="rounded-3xl glass p-5">
            <div className="text-xs text-mute">{l.kind === "compra" ? "Paga até" : "Preço"}</div>
            <div className="font-pixel text-4xl text-volt">{fmtPrice(l.price, l.currency)}</div>
            {l.category === "kk" && l.currency === "R$" && <div className="text-xs text-mute">por 1 KK</div>}
            <div className="mt-1 text-xs text-mute">{l.negotiable ? "Aceita propostas" : "Preço fixo"}</div>

            {mine ? (
              <div className="mt-5 flex flex-col gap-2">
                <Link href="/mensagens" className="btn btn-volt">
                  <MessageCircle size={16} /> Ver negociações
                </Link>
                {!closed && (
                  <button onClick={() => m.setListingStatus(l.id, "concluido")} className="btn btn-ghost">
                    Marcar como {l.kind === "venda" ? "vendido" : "comprado"}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm("Apagar este anúncio?")) {
                      m.deleteListing(l.id);
                      router.push("/minha-conta");
                    }
                  }}
                  className="btn btn-ghost text-sell"
                >
                  <Trash2 size={16} /> Apagar
                </button>
              </div>
            ) : closed ? (
              <div className="mt-5 rounded-xl bg-ok/10 p-3 text-center text-sm text-ok">Este negócio já foi fechado.</div>
            ) : (
              <div className="mt-5 flex flex-col gap-2">
                <button onClick={chat} className="btn btn-volt">
                  <MessageCircle size={16} /> {l.kind === "compra" ? "Tenho esse, chamar" : "Negociar no chat"}
                </button>
                {l.negotiable && (
                  <button onClick={() => !needLogin() && setOfferOpen(true)} className="btn btn-ghost">
                    <Handshake size={16} /> Fazer proposta
                  </button>
                )}
                {wa && (
                  <a href={`https://wa.me/55${seller!.whatsapp}?text=${waText}`} target="_blank" rel="noreferrer" className="btn btn-wa">
                    <Phone size={16} /> Chamar no WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>

          {seller && (
            <Link href={`/perfil?id=${seller.id}`} className="rounded-3xl glass p-5 transition hover:border-volt/50">
              <div className="flex items-center gap-3">
                <Avatar user={seller} size={48} />
                <div className="min-w-0">
                  <div className="truncate font-bold">{seller.nick}</div>
                  <div className="flex items-center gap-1.5 text-xs text-mute">
                    {seller.reviews ? (
                      <>
                        <Stars value={seller.rating} size={12} /> {seller.rating.toFixed(1)} ({seller.reviews})
                      </>
                    ) : (
                      "Sem avaliações ainda"
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-xl bg-panel-2 p-2">
                  <div className="font-pixel text-lg text-ink">{seller.deals}</div>
                  <div className="text-mute">negócios</div>
                </div>
                <div className="rounded-xl bg-panel-2 p-2">
                  <div className="font-pixel text-lg text-ink">{timeAgo(seller.since).replace("há ", "")}</div>
                  <div className="text-mute">no site</div>
                </div>
              </div>
            </Link>
          )}
        </aside>
      </div>

      {others.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 font-pixel text-xl">Mais de {seller?.nick}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <ListingCard key={o.id} l={o} />
            ))}
          </div>
        </section>
      )}

      {offerOpen && (
        <OfferModal
          defaultCurrency={l.currency}
          suggested={l.price}
          onClose={() => setOfferOpen(false)}
          onSend={(price, cur, text) => {
            const c = m.openConversation(l.id);
            if (!c) return;
            if (text) m.sendText(c, text);
            m.sendOffer(c, price, cur);
            router.push(`/mensagens?c=${c}`);
          }}
        />
      )}
    </div>
  );
}

function Attr({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-panel-2 px-3 py-2">
      <dt className="text-[11px] uppercase tracking-wider text-mute">{k}</dt>
      <dd className="font-bold">{v}</dd>
    </div>
  );
}
