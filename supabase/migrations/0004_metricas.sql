-- =====================================================================
-- Medição do piloto: de onde vem cada visita, o que ela faz e se o
-- aluno fechou. Sem dado pessoal nos eventos: a sessão é um id aleatório
-- da aba do navegador. Gravado só pelo servidor (service_role).
-- =====================================================================

create table public.eventos (
  id          bigint generated always as identity primary key,
  tipo        text not null check (tipo in ('visita', 'clique_parceiro')),
  caminho     text,                 -- página, ex.: /cotacao
  ref         text,                 -- o que foi clicado, ex.: id do parceiro do kit
  origem      text,                 -- utm_source ou o site que trouxe a visita (google, instagram…)
  campanha    text,                 -- utm_campaign
  sessao      text,                 -- id aleatório da aba, para contar visitantes
  criado_em   timestamptz not null default now()
);

create index eventos_tipo_data_idx on public.eventos (tipo, criado_em desc);

alter table public.eventos enable row level security;

-- Cada pedido guarda de onde o aluno veio e, depois, se ele fechou
alter table public.pedidos_cotacao
  add column origem               text,
  add column campanha             text,
  add column desfecho             text check (desfecho in ('fechou', 'ainda_nao', 'desistiu')),
  add column desfecho_resposta_id uuid references public.respostas_cotacao (id) on delete set null,
  add column desfecho_em          timestamptz;

create index pedidos_criado_idx on public.pedidos_cotacao (criado_em desc);
