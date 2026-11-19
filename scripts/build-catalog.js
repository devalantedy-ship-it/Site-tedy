// Monta src/lib/otp-catalog.ts a partir do que foi lido da wiki do otPokémon (só nomes)
// e liga cada nome ao id do PokeAPI (arte oficial) / sprite de item.
const fs = require("fs");
const [raw, pokes, items, out] = process.argv.slice(2);
const W = JSON.parse(fs.readFileSync(raw, "utf8"));
const P = JSON.parse(fs.readFileSync(pokes, "utf8")).results.map((r) => ({ name: r.name, id: +r.url.split("/").at(-2) }));
const byName = new Map(P.map((p) => [p.name, p.id]));
const I = new Set(JSON.parse(fs.readFileSync(items, "utf8")).results.map((r) => r.name));

const special = {
  "nidoranfe-image": "nidoran-f", "nidoranma-image": "nidoran-m", "nidoran female": "nidoran-f", "nidoran male": "nidoran-m",
  "mr. mime": "mr-mime", "mime jr": "mime-jr", "mr. rime": "mr-rime", "galarian mr. mime": "mr-mime-galar", "galarian mr. rime": "mr-rime",
  "type- null": "type-null", "farfetch'd": "farfetchd", "gastrodon west": "gastrodon", "gastrodon east": "gastrodon",
  "frillish ma": "frillish-male", "jellicent ma": "jellicent-male", "jellicent male": "jellicent-male", "jellicent female": "jellicent-female", "pyroar": "pyroar-male",
  "basculegion ma": "basculegion-male", "basculegion male": "basculegion-male", "basculegion female": "basculegion-female",
  "toxtricity amp": "toxtricity-amped", "toxtricity low": "toxtricity-low-key", "alolan rattata2": "rattata-alola",
  "porygon-ii": "porygon2", "wormadam-sandy": "wormadam-sandy", "lycanroc": "lycanroc-midday", "lycanroc midnight": "lycanroc-midnight",
  "lycanroc dusk": "lycanroc-dusk", "pyroar female": "pyroar-female", "pyroar male": "pyroar-male", "aegislash shield": "aegislash-shield",
  "aegislash blade": "aegislash-blade", "basculin blue": "basculin-blue-striped", "basculin red": "basculin-red-striped",
  "basculin white": "basculin-white-striped", "pumpkaboo small": "pumpkaboo-small", "pumpkaboo large": "pumpkaboo-large",
  "gourgeist small": "gourgeist-small", "gourgeist large": "gourgeist-large", "smeargle birthday": "smeargle",
  "pikachu surf": "pikachu", "pikachu fly": "pikachu", "raichu surf": "raichu", "raichu fly": "raichu",
  "rotom heat": "rotom-heat", "rotom wash": "rotom-wash", "rotom frost": "rotom-frost", "rotom fan": "rotom-fan", "rotom mow": "rotom-mow",
  "minior": "minior-red-meteor", "oricorio": "oricorio-baile", "wishiwashi": "wishiwashi-solo", "mimikyu": "mimikyu-disguised",
  "meowstic": "meowstic-male", "darmanitan": "darmanitan-standard", "deoxys": "deoxys-normal", "giratina": "giratina-altered",
  "shaymin": "shaymin-land", "basculin": "basculin-red-striped", "tornadus": "tornadus-incarnate", "thundurus": "thundurus-incarnate",
  "landorus": "landorus-incarnate", "keldeo": "keldeo-ordinary", "meloetta": "meloetta-aria", "aegislash": "aegislash-shield",
  "pumpkaboo": "pumpkaboo-average", "gourgeist": "gourgeist-average", "zygarde": "zygarde-50", "wormadam": "wormadam-plant",
  "eiscue": "eiscue-ice", "indeedee": "indeedee-male", "morpeko": "morpeko-full-belly", "urshifu": "urshifu-single-strike",
};
function slug(n) {
  let s = n.trim().toLowerCase();
  if (special[s]) return special[s];
  const m = s.match(/^(alolan|galarian|hisuian) (.+)$/);
  if (m) return `${slug(m[2]).replace(/-.*$/, "")}-${{ alolan: "alola", galarian: "galar", hisuian: "hisui" }[m[1]]}`;
  return s.replace(/[.'’:]/g, "").replace(/\s+/g, "-");
}
function idOf(n) {
  const s = slug(n);
  return byName.get(s) ?? byName.get(s.split("-")[0]) ?? null;
}
const pretty = (n) => n.replace(/-image$/i, "").replace(/^Nidoranfe$/i, "Nidoran♀").replace(/^Nidoranma$/i, "Nidoran♂")
  .replace(/ ma$/i, "").replace("Alolan Rattata2", "Alolan Rattata").replace("Type- null", "Type: Null").replace(/\s+$/, "")
  .replace(/^Mime jr$/i, "Mime Jr.").replace(/^Porygon-z$/i, "Porygon-Z").replace(/^Gastrodon west$/i, "Gastrodon").replace(/^Wormadam-sandy$/i, "Wormadam (Sandy)");

// Pokédex
const shinySlugs = new Set(W.shiny.map((n) => idOf(n)).filter(Boolean));
const dex = [];
const missing = [];
for (const n of W.dex) {
  const id = idOf(n);
  if (!id) { missing.push(n); continue; }
  dex.push([pretty(n), id, shinySlugs.has(id) ? 1 : 0]);
}

// Itens
const fixItem = { Chacoal: "Charcoal", "Psychic Gem Sprite": "Psychic Gem", DubiousDisc: "Dubious Disc" };
const drop = /^(NPC |Battle Points)/;
const itemSlug = (n) => n.toLowerCase().replace(/[.'’]/g, "").replace(/\s+/g, "-");
const itemGroups = { held: "Held items", evolucao: "Itens de evolução", boost: "Boost", tm: "TMs" };
const itemsOut = [];
for (const [k, list] of Object.entries(W.items)) {
  for (let n of list) {
    if (drop.test(n)) continue;
    n = fixItem[n] ?? n;
    let s = itemSlug(n);
    const tm = s.match(/^([a-z]+)-type-tm-disk$/);
    if (tm) s = "tm-" + tm[1]; // existe sprite tm-<tipo> no repositório
    const alt = { leek: "stick", "earth-stone": "soft-sand", "insect-stone": "silver-powder", "rock-stone": "hard-stone", "poison-stone": "poison-barb",
      "heart-stone": "heart-scale", "winner-stone": "star-piece", "psychic-stone": "twisted-spoon", "dragon-stone": "dragon-scale", "fairy-stone": "pixie-plate",
      "pure-stone": "shiny-stone", "roll-stone": "float-stone", "lovely-stone": "sweet-heart", "articuno-feather": "pretty-wing", "zapdos-feather": "pretty-wing",
      "cursed-souls": "reaper-cloth", "green-ambar": "old-amber", "necklace-of-spirit": "odd-keystone", "fullmoon-jewel": "moon-stone", "bloodmoon-jewel": "comet-shard",
      "sunrise-stone": "sun-stone", "nightfall-stone": "dusk-stone", "twilight-stone": "dawn-stone", "boost-stone": "protein" };
    if (alt[s]) s = alt[s];
    itemsOut.push([n, itemGroups[k], I.has(s) || tm ? s : ""]);
  }
}

// Addons: junta repetidos, tira lixo de nome de arquivo e mantém os Pokémon compatíveis
const pokeNames = new Set(W.dex.map((n) => pretty(n).toLowerCase()));
const addons = new Map();
for (let [name, group, pk] of W.addons) {
  name = name.replace(/^(FE|MA) - /, "").replace(/^PyroarFE - /, "");
  const low = name.toLowerCase();
  const first = low.split(/[\s-]/)[0];
  const junk =
    /---|-[a-z]+-[a-z]|^itens-|camada|20skeleton|addon\d|^addon20|^s[a-z]+ porygon|^h\.l /i.test(name) ||
    pokeNames.has(first) || pokeNames.has(first.replace(/^s/, "")) || / - /.test(name) || /^[a-z]+mobster/i.test(name);
  const list = pk ? pk.split("|") : [];
  if (junk && !list.length) continue;
  const key = name.replace(/'S\b/g, "'s");
  const cur = addons.get(key) ?? { g: group, p: new Set() };
  list.forEach((x) => cur.p.add(x));
  addons.set(key, cur);
}
const addonsOut = [...addons.entries()]
  .map(([n, v]) => [n, v.g, [...v.p].map((x) => idOf(x)).filter(Boolean)])
  .filter(([, , p]) => p.length)
  .sort((a, b) => a[0].localeCompare(b[0]));

const ts = `// Catálogo do otPokémon pro formulário de anunciar.
// Nomes tirados da wiki oficial (wiki.otponline.com) em 2026-11-19; ícones vêm do PokeAPI (arte oficial / sprites de item).
// Gerado por script: pra atualizar, rode de novo em vez de editar à mão.

/** [nome, nº no PokeAPI (arte), tem shiny no otPokémon (1/0)] */
export const otpDex: [string, number, 0 | 1][] = ${JSON.stringify(dex)};

/** [nome, grupo, sprite do item no PokeAPI ("" = sem ícone)] */
export const otpItems: [string, string, string][] = ${JSON.stringify(itemsOut)};

/** [nome do addon, onde sai (box/evento), nºs dos Pokémon que usam] */
export const otpAddons: [string, string, number[]][] = ${JSON.stringify(addonsOut)};
`;
fs.writeFileSync(out, ts);
console.log({ dex: dex.length, semArte: missing, shiny: dex.filter((d) => d[2]).length, itens: itemsOut.length, itensSemIcone: itemsOut.filter((i) => !i[2]).map((i) => i[0]), addons: addonsOut.length, kb: Math.round(ts.length / 1024) });
