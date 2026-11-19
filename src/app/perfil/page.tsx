"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMarket } from "@/lib/store";
import { Avatar, ListingCard, Stars, timeAgo } from "@/components/ui";

export default function Page() {
  return (
    <Suspense>
      <ProfilePage />
    </Suspense>
  );
}

function ProfilePage() {
  const id = useSearchParams().get("id") ?? "";
  const m = useMarket();
  const u = m.userById(id);
  if (!m.ready) return null;
  if (!u) return <div className="py-20 text-center text-mute">Jogador não encontrado.</div>;

  const ads = m.listings.filter((l) => l.userId === u.id);
  const reviews = m.reviews.filter((r) => r.toUserId === u.id);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5 rounded-3xl glass p-6 sm:flex-row sm:items-center">
        <Avatar user={u} size={80} />
        <div className="flex-1">
          <h1 className="font-pixel text-3xl">{u.nick}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-mute">
            {u.reviews ? (
              <>
                <Stars value={u.rating} /> {u.rating.toFixed(1)} · {u.reviews} avaliações
              </>
            ) : (
              "Sem avaliações ainda"
            )}
            <span>· Servidor {u.server}</span>
            <span>· No site {timeAgo(u.since).replace("há", "há")}</span>
          </div>
          {u.bio && <p className="mt-3 text-sm">{u.bio}</p>}
        </div>
        <div className="rounded-2xl bg-panel-2 px-6 py-4 text-center">
          <div className="font-pixel text-3xl text-volt">{u.deals}</div>
          <div className="text-xs text-mute">negócios fechados</div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-pixel text-xl">Anúncios ({ads.length})</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ads.map((l) => (
            <ListingCard key={l.id} l={l} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-pixel text-xl">Avaliações</h2>
        {reviews.length === 0 && <p className="text-sm text-mute">Nenhuma avaliação escrita ainda.</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {reviews.map((r) => {
            const from = m.userById(r.fromUserId);
            return (
              <div key={r.id} className="rounded-2xl glass p-4">
                <div className="flex items-center gap-2">
                  <Avatar user={from} size={28} />
                  <span className="text-sm font-semibold">{from?.nick}</span>
                  <span className="ml-auto text-xs text-mute">{timeAgo(r.at)}</span>
                </div>
                <div className="mt-2"><Stars value={r.stars} /></div>
                {r.text && <p className="mt-1 text-sm">{r.text}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
