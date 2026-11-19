"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Plus } from "lucide-react";
import { useMarket } from "@/lib/store";
import { Avatar, ListingCard, Stars } from "@/components/ui";

export default function MyAccount() {
  const m = useMarket();
  const router = useRouter();
  const [tab, setTab] = useState<"ativos" | "concluidos">("ativos");
  const [wa, setWa] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (m.ready && !m.me) router.replace("/entrar?volta=/minha-conta");
    if (m.me) {
      setWa(m.me.whatsapp ?? "");
      setBio(m.me.bio ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.ready, m.me?.id]);

  if (!m.me) return null;
  const mine = m.listings.filter((l) => l.userId === m.me!.id);
  const shown = mine.filter((l) => (tab === "ativos" ? l.status !== "concluido" : l.status === "concluido"));

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="flex flex-col gap-4 self-start rounded-3xl border border-line bg-panel p-5">
        <div className="flex items-center gap-3">
          <Avatar user={m.me} size={56} />
          <div>
            <div className="font-pixel text-xl">{m.me.nick}</div>
            <div className="flex items-center gap-1 text-xs text-mute">
              {m.me.reviews ? <><Stars value={m.me.rating} size={12} /> {m.me.reviews}</> : "Sem avaliações"}
            </div>
          </div>
        </div>
        <Link href={`/perfil/${m.me.id}`} className="text-xs text-volt underline">Ver meu perfil público</Link>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            m.updateMe({ whatsapp: wa.replace(/\D/g, "") || undefined, bio: bio.trim() || undefined });
            setSaved(true);
            setTimeout(() => setSaved(false), 1800);
          }}
        >
          <label className="text-sm">
            <span className="mb-1 block font-semibold">WhatsApp</span>
            <input value={wa} onChange={(e) => setWa(e.target.value)} className="field" placeholder="Com DDD" inputMode="tel" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Sobre você</span>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="field resize-none" maxLength={160} />
          </label>
          <button className="btn btn-ghost">{saved ? "Salvo!" : "Salvar"}</button>
        </form>
        <button
          onClick={() => {
            m.logout();
            router.push("/");
          }}
          className="flex items-center gap-2 text-sm text-mute hover:text-ink"
        >
          <LogOut size={16} /> Sair
        </button>
      </aside>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-pixel text-3xl">Meus anúncios</h1>
          <Link href="/anunciar" className="btn btn-volt"><Plus size={16} /> Novo anúncio</Link>
        </div>
        <div className="mt-4 flex gap-2">
          {(["ativos", "concluidos"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full border px-4 py-1.5 text-sm ${tab === t ? "border-volt bg-volt/15 text-volt" : "border-line text-mute"}`}
            >
              {t === "ativos" ? "Ativos" : "Concluídos"} ({mine.filter((l) => (t === "ativos" ? l.status !== "concluido" : l.status === "concluido")).length})
            </button>
          ))}
        </div>
        {shown.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {shown.map((l) => <ListingCard key={l.id} l={l} />)}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-mute">Nada por aqui.</div>
        )}
      </section>
    </div>
  );
}
