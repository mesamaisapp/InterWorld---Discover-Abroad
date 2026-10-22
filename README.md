# InterWorld — discover abroad

"Skyscanner para intercâmbio": compara pacotes de cursos de idioma (escola, destino, duração, agência) lado a lado.

- **`/`** — página inicial: a busca é um cartão de embarque (escolher a cidade troca a foto, o código do aeroporto
  e a contagem de pacotes ao vivo), destinos com preço "a partir de", "mesmo curso, preço diferente", itinerário e dúvidas.
- **`/busca`** — resultados: cada curso é um bilhete com a agência mais barata no canhoto e as outras agências embaixo.
  Links antigos `/?destino=...` redirecionam para cá.
- **`/guia`** — guia do primeiro intercâmbio: objetivos, países (entrada, trabalho e fonte oficial), calculadora do custo
  total (o curso vem do catálogo), linha do tempo, checklist de documentos (salvo no navegador), perguntas para escola e
  agência, ciladas e primeiras semanas. Conteúdo em `src/lib/guia.ts`; regras de visto mudam, revise com frequência.

Identidade: cores da logo (marinho `#0b2551`, azul `#1565c0`, verde `#5cb746`), Montserrat (títulos) e Public Sans (texto),
via `@fontsource-variable`. A logo está redesenhada em SVG em `src/components/marca/Logo.tsx`.
Fotos das cidades: Wikimedia Commons, servidas pelo próprio Commons (`src/lib/destinos.ts`), créditos no rodapé.

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
│   ├── page.tsx                   # Página inicial (cartão de embarque, destinos, economia)
│   ├── busca/page.tsx             # Busca (Server Component): lê searchParams → consulta → renderiza
│   ├── busca/loading.tsx          # Esqueleto de streaming
│   ├── guia/page.tsx              # Guia do primeiro intercâmbio
│   ├── kit/page.tsx               # Kit do intercambista (links de afiliado)
│   ├── intercambio/[cidade]/      # Página de cada cidade (anúncio e Google)
│   ├── admin/metricas/            # Funil, canais e cliques do kit
│   ├── cotacao/                   # Pedido de cotação e página do aluno (/cotacao/[token])
│   ├── responder/[token]/         # Página da agência para responder
│   ├── admin/cotacoes/            # Painel de revisão (ADMIN_SENHA)
│   ├── error.tsx                  # Fallback de erro
│   ├── globals.css                # Tailwind v4 + tokens de cor (@theme), modo escuro
│   └── api/oferta/[id]/route.ts   # "Ver Oferta": registra o clique e redireciona ao link de afiliado
├── components/busca/
│   ├── ContextoBusca.tsx          # (client) filtros ↔ URL, useOptimistic, estado de carregamento
│   ├── BarraFiltros.tsx           # (client) sidebar no desktop / gaveta no mobile
│   ├── SeletorOrdenacao.tsx       # (client)
│   ├── GridResultados.tsx         # (server) grid + estado vazio + selo "Menor preço"
│   └── CardPacote.tsx             # (server) card do pacote
├── components/inicio/            # Seções da página inicial
├── components/comum/             # Cabeçalho, rodapé, foto da cidade, número animado
├── lib/
│   ├── destinos.ts                # Cidades: foto, código do aeroporto, frase (conteúdo editorial)
│   ├── resumo.ts                  # "A partir de" por cidade e agrupamento do mesmo curso entre agências
│   ├── cotacoes/                  # Triagem, distribuição, e-mail, repositório (Supabase ou memória)
│   ├── mercados.ts                # Países de origem: idioma, moeda, DDI
│   ├── metricas/                  # Origem da visita, eventos e contas do funil
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

## Coletor de preços (`coletor/`)

Um robô que roda todo dia pelo GitHub Actions (`.github/workflows/coletor.yml`) e preenche o catálogo sozinho:

1. Lê cada URL da tabela `fontes` (página ou PDF de preços de uma escola ou agência), respeitando o `robots.txt`.
   Numa página HTML, segue até 2 PDFs de preço linkados nela.
2. Se o conteúdo não mudou desde a última leitura (até 7 dias), só renova a data dos preços, sem chamar a IA.
3. O Claude (`claude-opus-5-5`, troque com `COLETOR_MODELO`) extrai escola, cidade, curso, semanas, preço com as taxas
   obrigatórias, moeda e acomodação, numa estrutura JSON garantida pela API.
4. Cada oferta é conferida (`coletor/validar.ts`): país do catálogo, semanas inteiras, preço por semana entre €40 e €1.500
   depois da conversão pelo câmbio do BCE. O que não passa é descartado e registrado.
5. Grava no Supabase com `origem = 'coletado'`, a data (`visto_em`) e o trecho da fonte (`evidencia`). Preço que sumiu da
   fonte sai do ar. Tabela oficial de escola vira a oferta "Escola (direto na escola)", para comparar com as agências.

### Ativar

1. Rode `supabase/migrations/0002_coletor.sql` no Supabase.
2. Em GitHub → Settings → Secrets and variables → Actions, cadastre `ANTHROPIC_API_KEY`, `SUPABASE_URL` e
   `SUPABASE_SERVICE_ROLE_KEY` (nunca no navegador: nada de `NEXT_PUBLIC_` nela). Opcional: a variável
   `COLETOR_CONTATO` (e-mail que aparece no User-Agent do robô).
3. Revise `coletor/fontes-iniciais.json` e importe: `npm run coletor -- --importar-fontes` (com as variáveis acima no ambiente).
4. Em Actions → "Coletor de preços" → Run workflow, rode a primeira vez e confira o log e a tabela `coletas`.

Para testar uma URL sem gravar nada: `npm run coletor -- --url <endereço> --seco` (precisa só da `ANTHROPIC_API_KEY`).
Testes das regras de conferência: `npm test`.

## Cotações (`/cotacao`)

O aluno pede uma cotação e até 3 agências parceiras respondem com preço e o que está incluso. O aluno compara tudo numa
página só dele.

1. **Pedido**: `/cotacao` (ou "Receber cotações" num bilhete da busca, que já chega preenchido). O pedido ganha uma
   nota de triagem de 0 a 100 (`src/lib/cotacoes/triagem.ts`: WhatsApp válido, data de início, link nas observações…)
   e fica `aguardando_revisao`. O aluno recebe o link secreto `/cotacao/{token}` para acompanhar.
2. **Revisão**: em `/admin/cotacoes` você vê os pedidos pela nota e clica em "Aprovar e enviar" ou "Recusar".
   Com `REVISAO_MANUAL=false`, pedidos com nota 70 ou mais vão direto, e só os outros esperam por você.
3. **Distribuição**: as 3 agências com `recebe_cotacoes = true` que atendem o mercado do aluno e o país de destino
   (`destinos` vazio = todos), em rodízio (quem recebeu há mais tempo vem primeiro). Cada uma recebe um e-mail com o
   link `/responder/{token}`, só com o primeiro nome e o resumo do pedido.
4. **Resposta**: a agência informa moeda, preço total, o que inclui, validade e WhatsApp. O contato completo do aluno
   só aparece depois que ela responde. O aluno recebe um e-mail na primeira proposta (se deixou e-mail).
5. **Comparação**: na página do aluno, as propostas vêm ordenadas por preço, com o selo "Menor preço", quanto ele
   economiza e um botão de WhatsApp para cada agência. O admin mostra quantos pedidos cada agência recebeu e respondeu
   no mês (base para cobrar por lead).

Sem `SUPABASE_SERVICE_ROLE_KEY`, tudo roda em **modo demonstração**: os pedidos ficam na memória do servidor, com 4
agências de exemplo, e o painel fica aberto. Sem `RESEND_API_KEY`, os e-mails só vão para o log e o painel mostra os
links para enviar à mão.

**Pronto para outros países**: pedido e agência têm `mercado` (hoje só `br`, em `src/lib/mercados.ts`, com idioma,
moeda e DDI). Para abrir outro país, cadastre o mercado lá e nas agências (`mercados`). O texto de consentimento
aceito fica gravado em cada pedido (LGPD, e depois GDPR).

### Ativar

1. Rode `supabase/migrations/0003_cotacoes.sql` no Supabase.
2. Para cada agência parceira, preencha na tabela `agencias`: `email`, `recebe_cotacoes = true`, `mercados` (ex.:
   `{br}`) e, se ela não atende todos os destinos, `destinos` (slugs de país, ex.: `{irlanda,malta}`).
3. Na Vercel (Settings → Environment Variables), cadastre:
   - `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`: os pedidos guardam contato do aluno, então só o servidor lê e grava.
   - `ADMIN_SENHA`: a senha do painel `/admin/cotacoes`.
   - `RESEND_API_KEY` e `EMAIL_REMETENTE` (ex.: `InterWorld <cotacoes@seudominio.com>`, com o domínio verificado no
     [Resend](https://resend.com)).
   - `SITE_URL` (ex.: `https://interworld.com.br`), usado nos links dos e-mails.
   - Opcional: `REVISAO_MANUAL=false` para envio automático.

## Piloto da Fase 1: medição e página da cidade

O que o site mede para responder se o InterWorld traz alunos a um custo que vale a pena:

- **De onde veio cada visita.** `components/comum/Rastreio.tsx` guarda por 30 dias a origem (o `utm_source` e o
  `utm_campaign` do link, ou o site que mandou a pessoa, como Google ou Instagram) e conta cada página vista em
  `/api/evento`. Sem dado pessoal: só a página, a origem e um id aleatório da aba. Robôs ficam de fora.
- **Cliques no kit.** Os botões passam por `/api/parceiro/[id]`, que registra o clique e segue para o parceiro.
- **Pedidos por canal.** Cada pedido de cotação grava a origem de quem pediu.
- **Quem fechou.** A página do aluno pergunta "Já fechou?" (com qual agência, ainda não, desisti).
- **Painel `/admin/metricas`** (mesma senha das cotações): o funil de visitantes até a matrícula, a tabela por canal
  com o gasto digitado e o custo por pedido, e os cliques do kit por parceiro, em 7, 30 ou 90 dias.

Nos anúncios e na bio, use links como `https://seusite.com/intercambio/dublin?utm_source=instagram&utm_campaign=dublin-outubro`.

**Páginas de cidade** (`/intercambio/dublin` e as outras 8): o menor preço por semana, o mesmo curso em agências
diferentes, as escolas, as regras do país e o kit. Feitas para receber o anúncio e aparecer no Google; o `sitemap.xml` e o
`robots.txt` já as listam (e deixam de fora o painel e os links secretos).

### Ativar

1. Rode `supabase/migrations/0004_metricas.sql` no Supabase (depois das 0001 a 0003).
2. Pronto: com a `SUPABASE_SERVICE_ROLE_KEY` na Vercel, os números ficam no banco. Sem ela, ficam só na memória.

## Kit do intercambista (`/kit`)

Passagem, seguro, conta internacional, hospedagem e chip: o que se compra além do curso, na ordem e com o que conferir.
Com `?destino=irlanda` (ou outro país), mostra a exigência de seguro daquele país. Aparece também no guia e na página de
cotações do aluno. O conteúdo fica em `src/lib/kit.ts`.

**Ganhar com ele:** cadastre-se no programa de afiliados de cada parceiro e coloque o link na Vercel como
`KIT_LINK_<ID>` (ex.: `KIT_LINK_SEGUROS_PROMO`, `KIT_LINK_WISE`; a lista está no `.env.example`). Sem a variável, o
botão leva ao site normal do parceiro. Os links saem com `rel="sponsored"` e a página avisa que podem render comissão.

## Ferramentas do Claude Code

- **Skills** em `.claude/skills/`: [Taste Skill](https://github.com/Leonxlnx/taste-skill) (`design-taste-frontend`), [Impeccable](https://github.com/pbakaus/impeccable) (`/impeccable`) e as skills do [Emil Kowalski](https://github.com/emilkowalski/skill) (`emil-design-eng`, `animate`, `review-animations` e outras).
- **MCPs** em `.mcp.json`: Playwright (navegador headless, via `.claude/playwright-mcp.sh`) e Figma (`https://mcp.figma.com/mcp`, autentique com `/mcp` no Claude Code).
