"use client";

// Fundo animado do site inteiro: céu com estrelas em pixel piscando, partículas subindo,
// e uma grade neon em perspectiva andando no "chão" (estilo arcade).
// Desenha num canvas em baixa resolução e estica (pixelado de propósito, e leve).

import { useEffect, useRef } from "react";

const SCALE = 3; // 1 pixel do canvas = 3 pixels na tela

export function Background() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, last = 0, t = 0;

    type Star = { x: number; y: number; p: number; s: number; c: string };
    type Spark = { x: number; y: number; v: number; life: number; c: string };
    let stars: Star[] = [];
    let sparks: Spark[] = [];
    const starColors = ["#ffffff", "#ffd23f", "#7ce8ff", "#ff7ab6"];
    const sparkColors = ["#ffd23f", "#38d6c4", "#ff5d8f", "#a98bff"];

    const resize = () => {
      w = Math.ceil(window.innerWidth / SCALE);
      h = Math.ceil(window.innerHeight / SCALE);
      cv.width = w;
      cv.height = h;
      stars = Array.from({ length: Math.round((w * h) / 380) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.62,
        p: Math.random() * Math.PI * 2,
        s: 0.6 + Math.random() * 2,
        c: starColors[Math.random() < 0.8 ? 0 : 1 + Math.floor(Math.random() * 3)],
      }));
    };

    const draw = (dt: number) => {
      t += dt;
      ctx.clearRect(0, 0, w, h);

      // estrelas piscando
      for (const s of stars) {
        const a = 0.25 + 0.75 * Math.abs(Math.sin(s.p + t * s.s));
        ctx.globalAlpha = a;
        ctx.fillStyle = s.c;
        ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
        if (a > 0.92 && s.c !== "#ffffff") {
          ctx.globalAlpha = a * 0.5;
          ctx.fillRect(Math.round(s.x) - 1, Math.round(s.y), 3, 1);
          ctx.fillRect(Math.round(s.x), Math.round(s.y) - 1, 1, 3);
        }
      }

      // grade em perspectiva no chão
      const horizon = Math.round(h * 0.66);
      const grd = ctx.createLinearGradient(0, horizon - 30, 0, horizon + 4);
      grd.addColorStop(0, "rgba(255,93,143,0)");
      grd.addColorStop(1, "rgba(255,93,143,0.22)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = grd;
      ctx.fillRect(0, horizon - 30, w, 34);

      ctx.fillStyle = "#ff5d8f";
      // linhas horizontais vindo pra frente
      const speed = (t * 0.35) % 1;
      for (let i = 0; i < 16; i++) {
        const z = (i + speed) / 16; // 0 = horizonte, 1 = perto
        const y = horizon + Math.round(Math.pow(z, 2.2) * (h - horizon));
        ctx.globalAlpha = 0.08 + z * 0.4;
        ctx.fillRect(0, y, w, 1);
      }
      // linhas verticais saindo do ponto de fuga
      const cx = w / 2;
      for (let i = -22; i <= 22; i++) {
        const xb = cx + i * (w / 14);
        ctx.globalAlpha = 0.22;
        const steps = h - horizon;
        for (let k = 0; k < steps; k += 1) {
          const f = k / steps;
          const x = cx + (xb - cx) * f;
          if (x >= 0 && x < w) ctx.fillRect(Math.round(x), horizon + k, 1, 1);
        }
      }
      // escurece perto do horizonte pra grade "sumir" na distância
      const fade = ctx.createLinearGradient(0, horizon, 0, horizon + (h - horizon) * 0.45);
      fade.addColorStop(0, "rgba(7,9,20,0.9)");
      fade.addColorStop(1, "rgba(7,9,20,0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = fade;
      ctx.fillRect(0, horizon, w, h - horizon);

      // partículas subindo
      if (sparks.length < 60 && Math.random() < 0.5) {
        sparks.push({ x: Math.random() * w, y: h + 2, v: 6 + Math.random() * 16, life: 1, c: sparkColors[Math.floor(Math.random() * 4)] });
      }
      sparks = sparks.filter((p) => p.y > -4 && p.life > 0);
      for (const p of sparks) {
        p.y -= p.v * dt;
        p.x += Math.sin((p.y + t * 20) / 14) * 0.15;
        p.life -= dt * 0.08;
        ctx.globalAlpha = Math.max(0, p.life) * 0.9;
        ctx.fillStyle = p.c;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 2);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      draw(dt);
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    if (reduce) draw(0);
    else raf = requestAnimationFrame(loop);

    const vis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="aurora absolute inset-0" />
      <canvas ref={ref} className="absolute inset-0 h-full w-full [image-rendering:pixelated]" />
      <div className="scanlines absolute inset-0" />
    </div>
  );
}
