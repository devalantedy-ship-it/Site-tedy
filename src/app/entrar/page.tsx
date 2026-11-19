"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Gamepad2, Handshake, MessageCircle, Phone, ShieldCheck, Star } from "lucide-react";
import { servers, type Server } from "@/lib/data";
import { useMarket } from "@/lib/store";
import { artwork } from "@/lib/poke";
import { Avatar, Stars } from "@/components/ui";
import { Field, Segmented, maskPhone } from "@/components/Form";

/* eslint-disable @next/next/no-img-element */

export default function Page() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}

function Login() {
  const { login, users } = useMarket();
  const router = useRouter();
  const volta = useSearchParams().get("volta") || "/";
  const [nick, setNick] = useState("");
  const [server, setServer] = useState<Server>("América do Sul");
  const [wa, setWa] = useState("");

  const valid = /^[A-Za-z0-9 _.-]{3,24}$/.test(nick.trim());
  const go = (n: string, s: Server, w?: string) => {
    login(n, s, w);
    router.push(volta.startsWith("/") ? volta : "/");
  };

  return (
    <div className="mx-auto max-w-5xl py-4">
      <div className="pop grid overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_40px_80px_-30px_#000] md:grid-cols-[1fr_1.1fr]">
        {/* painel de arte */}
        <div className="relative overflow-hidden bg-linear-to-br from-[#f37665] via-[#d9485a] to-[#8e2632] p-8 text-white sm:p-10">
          <div className="seigaiha pointer-events-none absolute inset-0 opacity-70" />
          <div className="relative">
            <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/80">PokeFeira</div>
            <h1 className="mt-2 font-pixel text-4xl leading-tight sm:text-5xl">Bem-vindo, treinador!</h1>
            <p className="mt-3 max-w-xs text-white/85">Entre com o nick do seu personagem e comece a negociar.</p>
            <ul className="mt-7 flex flex-col gap-3 text-sm font-semibold">
              {[
                { i: Handshake, t: "Propostas e contrapropostas" },
                { i: MessageCircle, t: "Chat no site ou WhatsApp" },
                { i: ShieldCheck, t: "Reputação com estrelas" },
              ].map(({ i: I, t }) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20">
                    <I size={18} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <img
            src={artwork(130, true)}
            alt=""
            className="float pointer-events-none relative -mb-16 ml-auto mt-4 w-56 drop-shadow-[0_20px_25px_#0006] sm:w-72 md:absolute md:-bottom-6 md:-right-10 md:mb-0 md:mt-0"
          />
          <img src={artwork(129)} alt="" className="float-2 pointer-events-none absolute bottom-24 left-6 hidden w-20 drop-shadow-[0_10px_15px_#0006] md:block" />
        </div>

        {/* formulário */}
        <form
          className="flex flex-col gap-5 bg-[#0a223c]/95 p-7 backdrop-blur-xl sm:p-10"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) go(nick.trim(), server, wa.replace(/\D/g, "") || undefined);
          }}
        >
          <div>
            <h2 className="font-pixel text-3xl">Entrar</h2>
            <p className="mt-1 text-sm text-mute">É esse nick que aparece nos seus anúncios.</p>
          </div>

          <Field
            label="Nick no jogo"
            icon={<Gamepad2 size={18} />}
            right={nick && <span className={`text-xs ${valid ? "text-ok" : "text-sell"}`}>{valid ? "✓ ok" : "3 a 24 letras/números"}</span>}
          >
            <input value={nick} onChange={(e) => setNick(e.target.value)} className="field h-12" placeholder="Ex.: AshDoKanto" maxLength={24} autoFocus />
          </Field>

          <div className="text-sm">
            <div className="mb-1.5 font-bold text-ink/90">Região</div>
            <Segmented size="lg" value={server} onChange={setServer} options={servers.map((s) => ({ value: s, label: s }))} />
          </div>

          <Field
            label="WhatsApp"
            right={<span className="text-xs text-mute">opcional</span>}
            icon={<Phone size={18} />}
            hint="Só aparece nos anúncios em que você ligar o botão do WhatsApp."
          >
            <input value={wa} onChange={(e) => setWa(maskPhone(e.target.value))} className="field h-12" placeholder="(11) 99999-9999" inputMode="tel" />
          </Field>

          <button disabled={!valid} className="btn btn-volt h-13 rounded-2xl text-base disabled:opacity-40">
            Entrar e negociar <ArrowRight size={18} />
          </button>

          <p className="rounded-xl border border-dashed border-line p-3 text-center text-xs text-mute">
            Protótipo: sem senha por enquanto. Na versão final, login com Discord ou e-mail.
          </p>
        </form>
      </div>

      {/* contas de exemplo */}
      <div className="mt-6 rounded-3xl glass p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="font-bold">Testar como outro jogador</div>
          <div className="text-xs text-mute">Pra ver os dois lados da negociação</div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {users.slice(0, 5).map((u) => (
            <button
              key={u.id}
              onClick={() => go(u.nick, u.server)}
              className="group flex items-center gap-3 rounded-2xl border border-line bg-[#06182c]/50 p-3 text-left transition hover:-translate-y-0.5 hover:border-sell/50"
            >
              <Avatar user={u} size={36} />
              <div className="min-w-0">
                <div className="truncate text-sm font-bold group-hover:text-sell">{u.nick}</div>
                <div className="flex items-center gap-1 text-[11px] text-mute">
                  {u.reviews ? (
                    <>
                      <Stars value={u.rating} size={10} /> {u.rating.toFixed(1)}
                    </>
                  ) : (
                    <>
                      <Star size={10} /> novo
                    </>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
