// Tudo que o cliente vai querer trocar fica aqui: nome do site, servidores, categorias.
// No protótipo os anúncios, usuários e conversas também vêm daqui (dados de exemplo).
// Quando ligar o Supabase, essas listas viram tabelas.

export const site = {
  name: "PokeFeira",
  tagline: "O mercado dos treinadores de Poketibia",
  description:
    "Compre, venda e negocie pokémons, itens, personagens e KK com outros jogadores. Anuncie o que você tem ou o que está procurando.",
  discord: "#",
};

export const servers = ["Kanto", "Johto", "Hoenn", "Sinnoh"] as const;
export type Server = (typeof servers)[number];

export const categories = [
  { id: "pokemon", label: "Pokémon", hint: "level, boost, shiny" },
  { id: "item", label: "Itens", hint: "held items, stones, addons" },
  { id: "char", label: "Personagens", hint: "contas e chars" },
  { id: "kk", label: "KK / Gold", hint: "dinheiro do jogo" },
  { id: "servico", label: "Serviços", hint: "boost, catch, quests" },
] as const;
export type CategoryId = (typeof categories)[number]["id"];

export type Kind = "venda" | "compra";
export type Currency = "R$" | "KK";

export type User = {
  id: string;
  nick: string;
  server: Server;
  since: string; // ISO
  whatsapp?: string; // só números, com DDD. Vazio = não mostra botão
  bio?: string;
  rating: number; // média 0–5
  reviews: number;
  deals: number;
};

export type Listing = {
  id: string;
  kind: Kind;
  category: CategoryId;
  title: string;
  description: string;
  server: Server;
  price: number;
  currency: Currency;
  negotiable: boolean;
  showWhatsapp: boolean;
  userId: string;
  createdAt: string;
  status: "ativo" | "negociando" | "concluido";
  // campos de pokémon (opcionais)
  level?: number;
  boost?: number;
  shiny?: boolean;
  heldItem?: string;
  dex?: number; // nº da pokédex (mostra a arte oficial)
  item?: string; // nome do item no PokeAPI (ex. fire-stone) pra ilustrar
  views: number;
};

export type Message = {
  id: string;
  from: string; // userId
  at: string;
  text?: string;
  offer?: { price: number; currency: Currency; status: "pendente" | "aceita" | "recusada" };
  system?: boolean;
};

export type Conversation = {
  id: string;
  listingId: string;
  buyerId: string; // quem chamou (interessado)
  sellerId: string; // dono do anúncio
  messages: Message[];
  readBy: string[];
};

export type Review = {
  id: string;
  toUserId: string;
  fromUserId: string;
  stars: number;
  text: string;
  at: string;
};

const d = (daysAgo: number, h = 0) =>
  new Date(Date.UTC(2026, 10, 19, 12 - h) - daysAgo * 86400000).toISOString();

export const seedUsers: User[] = [
  { id: "u1", nick: "AshDoKanto", server: "Kanto", since: d(400), whatsapp: "11999990001", bio: "Vendo shinys desde 2019. Entrega na hora.", rating: 4.9, reviews: 132, deals: 210 },
  { id: "u2", nick: "MistyAqua", server: "Johto", since: d(220), bio: "Colecionadora de aquáticos. Só negocio pelo site.", rating: 4.7, reviews: 58, deals: 77 },
  { id: "u3", nick: "BrockRocha", server: "Kanto", since: d(90), whatsapp: "21988880002", rating: 4.4, reviews: 19, deals: 25 },
  { id: "u4", nick: "TreinadorX", server: "Hoenn", since: d(30), rating: 5, reviews: 4, deals: 4 },
  { id: "u5", nick: "GaryLendario", server: "Sinnoh", since: d(600), whatsapp: "31977770003", bio: "Contas montadas e KK com preço justo.", rating: 4.8, reviews: 301, deals: 455 },
];

export const seedListings: Listing[] = [
  { id: "a1", dex: 6, kind: "venda", category: "pokemon", title: "Shiny Charizard +50", description: "Level 150, boost +50, com held X-Attack tier 5. Nunca foi trocado. Entrego no CP de Saffron.", server: "Kanto", price: 180, currency: "R$", negotiable: true, showWhatsapp: true, userId: "u1", createdAt: d(0, 2), status: "ativo", level: 150, boost: 50, shiny: true, heldItem: "X-Attack T5", views: 312 },
  { id: "a2", item: "big-nugget", kind: "venda", category: "kk", title: "500 KK disponível", description: "Tenho 500kk pra vender, mínimo 50kk por compra. Pago primeiro pra quem tem avaliação boa.", server: "Sinnoh", price: 0.35, currency: "R$", negotiable: false, showWhatsapp: true, userId: "u5", createdAt: d(0, 5), status: "ativo", views: 540 },
  { id: "a3", dex: 130, kind: "compra", category: "pokemon", title: "Procuro Gyarados shiny +30 ou mais", description: "Pago em KK ou R$. Preferência com held de defesa.", server: "Johto", price: 120, currency: "R$", negotiable: true, showWhatsapp: false, userId: "u2", createdAt: d(0, 7), status: "ativo", boost: 30, shiny: true, views: 88 },
  { id: "a4", item: "fire-stone", kind: "venda", category: "item", title: "Kit 10 Stones de cada tipo", description: "Fire, Water, Leaf, Thunder, Heart, Darkness, Venom, Ice, Crystal, Earth. 10 de cada.", server: "Kanto", price: 900, currency: "KK", negotiable: true, showWhatsapp: false, userId: "u3", createdAt: d(1), status: "ativo", views: 145 },
  { id: "a5", kind: "venda", category: "char", title: "Char level 320 com 6 shinys", description: "Clã Volcanic rank 5, outfit de evento, 6 shinys na bag (lista no chat). Troco e-mail na hora.", server: "Sinnoh", price: 1450, currency: "R$", negotiable: true, showWhatsapp: true, userId: "u5", createdAt: d(1, 3), status: "ativo", level: 320, views: 920 },
  { id: "a6", item: "nugget", kind: "compra", category: "kk", title: "Compro 200kk", description: "Pago via Pix depois de receber os primeiros 50kk.", server: "Hoenn", price: 70, currency: "R$", negotiable: true, showWhatsapp: false, userId: "u4", createdAt: d(1, 6), status: "ativo", views: 61 },
  { id: "a7", dex: 144, kind: "venda", category: "servico", title: "Faço catch de lendários", description: "Tenho time pra catch de lendário do mapa. Você paga as balls, eu entrego o poke.", server: "Johto", price: 60, currency: "R$", negotiable: true, showWhatsapp: false, userId: "u2", createdAt: d(2), status: "ativo", views: 203 },
  { id: "a8", dex: 94, kind: "venda", category: "pokemon", title: "Gengar +70 com held Hellfire", description: "Level 140, boost +70. Ótimo pra hunt.", server: "Hoenn", price: 2200, currency: "KK", negotiable: false, showWhatsapp: false, userId: "u4", createdAt: d(2, 4), status: "ativo", level: 140, boost: 70, shiny: false, heldItem: "Hellfire T4", views: 77 },
  { id: "a9", dex: 25, kind: "compra", category: "item", title: "Procuro addon de Pikachu (surf)", description: "Pago bem, tenho KK ou troco por stones.", server: "Kanto", price: 300, currency: "KK", negotiable: true, showWhatsapp: true, userId: "u1", createdAt: d(3), status: "ativo", views: 39 },
  { id: "a10", dex: 212, kind: "venda", category: "pokemon", title: "Shiny Scizor +40", description: "Level 130, boost +40, sem held.", server: "Kanto", price: 95, currency: "R$", negotiable: true, showWhatsapp: true, userId: "u3", createdAt: d(4), status: "concluido", level: 130, boost: 40, shiny: true, views: 410 },
];

export const seedConversations: Conversation[] = [
  {
    id: "c1",
    listingId: "a1",
    buyerId: "u2",
    sellerId: "u1",
    readBy: ["u1"],
    messages: [
      { id: "m1", from: "u2", at: d(0, 1.5), text: "Opa! Ainda tá disponível? Faria por 150?" },
      { id: "m2", from: "u2", at: d(0, 1.5), offer: { price: 150, currency: "R$", status: "pendente" } },
    ],
  },
];

export const seedReviews: Review[] = [
  { id: "r1", toUserId: "u1", fromUserId: "u5", stars: 5, text: "Entregou na hora, super tranquilo.", at: d(10) },
  { id: "r2", toUserId: "u1", fromUserId: "u3", stars: 5, text: "Confiável, recomendo.", at: d(25) },
  { id: "r3", toUserId: "u5", fromUserId: "u4", stars: 5, text: "Comprei 100kk, veio certinho.", at: d(5) },
  { id: "r4", toUserId: "u2", fromUserId: "u1", stars: 4, text: "Demorou um pouco pra responder mas deu tudo certo.", at: d(12) },
  { id: "r5", toUserId: "u3", fromUserId: "u2", stars: 4, text: "Bom vendedor.", at: d(40) },
];
