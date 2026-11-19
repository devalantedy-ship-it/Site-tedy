// Sprites oficiais dos jogos, servidos pelo repositório público do PokeAPI.
// Gen 5 (Black/White) tem sprite animado até o nº 649; depois disso usa o estático.

const BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites";

export function pokeSprite(dex: number, { shiny = false, animated = true } = {}) {
  if (animated && dex <= 649)
    return `${BASE}/pokemon/versions/generation-v/black-white/animated/${shiny ? "shiny/" : ""}${dex}.gif`;
  return `${BASE}/pokemon/${shiny ? "shiny/" : ""}${dex}.png`;
}

/** Arte oficial (desenho grande, fundo transparente). */
export const artwork = (dex: number, shiny = false) =>
  `${BASE}/pokemon/other/official-artwork/${shiny ? "shiny/" : ""}${dex}.png`;

export const itemSprite = (name: string) => `${BASE}/items/${name}.png`;
export const trainerSprite = (name: string) => `https://play.pokemonshowdown.com/sprites/trainers/${name}.png`;

/** Imagem de cada categoria (usada nos ícones e quando o anúncio não tem pokémon/item próprio). */
export const categoryArt = {
  pokemon: artwork(130),
  item: itemSprite("poke-ball"),
  char: trainerSprite("red"),
  kk: itemSprite("big-nugget"),
  servico: itemSprite("master-ball"),
} as const;

// Lista de nomes (nº = posição + 1), baixada uma vez do PokeAPI pro autocompletar do formulário.
let namesCache: Promise<string[]> | null = null;
export function pokemonNames() {
  namesCache ??= fetch("https://pokeapi.co/api/v2/pokemon-species?limit=1025")
    .then((r) => r.json())
    .then((j: { results: { name: string }[] }) => j.results.map((x) => x.name))
    .catch(() => {
      namesCache = null;
      return [];
    });
  return namesCache;
}

export const prettyName = (n: string) => n.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Itens comuns que o vendedor pode escolher pra ilustrar o anúncio de item. */
export const commonItems = [
  "fire-stone", "water-stone", "leaf-stone", "thunder-stone", "moon-stone", "sun-stone", "ice-stone", "dusk-stone",
  "shiny-stone", "dawn-stone", "rare-candy", "master-ball", "ultra-ball", "great-ball", "poke-ball", "leftovers",
  "choice-band", "life-orb", "lucky-egg", "exp-share", "amulet-coin", "nugget", "big-nugget", "bicycle",
];
