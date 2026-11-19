"use client";

// Fundo do site: a arte do Gyarados na onda (public/bg/gyarados-onda.jpg), fixa, com um zoom bem lento.
// Por cima: Magikarps pulando de vez em quando e um degradê pro azul do mar, pra leitura do conteúdo.

import { useEffect, useState } from "react";
import { pokeSprite } from "@/lib/poke";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const jumps = [
  { left: "12%", bottom: "18%", delay: 0, dur: 7, shiny: false },
  { left: "68%", bottom: "24%", delay: 2.6, dur: 8, shiny: true },
  { left: "40%", bottom: "12%", delay: 5.1, dur: 9, shiny: false },
  { left: "86%", bottom: "14%", delay: 3.8, dur: 7.5, shiny: false },
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
          className="kenburns absolute -inset-[4%] bg-cover bg-[center_35%]"
          style={{ backgroundImage: `url(${BASE}/bg/gyarados-onda.jpg)` }}
        />
      </div>

      {/* Magikarps pulando */}
      {jumps.map((j, i) => (
        <img
          key={i}
          src={pokeSprite(129, { shiny: j.shiny })}
          alt=""
          className="karp absolute w-14 [image-rendering:pixelated]"
          style={{ left: j.left, bottom: j.bottom, animationDelay: `${j.delay}s`, animationDuration: `${j.dur}s` }}
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
