-- Dados de exemplo para desenvolvimento (rode depois da migration)

insert into public.paises (nome, slug) values
  ('Irlanda', 'irlanda'),
  ('Malta', 'malta'),
  ('Canadá', 'canada'),
  ('Reino Unido', 'reino-unido'),
  ('Espanha', 'espanha');

insert into public.escolas (nome, cidade, pais_id)
select v.nome, v.cidade, p.id
from (values
  ('Atlantic Language School', 'Dublin',    'irlanda'),
  ('Galway Cultural Institute', 'Galway',   'irlanda'),
  ('EC Malta',                  'St Julian''s', 'malta'),
  ('ILAC Toronto',              'Toronto',  'canada'),
  ('Kings Oxford',              'Oxford',   'reino-unido'),
  ('Don Quijote Barcelona',     'Barcelona','espanha')
) as v(nome, cidade, pais_slug)
join public.paises p on p.slug = v.pais_slug;

insert into public.agencias (nome, logo_url, contato) values
  ('Rota Intercâmbios', null, 'contato@rota.example'),
  ('Mundo Aberto',      null, '+55 11 90000-0000'),
  ('Passaporte Edu',    null, 'parcerias@passaporte.example');

insert into public.pacotes (escola_id, agencia_id, tipo_curso, semanas, preco_eur, acomodacao_inclusa, link_afiliado)
select e.id, a.id, v.tipo::public.tipo_curso, v.semanas, v.preco, v.acom, v.link
from (values
  ('Atlantic Language School', 'Rota Intercâmbios', 'geral',        25, 3290.00, false, 'https://rota.example/oferta/atlantic-25'),
  ('Atlantic Language School', 'Mundo Aberto',      'geral',        25, 3150.00, false, 'https://mundoaberto.example/a/atlantic-25'),
  ('Galway Cultural Institute','Passaporte Edu',    'intensivo',    12, 3980.00, true,  'https://passaporte.example/go/gci-12'),
  ('EC Malta',                 'Mundo Aberto',      'geral',         4,  980.00, true,  'https://mundoaberto.example/a/ecmalta-4'),
  ('EC Malta',                 'Rota Intercâmbios', 'business',      8, 2240.00, false, 'https://rota.example/oferta/ecmalta-biz-8'),
  ('ILAC Toronto',             'Passaporte Edu',    'preparatorio', 12, 4520.00, false, 'https://passaporte.example/go/ilac-ielts-12'),
  ('Kings Oxford',             'Rota Intercâmbios', 'ferias',        2, 1890.00, true,  'https://rota.example/oferta/kings-verao-2'),
  ('Don Quijote Barcelona',    'Mundo Aberto',      'intensivo',     4, 1260.00, false, 'https://mundoaberto.example/a/dq-bcn-4')
) as v(escola, agencia, tipo, semanas, preco, acom, link)
join public.escolas  e on e.nome = v.escola
join public.agencias a on a.nome = v.agencia;
