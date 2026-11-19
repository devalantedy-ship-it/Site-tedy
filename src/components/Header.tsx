"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, MessageCircle, Plus, UserRound, X } from "lucide-react";
import { site } from "@/lib/data";
import { useMarket, useUnread } from "@/lib/store";
import { Avatar } from "./ui";
import { Sprite } from "./Sprite";

const nav = [
  { href: "/anuncios?tipo=venda", label: "Comprar" },
  { href: "/anuncios?tipo=compra", label: "Pedidos de compra" },
  { href: "/como-funciona", label: "Como funciona" },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="pixel-corners grid h-10 w-10 place-items-center bg-volt/15 shadow-[inset_0_0_0_1px_#ffd23f55]">
        <Sprite id="pokemon" size={30} className="bob" />
      </span>
      <span className="font-pixel text-2xl leading-none tracking-wide">
        Poke<span className="text-shine">Feira</span>
      </span>
    </Link>
  );
}

export function Header() {
  const { me, logout, ready } = useMarket();
  const unread = useUnread();
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-bg/55 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Logo />
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-sm text-mute hover:bg-white/5 hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {ready && me ? (
            <>
              <Link href="/mensagens" className="relative rounded-lg p-2 text-mute hover:bg-white/5 hover:text-ink" aria-label="Mensagens">
                <MessageCircle size={20} />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-sell px-1 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </Link>
              <Link href="/minha-conta" className="hidden items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5 sm:flex">
                <Avatar user={me} size={28} />
                <span className="max-w-28 truncate text-sm font-semibold">{me.nick}</span>
              </Link>
            </>
          ) : (
            ready && (
              <Link href={`/entrar?volta=${encodeURIComponent(path)}`} className="btn btn-ghost hidden sm:inline-flex">
                <UserRound size={16} /> Entrar
              </Link>
            )
          )}
          <Link href="/anunciar" className="btn btn-volt">
            <Plus size={16} /> <span className="hidden sm:inline">Anunciar</span>
          </Link>
          <button className="rounded-lg p-2 text-mute hover:bg-white/5 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-line bg-bg px-4 py-3 md:hidden" onClick={() => setOpen(false)}>
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="block rounded-lg px-3 py-2.5 text-mute hover:bg-white/5">
              {n.label}
            </Link>
          ))}
          {me ? (
            <>
              <Link href="/minha-conta" className="block rounded-lg px-3 py-2.5 text-mute hover:bg-white/5">
                Minha conta ({me.nick})
              </Link>
              <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-mute hover:bg-white/5">
                <LogOut size={16} /> Sair
              </button>
            </>
          ) : (
            <Link href="/entrar" className="block rounded-lg px-3 py-2.5 text-mute hover:bg-white/5">
              Entrar
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
