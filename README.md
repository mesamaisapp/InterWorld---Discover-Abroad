# Comparador de Intercâmbio (MVP)

"Skyscanner para intercâmbio": compara pacotes de cursos de idioma (escola, destino, duração, agência) lado a lado.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (PostgreSQL)

## Rodando

```bash
npm install
npm run dev          # http://localhost:3000
```

Sem `.env.local` o app usa os dados de exemplo de `src/lib/dados-exemplo.ts`. Para usar o Supabase:

1. Rode `supabase/migrations/0001_schema_inicial.sql` e depois `supabase/seed.sql` no SQL Editor (ou `supabase db push`).
2. `cp .env.example .env.local` e preencha a URL e a anon key do projeto.

## Arquitetura

```
src/
├── app/
│   ├── layout.tsx                 # HTML raiz, fonte, metadata
│   ├── page.tsx                   # Busca (Server Component): lê searchParams → consulta → renderiza
│   ├── loading.tsx / error.tsx    # Esqueleto de streaming e fallback de erro
│   ├── globals.css                # Tailwind v4 + tokens de cor (@theme), modo escuro
│   └── api/oferta/[id]/route.ts   # "Ver Oferta": registra o clique e redireciona ao link de afiliado
├── components/busca/
│   ├── ContextoBusca.tsx          # (client) filtros ↔ URL, useOptimistic, estado de carregamento
│   ├── BarraFiltros.tsx           # (client) sidebar no desktop / gaveta no mobile
│   ├── SeletorOrdenacao.tsx       # (client)
│   ├── GridResultados.tsx         # (server) grid + estado vazio + selo "Menor preço"
│   └── CardPacote.tsx             # (server) card do pacote
├── lib/
│   ├── catalogo.ts                # Camada de dados (única que fala com o banco) — server-only
│   ├── filtros.ts                 # searchParams ⇄ FiltrosBusca (validação)
│   ├── formatar.ts                # Moeda / semanas
│   ├── dados-exemplo.ts           # Fallback sem Supabase
│   └── supabase/servidor.ts       # Cliente Supabase do servidor
└── types/catalogo.ts              # Tipos de domínio
supabase/
├── migrations/0001_schema_inicial.sql
└── seed.sql
```

### Decisões

- **A URL é o estado dos filtros.** `?destino=malta&tipo=geral,intensivo&orcamento=2000` — buscas compartilháveis e indexáveis.
  Os componentes de cliente só fazem `router.replace`; a consulta roda no servidor e só HTML/RSC chega ao navegador.
- **View `pacotes_busca`** achata pacote + escola + país + agência e já calcula o preço por semana,
  para filtrar por destino e ordenar com um único `select` (com `security_invoker`, respeitando o RLS).
- **RLS**: leitura pública do catálogo; escrita só com a `service_role` (painel admin/importador de cotações).
- **Cliques de afiliado** passam por `/api/oferta/[id]` e vão para `cliques_oferta` (gravados com `after()`, sem atrasar o redirect).

### Próximos passos sugeridos

Página de detalhe da escola (todas as cotações dela), conversão EUR → BRL com câmbio do dia,
painel admin para as agências subirem cotações, e paginação/infinite scroll quando o catálogo crescer.
