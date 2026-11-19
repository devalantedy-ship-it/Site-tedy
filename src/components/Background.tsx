"use client";

// Fundo do site: a arte do porto com os Pokémon (public/bg/porto.jpg), fixa, com um zoom bem lento.
// Por cima: Wingulls voando e um degradê pro azul do mar, pra leitura do conteúdo.

import { useEffect, useState } from "react";
import { pokeSprite } from "@/lib/poke";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const flyers = [
  { top: "8%", delay: 0, dur: 26, size: 72 },
  { top: "18%", delay: -9, dur: 34, size: 56 },
  { top: "4%", delay: -18, dur: 30, size: 48 },
];

export function Background() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const on = () => setY(window.scrollY);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0b2440]">
      <div
        className="absolute inset-0"
        style={{ transform: `translateY(${Math.min(y, 1200) * -0.08}px)` }}
      >
        <div
          className="kenburns absolute -inset-[4%] bg-cover bg-[center_60%]"
          style={{ backgroundImage: `url(${BASE}/bg/porto.jpg)` }}
        />
      </div>

      {/* Wingulls voando pelo céu */}
      {flyers.map((f, i) => (
        <img
          key={i}
          src={pokeSprite(278)}
          alt=""
          className="gull absolute [image-rendering:pixelated]"
          style={{ top: f.top, width: f.size, animationDelay: `${f.delay}s`, animationDuration: `${f.dur}s` }}
        />
      ))}

      {/* escurece pra baixo (mar fundo) e um pouco no topo pro header */}
      <div className="absolute inset-0 bg-linear-to-b from-[#0b2440]/35 via-[#0b2440]/10 to-[#0b2440]/90" />
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: "#0b2440", opacity: Math.min(0.72, y / 900) }}
      />
      <div className="paper absolute inset-0 opacity-[0.08] mix-blend-overlay" />
    </div>
  );
}
