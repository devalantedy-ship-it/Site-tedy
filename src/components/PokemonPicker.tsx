"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { artwork, pokemonNames, prettyName } from "@/lib/poke";

/** Busca de Pokémon pelo nome (lista do PokeAPI). Escolher define o nº da Pokédex do anúncio. */
export function PokemonPicker({
  dex,
  shiny,
  onPick,
}: {
  dex?: number;
  shiny: boolean;
  onPick: (dex: number, name: string) => void;
}) {
  const [names, setNames] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    pokemonNames().then(setNames);
  }, []);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase().replace(/\s+/g, "-");
    if (!t) return [];
    const n = Number(t);
    return names
      .map((name, i) => ({ name, dex: i + 1 }))
      .filter((p) => (n ? p.dex === n : p.name.includes(t)))
      .sort((a, b) => Number(!a.name.startsWith(t)) - Number(!b.name.startsWith(t)))
      .slice(0, 8);
  }, [q, names]);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-panel-2/60 p-3">
      <div className="seigaiha grid h-20 w-20 shrink-0 place-items-center rounded-full bg-linear-to-b from-[#1d4d78] to-[#0d2c4c]">
        {dex ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artwork(dex, shiny)} alt="" className="h-24 w-24 max-w-none drop-shadow-[0_6px_6px_#0008]" />
        ) : (
          <span className="text-2xl text-mute">?</span>
        )}
      </div>
      <div className="relative flex-1">
        <span className="mb-1 block text-sm font-semibold">Qual Pokémon?</span>
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
            placeholder={names.length ? "Digite o nome ou o nº (ex.: gyarados)" : "Carregando Pokédex..."}
          />
        </div>
        {open && results.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-line bg-[#0d2c4c] p-1 shadow-2xl">
            {results.map((p) => (
              <li key={p.dex}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onPick(p.dex, prettyName(p.name));
                    setQ(prettyName(p.name));
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-panel-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={artwork(p.dex)} alt="" className="h-9 w-9" loading="lazy" />
                  <span className="font-semibold">{prettyName(p.name)}</span>
                  <span className="ml-auto text-xs text-mute">#{String(p.dex).padStart(3, "0")}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
