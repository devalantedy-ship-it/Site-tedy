"use client";

// Peças de formulário no visual do site: campo com ícone, botões segmentados, interruptor e contador +/−.

import { Minus, Plus } from "lucide-react";

export function Field({
  label,
  hint,
  icon,
  right,
  children,
  className = "",
}: {
  label: string;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1.5 flex items-center justify-between gap-2">
        <span className="font-bold text-ink/90">{label}</span>
        {right}
      </span>
      <span className="relative block">
        {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute">{icon}</span>}
        <span className={icon ? "[&_.field]:pl-11" : ""}>{children}</span>
      </span>
      {hint && <span className="mt-1.5 block text-xs text-mute">{hint}</span>}
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = "md",
}: {
  value: T;
  options: { value: T; label: React.ReactNode }[];
  onChange: (v: T) => void;
  size?: "md" | "lg";
}) {
  return (
    <div className="flex gap-1 rounded-2xl border border-line bg-[#06182c]/70 p-1">
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl font-bold transition ${size === "lg" ? "px-4 py-3 text-sm" : "px-3 py-2 text-sm"} ${
            value === o.value ? "bg-sell text-white shadow-[0_3px_0_#8e2632]" : "text-mute hover:bg-white/5 hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
  icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
        checked ? "border-sell/50 bg-sell/10" : "border-line bg-[#06182c]/50 hover:bg-white/5"
      }`}
    >
      {icon && <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${checked ? "bg-sell/20 text-sell" : "bg-white/5 text-mute"}`}>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{label}</span>
        {hint && <span className="block text-xs text-mute">{hint}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-sell" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 9999,
  prefix,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  step?: number;
  min?: number;
  max?: number;
  prefix?: string;
  placeholder?: string;
}) {
  const n = Number(value) || 0;
  const set = (v: number) => onChange(String(Math.max(min, Math.min(max, v))));
  return (
    <div className="flex items-stretch overflow-hidden rounded-xl border border-line bg-[#06182c]/70 focus-within:border-volt">
      <button type="button" onClick={() => set(n - step)} className="px-3 text-mute hover:bg-white/5 hover:text-ink" aria-label="Diminuir">
        <Minus size={16} />
      </button>
      <div className="relative flex-1">
        {prefix && value !== "" && <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 font-pixel text-mute">{prefix}</span>}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 5))}
          inputMode="numeric"
          placeholder={placeholder}
          className={`w-full bg-transparent py-2.5 text-center font-pixel text-lg outline-none placeholder:text-mute/50 ${prefix ? "pl-3" : ""}`}
        />
      </div>
      <button type="button" onClick={() => set(n + step)} className="px-3 text-mute hover:bg-white/5 hover:text-ink" aria-label="Aumentar">
        <Plus size={16} />
      </button>
    </div>
  );
}

/** (11) 99999-9999 */
export function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
