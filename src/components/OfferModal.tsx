"use client";

import { useState } from "react";
import type { Currency } from "@/lib/data";

export function OfferModal({
  defaultCurrency,
  suggested,
  onClose,
  onSend,
}: {
  defaultCurrency: Currency;
  suggested: number;
  onClose: () => void;
  onSend: (price: number, cur: Currency, text: string) => void;
}) {
  const [price, setPrice] = useState(String(suggested));
  const [cur, setCur] = useState<Currency>(defaultCurrency);
  const [text, setText] = useState("");
  const n = Number(price.replace(",", "."));
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (n > 0) onSend(n, cur, text.trim());
        }}
        className="rise w-full max-w-sm rounded-3xl border border-line bg-panel p-6"
      >
        <h3 className="font-pixel text-2xl">Fazer proposta</h3>
        <p className="mt-1 text-sm text-mute">O outro jogador pode aceitar, recusar ou responder no chat.</p>
        <div className="mt-5 flex gap-2">
          <input autoFocus value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className="field text-lg font-bold" />
          <select value={cur} onChange={(e) => setCur(e.target.value as Currency)} className="field w-24">
            <option>R$</option>
            <option>KK</option>
          </select>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="field mt-3 resize-none"
          placeholder="Mensagem (opcional)"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancelar
          </button>
          <button disabled={!(n > 0)} className="btn btn-volt disabled:opacity-40">
            Enviar proposta
          </button>
        </div>
      </form>
    </div>
  );
}
