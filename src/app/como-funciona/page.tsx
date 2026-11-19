import Link from "next/link";

export const metadata = { title: "Como funciona" };

const steps = [
  ["Entre com seu nick", "Seu nick do jogo vira seu nome no site. A reputação fica presa a ele."],
  ["Anuncie ou peça", "Vendendo? Crie um anúncio com preço em R$ ou KK. Procurando algo? Crie um pedido de compra e espere os vendedores chamarem."],
  ["Negocie", "Converse no chat e mande propostas. O outro lado aceita, recusa ou faz contraproposta. Se o vendedor liberar, dá pra chamar no WhatsApp."],
  ["Feche e avalie", "Depois da entrega, o dono do anúncio marca como concluído e vocês se avaliam."],
];

const tips = [
  "Olhe as estrelas e o número de negócios antes de pagar.",
  "Em valor alto, divida: entrega parte, paga parte.",
  "Combine tudo pelo chat do site. Ele fica guardado se der problema.",
  "Ninguém da equipe pede sua senha. Desconfie de links estranhos.",
  "Desconfie de preço muito abaixo do normal.",
];

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-pixel text-4xl">Como funciona</h1>
      <ol className="mt-8 flex flex-col gap-4">
        {steps.map(([t, d], i) => (
          <li key={t} className="flex gap-4 rounded-2xl border border-line bg-panel p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-volt font-pixel text-xl text-bg">{i + 1}</span>
            <div>
              <h2 className="font-bold">{t}</h2>
              <p className="mt-1 text-sm text-mute">{d}</p>
            </div>
          </li>
        ))}
      </ol>
      <h2 id="seguranca" className="mt-12 scroll-mt-24 font-pixel text-2xl">Dicas de segurança</h2>
      <ul className="mt-4 flex flex-col gap-2">
        {tips.map((t) => (
          <li key={t} className="rounded-xl border border-line bg-panel px-4 py-3 text-sm">{t}</li>
        ))}
      </ul>
      <div className="mt-10 flex gap-2">
        <Link href="/anunciar" className="btn btn-volt">Criar anúncio</Link>
        <Link href="/anuncios" className="btn btn-ghost">Ver anúncios</Link>
      </div>
    </div>
  );
}
