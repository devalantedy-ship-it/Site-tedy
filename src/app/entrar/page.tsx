"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { servers, type Server } from "@/lib/data";
import { useMarket } from "@/lib/store";
import { Avatar } from "@/components/ui";

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
  const [server, setServer] = useState<Server>("Kanto");
  const [wa, setWa] = useState("");

  const go = (n: string, s: Server, w?: string) => {
    login(n, s, w);
    router.push(volta.startsWith("/") ? volta : "/");
  };

  return (
    <div className="mx-auto max-w-md py-6">
      <div className="rounded-3xl border border-line bg-panel p-7">
        <h1 className="font-pixel text-3xl">Entrar</h1>
        <p className="mt-1 text-sm text-mute">Use o nick do seu personagem. É ele que aparece nos anúncios.</p>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (nick.trim().length >= 3) go(nick.trim(), server, wa.replace(/\D/g, "") || undefined);
          }}
        >
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Nick no jogo</span>
            <input value={nick} onChange={(e) => setNick(e.target.value)} className="field" placeholder="Ex.: AshDoKanto" maxLength={24} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Servidor principal</span>
            <select value={server} onChange={(e) => setServer(e.target.value as Server)} className="field">
              {servers.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">
              WhatsApp <span className="font-normal text-mute">(opcional)</span>
            </span>
            <input value={wa} onChange={(e) => setWa(e.target.value)} className="field" placeholder="(11) 99999-9999" inputMode="tel" />
            <span className="mt-1 block text-xs text-mute">Só aparece nos anúncios em que você marcar “mostrar WhatsApp”.</span>
          </label>
          <button disabled={nick.trim().length < 3} className="btn btn-volt mt-2 disabled:opacity-40">
            <LogIn size={16} /> Entrar
          </button>
        </form>

        <p className="mt-5 rounded-xl border border-dashed border-line p-3 text-xs text-mute">
          Protótipo: aqui não tem senha. Na versão final o login será com Discord ou e-mail.
        </p>
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-panel p-5">
        <div className="text-sm font-bold">Testar como outro jogador</div>
        <p className="text-xs text-mute">Entre como um dos jogadores de exemplo pra ver os dois lados da negociação.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {users.slice(0, 5).map((u) => (
            <button key={u.id} onClick={() => go(u.nick, u.server)} className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-sm hover:border-volt/60">
              <Avatar user={u} size={24} /> {u.nick}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
