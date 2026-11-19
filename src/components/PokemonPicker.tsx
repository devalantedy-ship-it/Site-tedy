"use client";

// Seletores do formulário de anunciar, usando o catálogo do otPokémon (src/lib/otp-catalog.ts):
// Pokémon (Pokédex do jogo), Item (held, stones, TMs...) e Addon (com os Pokémon que podem usar).

import { useMemo, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";
import { artwork, itemSprite } from "@/lib/poke";
import { otpAddons, otpDex, otpItems } from "@/lib/otp-catalog";

/* eslint-disable @next/next/no-img-element */

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const dexById = new Map(otpDex.map(([n, id, sh]) => [id, { name: n, shiny: !!sh }]));
export const dexName = (id?: number) => (id ? dexById.get(id)?.name : undefined);
export const hasShiny = (id?: number) => (id ? !!dexById.get(id)?.shiny : false);

function Shell({ img, children }: { img: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-line bg-panel-2/60 p-3">
      <div className="seigaiha grid h-20 w-20 shrink-0 place-items-center rounded-full bg-linear-to-b from-[#1d4d78] to-[#0d2c4c]">{img}</div>
      <div className="relative min-w-0 flex-1">{children}</div>
    </div>
  );
}

function SearchBox<T>({
  label,
  placeholder,
  items,
  match,
  render,
  onPick,
  selected,
  onClear,
}: {
  label: string;
  placeholder: string;
  items: T[];
  match: (t: T, q: string) => boolean;
  render: (t: T) => React.ReactNode;
  onPick: (t: T) => void;
  selected?: string;
  onClear?: () => void;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    const t = norm(q.trim());
    if (!t) return items.slice(0, 30);
    return items.filter((x) => match(x, t)).slice(0, 30);
  }, [q, items, match]);

  return (
    <>
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {selected ? (
        <div className="flex items-center gap-2 rounded-xl border border-sell/50 bg-sell/10 px-3 py-2.5">
          <span className="flex-1 truncate font-bold">{selected}</span>
          <button type="button" onClick={onClear} className="rounded-full p-1 text-mute hover:bg-white/10 hover:text-ink" aria-label="Trocar">
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            className="field pl-9"
            placeholder={placeholder}
          />
          {open && results.length > 0 && (
            <ul className="absolute z-30 mt-1 max-h-80 w-full overflow-auto rounded-xl border border-line bg-[#0d2c4c] p-1 shadow-2xl">
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onPick(r);
                      setQ("");
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-panel-2"
                  >
                    {render(r)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}

/** Pokémon da Pokédex do otPokémon. */
export function PokemonPicker({ dex, shiny, onPick }: { dex?: number; shiny: boolean; onPick: (dex: number | undefined, name: string) => void }) {
  return (
    <Shell img={dex ? <img src={artwork(dex, shiny)} alt="" className="h-24 w-24 max-w-none drop-shadow-[0_6px_6px_#0008]" /> : <span className="text-2xl text-mute">?</span>}>
      <SearchBox
        label="Qual Pokémon?"
        placeholder={`Buscar entre os ${otpDex.length} da Pokédex do otPokémon`}
        items={otpDex}
        match={([n, id], t) => norm(n).includes(t) || String(id) === t}
        render={([n, id, sh]) => (
          <>
            <img src={artwork(id)} alt="" className="h-9 w-9" loading="lazy" />
            <span className="font-semibold">{n}</span>
            {sh ? (
              <span className="ml-auto flex items-center gap-1 text-[11px] text-volt">
                <Sparkles size={12} /> shiny
              </span>
            ) : null}
          </>
        )}
        onPick={([n, id]) => onPick(id, n)}
        selected={dexName(dex)}
        onClear={() => onPick(undefined, "")}
      />
      {dex && shiny && !hasShiny(dex) && <p className="mt-2 text-xs text-sell">Atenção: esse Pokémon não tem versão shiny no otPokémon.</p>}
      {dex && hasShiny(dex) && !shiny && <p className="mt-2 text-xs text-mute">Esse tem versão shiny no jogo. Marque “É shiny” se for o caso.</p>}
    </Shell>
  );
}

/** Itens do jogo: held items, itens de evolução, boost, TMs. */
export function ItemPicker({ item, name, onPick }: { item?: string; name?: string; onPick: (sprite: string | undefined, name: string) => void }) {
  return (
    <Shell img={item ? <img src={itemSprite(item)} alt="" className="h-12 w-12 [image-rendering:pixelated]" /> : <span className="text-2xl text-mute">?</span>}>
      <SearchBox
        label="Qual item?"
        placeholder={`Buscar entre ${otpItems.length} itens (held, stones, TMs...)`}
        items={otpItems}
        match={([n, g], t) => norm(n).includes(t) || norm(g).includes(t)}
        render={([n, g, s]) => (
          <>
            <img src={itemSprite(s)} alt="" className="h-8 w-8 [image-rendering:pixelated]" loading="lazy" />
            <span className="font-semibold">{n}</span>
            <span className="ml-auto text-[11px] text-mute">{g}</span>
          </>
        )}
        onPick={([n, , s]) => onPick(s, n)}
        selected={name}
        onClear={() => onPick(undefined, "")}
      />
      <p className="mt-2 text-xs text-mute">Não achou? Tudo bem, escreva o nome no título.</p>
    </Shell>
  );
}

/** Addons: escolhe o addon e depois o Pokémon que vai usar (a arte mostra o Pokémon). */
export function AddonPicker({
  addon,
  dex,
  onPick,
}: {
  addon?: string;
  dex?: number;
  onPick: (addon: string | undefined, dex: number | undefined) => void;
}) {
  const current = otpAddons.find(([n]) => n === addon);
  return (
    <Shell img={dex ? <img src={artwork(dex)} alt="" className="h-24 w-24 max-w-none drop-shadow-[0_6px_6px_#0008]" /> : <span className="text-2xl text-mute">?</span>}>
      <SearchBox
        label="Qual addon?"
        placeholder={`Buscar entre ${otpAddons.length} addons (ou pelo Pokémon)`}
        items={otpAddons}
        match={([n, g, ps], t) => norm(n).includes(t) || norm(g).includes(t) || ps.some((id) => norm(dexName(id) ?? "").includes(t))}
        render={([n, g, ps]) => (
          <>
            <span className="flex -space-x-3">
              {ps.slice(0, 3).map((id) => (
                <img key={id} src={artwork(id)} alt="" className="h-9 w-9" loading="lazy" />
              ))}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{n}</span>
              <span className="block truncate text-[11px] text-mute">
                {g} · {ps.map((id) => dexName(id)).join(", ")}
              </span>
            </span>
          </>
        )}
        onPick={([n, , ps]) => onPick(n, ps[0])}
        selected={addon}
        onClear={() => onPick(undefined, undefined)}
      />
      {current && current[2].length > 1 && (
        <div className="mt-3">
          <div className="mb-1.5 text-xs font-semibold text-mute">Em qual Pokémon?</div>
          <div className="flex flex-wrap gap-1.5">
            {current[2].map((id) => (
              <button
                type="button"
                key={id}
                onClick={() => onPick(addon, id)}
                className={`flex items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2.5 text-xs font-semibold transition ${
                  dex === id ? "border-sell bg-sell/15" : "border-line hover:bg-panel-2"
                }`}
              >
                <img src={artwork(id)} alt="" className="h-7 w-7" loading="lazy" />
                {dexName(id)}
              </button>
            ))}
          </div>
        </div>
      )}
      {current && <p className="mt-2 text-xs text-mute">Sai em: {current[1]}</p>}
    </Shell>
  );
}
