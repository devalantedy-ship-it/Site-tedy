"use client";

// Aparece suave quando entra na tela (sobe + fade). Se a animação travar por qualquer motivo
// (aba escondida, "reduzir animações" do Windows), em 1,5 s o conteúdo fica visível de qualquer jeito.

import { useEffect, useRef, useState } from "react";

export function Reveal({
  children,
  delay = 0,
  className = "",
  from = "up",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  from?: "up" | "left" | "right" | "zoom";
  as?: "div" | "section" | "li";
}) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"idle" | "in" | "done">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setState("in");
        setTimeout(() => setState("done"), 1500 + delay);
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <Tag
      ref={ref as never}
      data-reveal={from}
      data-state={state}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${className}`}
    >
      {children}
    </Tag>
  );
}
