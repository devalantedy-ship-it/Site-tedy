"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, MessageCircle, Plus, UserRound, X } from "lucide-react";
import { useMarket, useUnread } from "@/lib/store";
import { artwork } from "@/lib/poke";
import { Avatar } from "./ui";

const nav = [
  { href: "/anuncios?tipo=venda", label: "Comprar" },
  { href: "/anuncios?tipo=compra", label: "Procura-se" },
  { href: "/como-funciona", label: "Como funciona" },
];

export function Logo({ small }: { small?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="seigaiha grid h-10 w-10 shrink-0 place-items-center rounded-full bg-linear-to-b from-[#1d4d78] to-[#0d2c4c] shadow-[inset_0_0_0_2px_rgb(251_233_214/0.3)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={artwork(129)} alt="" className="h-11 w-11 max-w-none -rotate-12 drop-shadow-[0_3px_3px_#0008]" />
      </span>
      <span className={`font-pixel leading-none tracking-wide ${small ? "text-lg" : "text-xl"}`}>
        Poke<span className="text-sell">Feira</span>
      </span>
    </Link>
  );
}

/** Menu em pílula flutuando no topo; fica mais sólido quando rola a página. */
export function Header() {
  const { me, logout, ready } = useMarket();
  const unread = useUnread();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => setOpen(false), [path]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3">
      <div
        className={`pointer-events-auto w-full max-w-5xl border border-white/15 px-2 py-1.5 shadow-[0_10px_40px_-10px_#000a] backdrop-blur-xl transition-all duration-300 ${
          scrolled ? "bg-[#0b2440]/85" : "bg-[#0b2440]/45"
        } ${open ? "rounded-3xl" : "rounded-full"}`}
      >
        <div className="flex items-center gap-2 pl-1">
          <Logo small={scrolled} />
          <nav className="ml-4 hidden items-center gap-0.5 md:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-full px-3.5 py-2 text-sm font-semibold text-ink/80 transition hover:bg-white/10 hover:text-ink">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            {ready && me ? (
              <>
                <Link href="/mensagens" className="relative rounded-full p-2.5 text-ink/80 hover:bg-white/10" aria-label="Mensagens">
                  <MessageCircle size={19} />
                  {unread > 0 && (
                    <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-sell px-1 text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </Link>
                <Link href="/minha-conta" className="hidden items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-white/10 sm:flex">
                  <Avatar user={me} size={28} />
                  <span className="max-w-28 truncate text-sm font-semibold">{me.nick}</span>
                </Link>
              </>
            ) : (
              ready && (
                <Link
                  href={`/entrar?volta=${encodeURIComponent(path)}`}
                  className="hidden items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-ink/80 hover:bg-white/10 sm:flex"
                >
                  <UserRound size={16} /> Entrar
                </Link>
              )
            )}
            <Link href="/anunciar" className="btn btn-volt rounded-full px-4 py-2">
              <Plus size={16} /> <span className="hidden sm:inline">Anunciar</span>
            </Link>
            <button className="rounded-full p-2.5 text-ink/80 hover:bg-white/10 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="pop mt-2 border-t border-white/10 px-2 pb-2 pt-2 md:hidden">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="block rounded-xl px-3 py-3 font-semibold text-ink/85 hover:bg-white/10">
                {n.label}
              </Link>
            ))}
            {me ? (
              <>
                <Link href="/minha-conta" className="block rounded-xl px-3 py-3 font-semibold text-ink/85 hover:bg-white/10">
                  Minha conta ({me.nick})
                </Link>
                <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left font-semibold text-ink/85 hover:bg-white/10">
                  <LogOut size={16} /> Sair
                </button>
              </>
            ) : (
              <Link href="/entrar" className="block rounded-xl px-3 py-3 font-semibold text-ink/85 hover:bg-white/10">
                Entrar
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
