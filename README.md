# Site-tedy

Protótipo de mercado entre jogadores de Poketibia (estilo OLX): anúncios de venda, pedidos de compra, chat com propostas, botão de WhatsApp opcional e reputação.

- Next 16 + Tailwind 4. Por enquanto os dados ficam no navegador (localStorage), com exemplos em `src/lib/data.ts`.
- Nome do site, servidores e categorias: `src/lib/data.ts`.
- Próximo passo: login real (Discord/e-mail) e banco no Supabase.

```bash
npm install
npm run dev
```

## Catálogo do otPokémon
`src/lib/otp-catalog.ts` tem a Pokédex do jogo (849, com quais têm shiny), 86 itens e 376 addons com os Pokémon compatíveis.
Os nomes vieram da wiki oficial (wiki.otponline.com); os ícones são do PokeAPI. Pra atualizar: `node scripts/build-catalog.js` (veja o topo do script).
