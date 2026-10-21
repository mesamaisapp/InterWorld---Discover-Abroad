-- =====================================================================
-- Coletor de preços: fontes (páginas de preço de escolas e agências),
-- registro de cada coleta e a origem de cada pacote.
-- =====================================================================

create type public.tipo_fonte as enum (
  'escola',   -- tabela oficial da escola: o preço vira uma oferta "direto na escola"
  'agencia'   -- página de uma agência que publica preço
);

-- ---------------------------------------------------------------------
-- Fontes: cada URL que o coletor lê todos os dias
-- ---------------------------------------------------------------------
create table public.fontes (
  id             uuid primary key default gen_random_uuid(),
  url            text not null unique check (url ~* '^https?://'),
  tipo           public.tipo_fonte not null,
  nome           text not null,        -- quem publica: a escola ou a agência
  agencia_id     uuid references public.agencias (id) on delete set null, -- só para tipo 'agencia'
  pais_slug      text,                 -- dica para a extração (fonte de um país só)
  cidade         text,                 -- dica para a extração (fonte de uma cidade só)
  ativa          boolean not null default true,
  observacoes    text,
  ultima_coleta  timestamptz,
  ultimo_status  text,
  ultimo_hash    text,                 -- sha256 do conteúdo lido: sem mudança, não chama a IA
  criado_em      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Coletas: uma linha por fonte por execução (auditoria e depuração)
-- ---------------------------------------------------------------------
create table public.coletas (
  id            bigint generated always as identity primary key,
  fonte_id      uuid not null references public.fontes (id) on delete cascade,
  iniciada_em   timestamptz not null default now(),
  terminada_em  timestamptz,
  status        text not null check (status in ('ok', 'sem_mudanca', 'sem_precos', 'bloqueada', 'erro')),
  ofertas       integer not null default 0,
  descartadas   integer not null default 0,
  detalhe       text
);

create index coletas_fonte_idx on public.coletas (fonte_id, iniciada_em desc);

-- ---------------------------------------------------------------------
-- Origem de cada pacote
-- ---------------------------------------------------------------------
alter table public.agencias
  add column direto_escola boolean not null default false; -- "agência" que representa a própria escola

alter table public.pacotes
  add column origem          text not null default 'parceiro' check (origem in ('parceiro', 'coletado')),
  add column fonte_id        uuid references public.fontes (id) on delete set null,
  add column moeda           char(3) not null default 'EUR',
  add column preco_original  numeric(10, 2),   -- na moeda da fonte, antes da conversão
  add column visto_em        timestamptz,      -- última vez que o coletor confirmou o preço
  add column evidencia       text;             -- trecho da página que sustenta o preço

create index pacotes_fonte_idx on public.pacotes (fonte_id) where fonte_id is not null;

-- A view ganha as colunas novas no fim (create or replace exige manter a ordem das antigas)
create or replace view public.pacotes_busca
with (security_invoker = true)
as
select
  p.id,
  p.tipo_curso,
  p.semanas,
  p.preco_eur,
  round(p.preco_eur / p.semanas, 2) as preco_semana_eur,
  p.acomodacao_inclusa,
  p.link_afiliado,
  e.id     as escola_id,
  e.nome   as escola_nome,
  e.cidade as escola_cidade,
  pa.id    as pais_id,
  pa.nome  as pais_nome,
  pa.slug  as pais_slug,
  a.id     as agencia_id,
  a.nome   as agencia_nome,
  a.logo_url as agencia_logo_url,
  p.origem,
  p.visto_em,
  p.moeda,
  p.preco_original
from public.pacotes p
join public.escolas  e  on e.id  = p.escola_id
join public.paises   pa on pa.id = e.pais_id
join public.agencias a  on a.id  = p.agencia_id
where p.ativo and a.ativa;

-- Fontes e coletas são internas: RLS ligado e nenhuma policy (só a service_role do coletor acessa)
alter table public.fontes  enable row level security;
alter table public.coletas enable row level security;
