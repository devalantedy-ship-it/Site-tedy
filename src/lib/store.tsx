"use client";

// Estado do protótipo: fica no navegador (localStorage), começa com os dados de exemplo.
// Na versão real cada função daqui vira uma chamada pra /api (Supabase).

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  seedConversations,
  seedListings,
  seedReviews,
  seedUsers,
  type Conversation,
  type Currency,
  type Listing,
  type Review,
  type User,
} from "./data";

type State = {
  users: User[];
  listings: Listing[];
  conversations: Conversation[];
  reviews: Review[];
  meId: string | null;
};

const KEY = "pokefeira-proto-v2";
const initial: State = {
  users: seedUsers,
  listings: seedListings,
  conversations: seedConversations,
  reviews: seedReviews,
  meId: null,
};

const uid = (p: string) => p + Math.random().toString(36).slice(2, 9);
const now = () => new Date().toISOString();

function useMarketState() {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, ready]);

  const me = state.users.find((u) => u.id === state.meId) ?? null;
  const userById = useCallback((id: string) => state.users.find((u) => u.id === id), [state.users]);

  const login = (nick: string, server: User["server"], whatsapp?: string) => {
    const existing = state.users.find((u) => u.nick.toLowerCase() === nick.toLowerCase());
    if (existing) {
      setState((s) => ({ ...s, meId: existing.id }));
      return existing.id;
    }
    const user: User = { id: uid("u"), nick, server, since: now(), whatsapp, rating: 0, reviews: 0, deals: 0 };
    setState((s) => ({ ...s, users: [...s.users, user], meId: user.id }));
    return user.id;
  };

  const logout = () => setState((s) => ({ ...s, meId: null }));

  const updateMe = (patch: Partial<User>) =>
    setState((s) => ({ ...s, users: s.users.map((u) => (u.id === s.meId ? { ...u, ...patch } : u)) }));

  const createListing = (data: Omit<Listing, "id" | "userId" | "createdAt" | "status" | "views">) => {
    if (!state.meId) return null;
    const l: Listing = { ...data, id: uid("a"), userId: state.meId, createdAt: now(), status: "ativo", views: 0 };
    setState((s) => ({ ...s, listings: [l, ...s.listings] }));
    return l.id;
  };

  const setListingStatus = (id: string, status: Listing["status"]) =>
    setState((s) => ({ ...s, listings: s.listings.map((l) => (l.id === id ? { ...l, status } : l)) }));

  const deleteListing = (id: string) =>
    setState((s) => ({
      ...s,
      listings: s.listings.filter((l) => l.id !== id),
      conversations: s.conversations.filter((c) => c.listingId !== id),
    }));

  /** Abre (ou reaproveita) a conversa do usuário logado com o dono do anúncio. */
  const openConversation = (listingId: string) => {
    const l = state.listings.find((x) => x.id === listingId);
    if (!l || !state.meId || l.userId === state.meId) return null;
    const found = state.conversations.find((c) => c.listingId === listingId && c.buyerId === state.meId);
    if (found) return found.id;
    const c: Conversation = { id: uid("c"), listingId, buyerId: state.meId, sellerId: l.userId, messages: [], readBy: [state.meId] };
    setState((s) => ({ ...s, conversations: [c, ...s.conversations] }));
    return c.id;
  };

  const pushMessage = (convId: string, msg: Omit<Message, "id" | "at" | "from">, from?: string) =>
    setState((s) => {
      const sender = from ?? s.meId!;
      return {
        ...s,
        conversations: s.conversations.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, { ...msg, id: uid("m"), at: now(), from: sender }], readBy: [sender] }
            : c,
        ),
      };
    });

  const sendText = (convId: string, text: string) => pushMessage(convId, { text });
  const sendOffer = (convId: string, price: number, currency: Currency) =>
    pushMessage(convId, { offer: { price, currency, status: "pendente" } });

  const answerOffer = (convId: string, msgId: string, accept: boolean) =>
    setState((s) => {
      const conv = s.conversations.find((c) => c.id === convId);
      if (!conv) return s;
      const offer = conv.messages.find((m) => m.id === msgId)?.offer;
      const sys: Message = {
        id: uid("m"),
        from: s.meId!,
        at: now(),
        system: true,
        text: accept
          ? `Proposta de ${fmtPrice(offer!.price, offer!.currency)} aceita. Combinem a entrega aqui no chat.`
          : "Proposta recusada.",
      };
      return {
        ...s,
        listings: accept ? s.listings.map((l) => (l.id === conv.listingId ? { ...l, status: "negociando" } : l)) : s.listings,
        conversations: s.conversations.map((c) =>
          c.id === convId
            ? {
                ...c,
                readBy: [s.meId!],
                messages: [
                  ...c.messages.map((m) =>
                    m.id === msgId && m.offer ? { ...m, offer: { ...m.offer, status: accept ? "aceita" : "recusada" } } : m,
                  ),
                  sys,
                ] as Message[],
              }
            : c,
        ),
      };
    });

  const markRead = (convId: string) =>
    setState((s) => {
      const c = s.conversations.find((x) => x.id === convId);
      if (!c || !s.meId || c.readBy.includes(s.meId)) return s;
      return { ...s, conversations: s.conversations.map((x) => (x.id === convId ? { ...x, readBy: [...x.readBy, s.meId!] } : x)) };
    });

  const addReview = (toUserId: string, stars: number, text: string) =>
    setState((s) => {
      const r: Review = { id: uid("r"), toUserId, fromUserId: s.meId!, stars, text, at: now() };
      return {
        ...s,
        reviews: [r, ...s.reviews],
        users: s.users.map((u) =>
          u.id === toUserId
            ? { ...u, reviews: u.reviews + 1, rating: Math.round(((u.rating * u.reviews + stars) / (u.reviews + 1)) * 10) / 10 }
            : u,
        ),
      };
    });

  const finishDeal = (convId: string) =>
    setState((s) => {
      const conv = s.conversations.find((c) => c.id === convId);
      if (!conv) return s;
      const sys: Message = { id: uid("m"), from: s.meId!, at: now(), system: true, text: "Negócio marcado como concluído. Não esqueçam de se avaliar!" };
      return {
        ...s,
        listings: s.listings.map((l) => (l.id === conv.listingId ? { ...l, status: "concluido" } : l)),
        users: s.users.map((u) => (u.id === conv.buyerId || u.id === conv.sellerId ? { ...u, deals: u.deals + 1 } : u)),
        conversations: s.conversations.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, sys], readBy: [s.meId!] } : c)),
      };
    });

  const resetDemo = () => setState({ ...initial, meId: state.meId && seedUsers.some((u) => u.id === state.meId) ? state.meId : null });

  return {
    ...state,
    ready,
    me,
    userById,
    login,
    logout,
    updateMe,
    createListing,
    setListingStatus,
    deleteListing,
    openConversation,
    sendText,
    sendOffer,
    answerOffer,
    markRead,
    addReview,
    finishDeal,
    resetDemo,
    /** Usado só no protótipo: simula o outro lado respondendo. */
    simulateReply: (convId: string, from: string, text: string) => pushMessage(convId, { text }, from),
  };
}

type Message = import("./data").Message;

export function fmtPrice(price: number, currency: Currency) {
  if (currency === "KK") return `${price.toLocaleString("pt-BR")} KK`;
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type Market = ReturnType<typeof useMarketState>;
const Ctx = createContext<Market | null>(null);

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const value = useMarketState();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMarket() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMarket fora do MarketProvider");
  return v;
}

export function useUnread() {
  const { conversations, meId } = useMarket();
  return useMemo(
    () =>
      meId
        ? conversations.filter((c) => (c.buyerId === meId || c.sellerId === meId) && c.messages.length && !c.readBy.includes(meId)).length
        : 0,
    [conversations, meId],
  );
}
