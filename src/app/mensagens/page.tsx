"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Handshake, Phone, Send, Star, X } from "lucide-react";
import type { Conversation } from "@/lib/data";
import { fmtPrice, useMarket } from "@/lib/store";
import { OfferModal } from "@/components/OfferModal";
import { Avatar, CatTile, KindBadge, StatusBadge, timeAgo } from "@/components/ui";

export default function Page() {
  return (
    <Suspense>
      <Inbox />
    </Suspense>
  );
}

function Inbox() {
  const m = useMarket();
  const router = useRouter();
  const sel = useSearchParams().get("c");

  useEffect(() => {
    if (m.ready && !m.me) router.replace("/entrar?volta=/mensagens");
  }, [m.ready, m.me, router]);

  const mine = useMemo(
    () =>
      m.conversations
        .filter((c) => c.buyerId === m.meId || c.sellerId === m.meId)
        .sort((a, b) => (b.messages.at(-1)?.at ?? "").localeCompare(a.messages.at(-1)?.at ?? "")),
    [m.conversations, m.meId],
  );

  if (!m.me) return null;
  const current = mine.find((c) => c.id === sel);

  return (
    <div>
      <h1 className="font-pixel text-3xl">Negociações</h1>
      <div className="mt-5 grid h-[calc(100dvh-12rem)] min-h-[480px] overflow-hidden rounded-3xl border border-line bg-panel md:grid-cols-[300px_1fr]">
        <ul className={`overflow-y-auto border-line md:border-r ${current ? "hidden md:block" : ""}`}>
          {mine.length === 0 && (
            <li className="p-6 text-sm text-mute">
              Nenhuma conversa ainda. Abra um anúncio e clique em <b>Negociar</b>.
            </li>
          )}
          {mine.map((c) => {
            const l = m.listings.find((x) => x.id === c.listingId);
            const other = m.userById(c.buyerId === m.meId ? c.sellerId : c.buyerId);
            const last = c.messages.at(-1);
            const unread = last && !c.readBy.includes(m.meId!);
            return (
              <li key={c.id}>
                <Link
                  href={`/mensagens?c=${c.id}`}
                  className={`flex gap-3 border-b border-line/60 p-3 transition hover:bg-panel-2 ${c.id === sel ? "bg-panel-2" : ""}`}
                >
                  <Avatar user={other} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`truncate text-sm ${unread ? "font-extrabold" : "font-semibold"}`}>{other?.nick}</span>
                      {last && <span className="shrink-0 text-[10px] text-mute">{timeAgo(last.at)}</span>}
                    </div>
                    <div className="truncate text-xs text-volt/80">{l?.title}</div>
                    <div className={`truncate text-xs ${unread ? "text-ink" : "text-mute"}`}>
                      {last ? (last.offer ? `Proposta: ${fmtPrice(last.offer.price, last.offer.currency)}` : last.text) : "Sem mensagens"}
                    </div>
                  </div>
                  {unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sell" />}
                </Link>
              </li>
            );
          })}
        </ul>

        {current ? (
          <Chat key={current.id} c={current} />
        ) : (
          <div className="hidden place-items-center p-8 text-center text-sm text-mute md:grid">Escolha uma conversa ao lado.</div>
        )}
      </div>
    </div>
  );
}

function Chat({ c }: { c: Conversation }) {
  const m = useMarket();
  const [text, setText] = useState("");
  const [offerOpen, setOfferOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  const l = m.listings.find((x) => x.id === c.listingId);
  const otherId = c.buyerId === m.meId ? c.sellerId : c.buyerId;
  const other = m.userById(otherId);
  const iAmOwner = c.sellerId === m.meId;
  const reviewed = m.reviews.some((r) => r.fromUserId === m.meId && r.toUserId === otherId && r.at >= (c.messages[0]?.at ?? ""));
  const accepted = c.messages.some((x) => x.offer?.status === "aceita");
  const done = l?.status === "concluido";

  useEffect(() => {
    m.markRead(c.id);
    end.current?.scrollIntoView({ block: "end" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.messages.length]);

  // Protótipo: o outro jogador "responde" sozinho depois de alguns segundos.
  const lastMsg = c.messages.at(-1);
  const lastFrom = lastMsg && !lastMsg.system ? lastMsg.from : null;
  useEffect(() => {
    if (lastFrom !== m.meId || done) return;
    const t = setTimeout(() => {
      const replies = ["Fechado, me chama no jogo que eu tô online.", "Hmm, deixa eu pensar e já te respondo.", "Consegue melhorar um pouquinho?", "Beleza! Qual seu nick?"];
      m.simulateReply(c.id, otherId, replies[c.messages.length % replies.length]);
    }, 3500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastFrom, c.messages.length]);

  if (!l) return null;

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-line p-3">
        <Link href="/mensagens" className="rounded-lg p-1 text-mute hover:bg-panel-2 md:hidden" aria-label="Voltar">
          <ArrowLeft size={18} />
        </Link>
        <Link href={`/anuncio?id=${l.id}`} className="flex min-w-0 flex-1 items-center gap-3">
          <CatTile id={l.category} size={40} shiny={l.shiny} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <KindBadge kind={l.kind} />
              <StatusBadge status={l.status} />
            </div>
            <div className="truncate text-sm font-bold">{l.title}</div>
          </div>
        </Link>
        <div className="hidden text-right sm:block">
          <div className="font-pixel text-lg text-volt">{fmtPrice(l.price, l.currency)}</div>
          <Link href={`/perfil?id=${otherId}`} className="text-xs text-mute hover:text-ink">com {other?.nick}</Link>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
        {c.messages.length === 0 && (
          <div className="m-auto max-w-xs text-center text-sm text-mute">
            Diga oi pra {other?.nick} ou mande uma proposta direto.
          </div>
        )}
        {c.messages.map((msg) => {
          const me = msg.from === m.meId;
          if (msg.system)
            return (
              <div key={msg.id} className="my-1 self-center rounded-full bg-panel-2 px-3 py-1 text-center text-xs text-mute">
                {msg.text}
              </div>
            );
          if (msg.offer) {
            const o = msg.offer;
            const canAnswer = !me && o.status === "pendente" && !done;
            return (
              <div key={msg.id} className={`max-w-[85%] rounded-2xl border p-3 ${me ? "self-end border-volt/40 bg-volt/10" : "self-start border-line bg-panel-2"}`}>
                <div className="flex items-center gap-1.5 text-xs text-mute">
                  <Handshake size={14} /> {me ? "Sua proposta" : `Proposta de ${other?.nick}`}
                </div>
                <div className="font-pixel text-2xl text-volt">{fmtPrice(o.price, o.currency)}</div>
                {o.status !== "pendente" ? (
                  <div className={`text-xs font-bold ${o.status === "aceita" ? "text-ok" : "text-sell"}`}>
                    {o.status === "aceita" ? "Aceita" : "Recusada"}
                  </div>
                ) : canAnswer ? (
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => m.answerOffer(c.id, msg.id, true)} className="btn btn-volt px-3 py-1.5 text-xs">
                      <Check size={14} /> Aceitar
                    </button>
                    <button onClick={() => m.answerOffer(c.id, msg.id, false)} className="btn btn-ghost px-3 py-1.5 text-xs">
                      <X size={14} /> Recusar
                    </button>
                    <button onClick={() => setOfferOpen(true)} className="btn btn-ghost px-3 py-1.5 text-xs">
                      Contraproposta
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-mute">Aguardando resposta</div>
                )}
              </div>
            );
          }
          return (
            <div
              key={msg.id}
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${me ? "self-end rounded-br-md bg-volt text-bg" : "self-start rounded-bl-md bg-panel-2"}`}
            >
              {msg.text}
              <div className={`mt-0.5 text-[10px] ${me ? "text-bg/60" : "text-mute"}`}>{timeAgo(msg.at)}</div>
            </div>
          );
        })}
        <div ref={end} />
      </div>

      {(accepted || done) && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line bg-ok/5 px-3 py-2 text-xs">
          {!done && iAmOwner && (
            <button onClick={() => m.finishDeal(c.id)} className="btn btn-volt px-3 py-1.5 text-xs">
              <Check size={14} /> Marcar como concluído
            </button>
          )}
          {!done && !iAmOwner && <span className="text-mute">Depois da entrega, o dono do anúncio marca como concluído.</span>}
          {done && !reviewed && (
            <button onClick={() => setReviewOpen(true)} className="btn btn-volt px-3 py-1.5 text-xs">
              <Star size={14} /> Avaliar {other?.nick}
            </button>
          )}
          {done && reviewed && <span className="text-ok">Você já avaliou esta negociação.</span>}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          m.sendText(c.id, text.trim());
          setText("");
        }}
        className="flex items-center gap-2 border-t border-line p-3"
      >
        {!done && (
          <button type="button" onClick={() => setOfferOpen(true)} className="btn btn-ghost shrink-0 px-3" title="Fazer proposta">
            <Handshake size={18} />
          </button>
        )}
        {iAmOwner === false && l.showWhatsapp && other?.whatsapp && (
          <a href={`https://wa.me/55${other.whatsapp}`} target="_blank" rel="noreferrer" className="btn btn-wa shrink-0 px-3" title="WhatsApp">
            <Phone size={18} />
          </a>
        )}
        <input value={text} onChange={(e) => setText(e.target.value)} className="field" placeholder="Escreva uma mensagem..." />
        <button className="btn btn-volt shrink-0 px-3" aria-label="Enviar">
          <Send size={18} />
        </button>
      </form>

      {offerOpen && (
        <OfferModal
          defaultCurrency={l.currency}
          suggested={l.price}
          onClose={() => setOfferOpen(false)}
          onSend={(price, cur, t) => {
            if (t) m.sendText(c.id, t);
            m.sendOffer(c.id, price, cur);
            setOfferOpen(false);
          }}
        />
      )}
      {reviewOpen && (
        <ReviewModal
          nick={other?.nick ?? ""}
          onClose={() => setReviewOpen(false)}
          onSend={(stars, t) => {
            m.addReview(otherId, stars, t);
            setReviewOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ReviewModal({ nick, onClose, onSend }: { nick: string; onClose: () => void; onSend: (s: number, t: string) => void }) {
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onSend(stars, text.trim());
        }}
        className="rise w-full max-w-sm rounded-3xl border border-line bg-panel p-6"
      >
        <h3 className="font-pixel text-2xl">Avaliar {nick}</h3>
        <div className="mt-4 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button type="button" key={i} onClick={() => setStars(i)} aria-label={`${i} estrelas`}>
              <Star size={32} className={i <= stars ? "fill-volt text-volt" : "text-line"} />
            </button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="field mt-4 resize-none" placeholder="Como foi a negociação?" />
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancelar</button>
          <button className="btn btn-volt">Enviar avaliação</button>
        </div>
      </form>
    </div>
  );
}
