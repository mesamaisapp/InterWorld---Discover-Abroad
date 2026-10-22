-- Dados de exemplo para desenvolvimento (rode depois da migration)

insert into public.paises (nome, slug) values
  ('Austrália', 'australia'),
  ('Canadá', 'canada'),
  ('Espanha', 'espanha'),
  ('Irlanda', 'irlanda'),
  ('Malta', 'malta'),
  ('Reino Unido', 'reino-unido');

insert into public.escolas (nome, cidade, pais_id)
select v.nome, v.cidade, p.id
from (values
  ('Atlantic Language School', 'Dublin',      'irlanda'),
  ('CES Dublin',                'Dublin',      'irlanda'),
  ('Galway Cultural Institute', 'Galway',      'irlanda'),
  ('EC Malta',                  'St Julian''s', 'malta'),
  ('ILAC Toronto',              'Toronto',     'canada'),
  ('ILAC Vancouver',            'Vancouver',   'canada'),
  ('Kings Oxford',              'Oxford',      'reino-unido'),
  ('Stafford House London',     'Londres',     'reino-unido'),
  ('Don Quijote Barcelona',     'Barcelona',   'espanha'),
  ('Navitas English Sydney',    'Sydney',      'australia')
) as v(nome, cidade, pais_slug)
join public.paises p on p.slug = v.pais_slug;

insert into public.agencias (nome, logo_url, contato) values
  ('Rota Intercâmbios', null, 'contato@rota.example'),
  ('Mundo Aberto',      null, '+55 11 90000-0000'),
  ('Passaporte Edu',    null, 'parcerias@passaporte.example'),
  ('Embarque Já',       null, 'oi@embarqueja.example');

insert into public.pacotes (escola_id, agencia_id, tipo_curso, semanas, preco_eur, acomodacao_inclusa, link_afiliado)
select e.id, a.id, v.tipo::public.tipo_curso, v.semanas, v.preco, v.acom, v.link
from (values
  ('Atlantic Language School', 'Rota Intercâmbios', 'geral',        25, 3290.00, false, 'https://rota.example/oferta/atlantic-25'),
  ('Atlantic Language School', 'Mundo Aberto',      'geral',        25, 3150.00, false, 'https://mundoaberto.example/a/atlantic-25'),
  ('Atlantic Language School', 'Embarque Já',       'geral',        25, 3420.00, false, 'https://embarqueja.example/p/atlantic-25'),
  ('CES Dublin',               'Passaporte Edu',    'geral',        12, 2380.00, false, 'https://passaporte.example/go/ces-12'),
  ('CES Dublin',               'Embarque Já',       'intensivo',     8, 2160.00, true,  'https://embarqueja.example/p/ces-int-8'),
  ('Galway Cultural Institute','Passaporte Edu',    'intensivo',    12, 3980.00, true,  'https://passaporte.example/go/gci-12'),
  ('Galway Cultural Institute','Rota Intercâmbios', 'intensivo',    12, 4190.00, true,  'https://rota.example/oferta/gci-12'),
  ('EC Malta',                 'Mundo Aberto',      'geral',         4,  980.00, true,  'https://mundoaberto.example/a/ecmalta-4'),
  ('EC Malta',                 'Embarque Já',       'geral',         4, 1090.00, true,  'https://embarqueja.example/p/ecmalta-4'),
  ('EC Malta',                 'Rota Intercâmbios', 'business',      8, 2240.00, false, 'https://rota.example/oferta/ecmalta-biz-8'),
  ('ILAC Toronto',             'Passaporte Edu',    'preparatorio', 12, 4520.00, false, 'https://passaporte.example/go/ilac-ielts-12'),
  ('ILAC Toronto',             'Mundo Aberto',      'geral',        24, 6980.00, false, 'https://mundoaberto.example/a/ilac-24'),
  ('ILAC Vancouver',           'Embarque Já',       'geral',        12, 3890.00, true,  'https://embarqueja.example/p/ilacvan-12'),
  ('ILAC Vancouver',           'Passaporte Edu',    'geral',        12, 3640.00, true,  'https://passaporte.example/go/ilacvan-12'),
  ('Kings Oxford',             'Rota Intercâmbios', 'ferias',        2, 1890.00, true,  'https://rota.example/oferta/kings-verao-2'),
  ('Kings Oxford',             'Mundo Aberto',      'preparatorio',  8, 3360.00, false, 'https://mundoaberto.example/a/kings-ielts-8'),
  ('Stafford House London',    'Embarque Já',       'geral',         4, 1480.00, false, 'https://embarqueja.example/p/stafford-4'),
  ('Stafford House London',    'Rota Intercâmbios', 'business',      4, 1720.00, false, 'https://rota.example/oferta/stafford-biz-4'),
  ('Don Quijote Barcelona',    'Mundo Aberto',      'intensivo',     4, 1260.00, false, 'https://mundoaberto.example/a/dq-bcn-4'),
  ('Don Quijote Barcelona',    'Passaporte Edu',    'intensivo',     4, 1340.00, false, 'https://passaporte.example/go/dq-bcn-4'),
  ('Navitas English Sydney',   'Passaporte Edu',    'geral',        12, 4680.00, false, 'https://passaporte.example/go/navitas-12'),
  ('Navitas English Sydney',   'Embarque Já',       'geral',        12, 4390.00, false, 'https://embarqueja.example/p/navitas-12'),
  ('Navitas English Sydney',   'Mundo Aberto',      'preparatorio', 10, 4250.00, true,  'https://mundoaberto.example/a/navitas-ielts-10')
) as v(escola, agencia, tipo, semanas, preco, acom, link)
join public.escolas  e on e.nome = v.escola
join public.agencias a on a.nome = v.agencia;
