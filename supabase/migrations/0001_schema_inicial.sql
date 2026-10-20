-- =====================================================================
-- Comparador de Intercâmbio — schema inicial do MVP (Supabase / PostgreSQL)
-- =====================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
create type public.tipo_curso as enum (
  'geral',            -- Inglês/idioma geral
  'intensivo',
  'business',         -- Idioma para negócios
  'preparatorio',     -- IELTS, TOEFL, Cambridge, DELE...
  'ferias'            -- Programas de férias / curta duração
);

-- Atualiza a coluna atualizado_em automaticamente
create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Países / Destinos
-- ---------------------------------------------------------------------
create table public.paises (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  criado_em     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Escolas
-- ---------------------------------------------------------------------
create table public.escolas (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  cidade        text not null,
  pais_id       uuid not null references public.paises (id) on delete restrict,
  criado_em     timestamptz not null default now(),
  unique (nome, cidade)
);

create index escolas_pais_id_idx on public.escolas (pais_id);

-- ---------------------------------------------------------------------
-- Agências / Parceiros
-- ---------------------------------------------------------------------
create table public.agencias (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null unique,
  logo_url      text,
  contato       text,          -- e-mail, telefone ou WhatsApp comercial
  ativa         boolean not null default true,
  criado_em     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Pacotes / Cotações
-- ---------------------------------------------------------------------
create table public.pacotes (
  id                   uuid primary key default gen_random_uuid(),
  escola_id            uuid not null references public.escolas (id) on delete cascade,
  agencia_id           uuid not null references public.agencias (id) on delete cascade,
  tipo_curso           public.tipo_curso not null,
  semanas              smallint not null check (semanas between 1 and 104),
  preco_eur            numeric(10, 2) not null check (preco_eur > 0),
  acomodacao_inclusa   boolean not null default false,
  link_afiliado        text not null check (link_afiliado ~* '^https?://'),
  ativo                boolean not null default true,
  criado_em            timestamptz not null default now(),
  atualizado_em        timestamptz not null default now(),
  -- Uma agência não cota duas vezes o mesmo curso/duração/acomodação na mesma escola
  unique (escola_id, agencia_id, tipo_curso, semanas, acomodacao_inclusa)
);

create index pacotes_escola_id_idx  on public.pacotes (escola_id);
create index pacotes_agencia_id_idx on public.pacotes (agencia_id);
-- Índice para os filtros e a ordenação mais comuns da busca
create index pacotes_busca_idx on public.pacotes (tipo_curso, semanas, preco_eur) where ativo;

create trigger pacotes_set_atualizado_em
  before update on public.pacotes
  for each row execute function public.set_atualizado_em();

-- ---------------------------------------------------------------------
-- View de busca: achata pacote + escola + país + agência numa linha só,
-- para que o front filtre por destino com um único select.
-- security_invoker = true faz a view respeitar o RLS das tabelas base.
-- ---------------------------------------------------------------------
create view public.pacotes_busca
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
  a.logo_url as agencia_logo_url
from public.pacotes p
join public.escolas  e  on e.id  = p.escola_id
join public.paises   pa on pa.id = e.pais_id
join public.agencias a  on a.id  = p.agencia_id
where p.ativo and a.ativa;

-- ---------------------------------------------------------------------
-- Cliques em "Ver Oferta" (base para relatório de comissão por agência)
-- ---------------------------------------------------------------------
create table public.cliques_oferta (
  id          bigint generated always as identity primary key,
  pacote_id   uuid not null references public.pacotes (id) on delete cascade,
  criado_em   timestamptz not null default now(),
  referer     text,
  user_agent  text
);

create index cliques_oferta_pacote_id_idx on public.cliques_oferta (pacote_id, criado_em);

-- ---------------------------------------------------------------------
-- RLS: catálogo é público para leitura; escrita só via service_role
-- (painel admin / scripts de importação de cotações).
-- ---------------------------------------------------------------------
alter table public.paises         enable row level security;
alter table public.escolas        enable row level security;
alter table public.agencias       enable row level security;
alter table public.pacotes        enable row level security;
alter table public.cliques_oferta enable row level security;

create policy "leitura publica" on public.paises   for select to anon, authenticated using (true);
create policy "leitura publica" on public.escolas  for select to anon, authenticated using (true);
create policy "leitura publica" on public.agencias for select to anon, authenticated using (ativa);
create policy "leitura publica" on public.pacotes  for select to anon, authenticated using (ativo);

-- Visitantes podem registrar cliques, mas não ler os de ninguém
create policy "registrar clique" on public.cliques_oferta for insert to anon, authenticated with check (true);

grant select on public.pacotes_busca to anon, authenticated;
