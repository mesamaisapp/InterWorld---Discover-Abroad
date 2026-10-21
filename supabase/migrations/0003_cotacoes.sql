-- =====================================================================
-- Cotações: o aluno pede, a InterWorld revisa, até 3 agências respondem,
-- o aluno compara. Tudo passa pelo servidor (service_role); nada é público.
-- =====================================================================

-- Mercado = país de origem do aluno ("br"). Prepara a expansão para outros países.
alter table public.agencias
  add column email             text,
  add column mercados          text[] not null default '{br}',  -- de onde vêm os alunos que a agência atende
  add column destinos          text[],                          -- slugs de países que ela vende; null = todos
  add column recebe_cotacoes   boolean not null default false,
  add column ultima_cotacao_em timestamptz;                     -- rodízio: quem recebeu há mais tempo vem primeiro

create type public.status_pedido as enum (
  'aguardando_revisao',
  'enviado',      -- foi para as agências
  'recusado',     -- reprovado na revisão
  'sem_agencias'  -- aprovado, mas nenhuma agência atende esse destino
);

create table public.pedidos_cotacao (
  id               uuid primary key default gen_random_uuid(),
  token            text not null unique,          -- link secreto do aluno para acompanhar
  mercado          text not null default 'br',
  nome             text not null,
  whatsapp         text not null,
  email            text,
  pais_slug        text not null,
  cidade           text,
  tipo_curso       public.tipo_curso,
  semanas          smallint check (semanas between 1 and 104),
  inicio           text,                          -- mês desejado, 'aaaa-mm'
  observacoes      text,
  pacote_id        uuid references public.pacotes (id) on delete set null, -- se veio de um bilhete
  consentimento    boolean not null check (consentimento),
  consentimento_texto text not null,
  triagem          jsonb not null default '{}',   -- nota e motivos da triagem automática
  status           public.status_pedido not null default 'aguardando_revisao',
  revisado_em      timestamptz,
  criado_em        timestamptz not null default now()
);

create index pedidos_status_idx on public.pedidos_cotacao (status, criado_em desc);

create table public.respostas_cotacao (
  id              uuid primary key default gen_random_uuid(),
  pedido_id       uuid not null references public.pedidos_cotacao (id) on delete cascade,
  agencia_id      uuid not null references public.agencias (id) on delete cascade,
  token           text not null unique,           -- link secreto da agência para responder
  enviado_em      timestamptz not null default now(),
  respondido_em   timestamptz,
  moeda           char(3),
  preco           numeric(10, 2) check (preco > 0),
  inclui          text,
  validade        date,
  mensagem        text,
  whatsapp        text,                           -- contato da agência para o aluno
  unique (pedido_id, agencia_id)
);

create index respostas_agencia_idx on public.respostas_cotacao (agencia_id, enviado_em desc);

alter table public.pedidos_cotacao   enable row level security;
alter table public.respostas_cotacao enable row level security;
-- Sem policies: só o servidor do site (service_role) lê e escreve.
