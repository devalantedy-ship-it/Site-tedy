"use client";

import Link from "next/link";
import { site } from "@/lib/data";
import { useMarket } from "@/lib/store";

export function Footer() {
  const { resetDemo } = useMarket();
  return (
    <footer className="border-t border-line/70 py-8 text-sm text-mute">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-pixel text-ink">{site.name}</div>
          <p className="mt-1 max-w-md text-xs">
            Site feito por fãs, sem ligação com os criadores do jogo. As negociações são entre jogadores: confira a reputação antes de
            fechar.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/como-funciona" className="hover:text-ink">Como funciona</Link>
          <Link href="/como-funciona#seguranca" className="hover:text-ink">Dicas de segurança</Link>
          <button onClick={resetDemo} className="rounded-md border border-dashed border-line px-2 py-1 text-xs hover:text-ink" title="Só no protótipo">
            Resetar dados de exemplo
          </button>
        </div>
      </div>
    </footer>
  );
}
