-- ============================================================
--  fanmap — schema do banco (Supabase / Postgres)
--  Mapa colaborativo de lugares de fandom (multi-artista).
--  Cole TODO este arquivo no SQL Editor do Supabase e rode.
-- ============================================================

-- Tabela de locais cadastrados pelos fãs
create table if not exists public.places (
  id            uuid primary key default gen_random_uuid(),
  artist        text not null default 'Harry Styles',   -- fandom a que o lugar pertence
  name          text not null,
  category      text not null check (category in
                  ('cafe','restaurante','loja','gravacao','show','outro')),
  city          text,
  address       text,
  lat           double precision not null,
  lng           double precision not null,
  description   text not null,
  link          text,
  submitted_by  text default 'Anônimo',
  confirms      integer not null default 1,
  doubts        integer not null default 0,
  created_at    timestamptz not null default now()
);

-- Se a tabela já existia sem a coluna artist, adiciona:
alter table public.places add column if not exists artist text not null default 'Harry Styles';

-- Tabela de votos: 1 voto por navegador (client_id) por local.
create table if not exists public.votes (
  place_id   uuid not null references public.places(id) on delete cascade,
  client_id  text not null,
  vote       text not null check (vote in ('confirm','doubt')),
  created_at timestamptz not null default now(),
  primary key (place_id, client_id)
);

create index if not exists places_created_idx on public.places (created_at desc);
create index if not exists places_artist_idx on public.places (artist);
create index if not exists votes_place_idx on public.votes (place_id);

-- ------------------------------------------------------------
--  Função de voto: registra/atualiza o voto e recalcula os
--  contadores do local de forma atômica. Chamada via RPC.
-- ------------------------------------------------------------
create or replace function public.cast_vote(
  p_place_id uuid,
  p_client_id text,
  p_vote text
) returns void
language plpgsql
security definer
as $$
begin
  if p_vote not in ('confirm','doubt') then
    raise exception 'voto inválido';
  end if;

  insert into public.votes (place_id, client_id, vote)
  values (p_place_id, p_client_id, p_vote)
  on conflict (place_id, client_id)
  do update set vote = excluded.vote, created_at = now();

  update public.places p set
    confirms = (select count(*) from public.votes v
                where v.place_id = p.id and v.vote = 'confirm'),
    doubts   = (select count(*) from public.votes v
                where v.place_id = p.id and v.vote = 'doubt')
  where p.id = p_place_id;
end;
$$;

-- ------------------------------------------------------------
--  Função que lista os fandoms (artistas) existentes com contagem.
--  Usada para montar o seletor no topo do app.
-- ------------------------------------------------------------
create or replace function public.list_artists()
returns table (artist text, total bigint)
language sql
stable
as $$
  select artist, count(*) as total
  from public.places
  group by artist
  order by total desc, artist asc;
$$;

-- ------------------------------------------------------------
--  Segurança (RLS)
-- ------------------------------------------------------------
alter table public.places enable row level security;
alter table public.votes  enable row level security;

drop policy if exists "places_read"   on public.places;
drop policy if exists "places_insert" on public.places;
drop policy if exists "votes_read"    on public.votes;

create policy "places_read"   on public.places for select using (true);
create policy "places_insert" on public.places for insert with check (true);
create policy "votes_read"    on public.votes  for select using (true);

grant execute on function public.cast_vote(uuid, text, text) to anon;
grant execute on function public.list_artists() to anon;

-- ------------------------------------------------------------
--  Dados iniciais — vários fandoms de exemplo. Rode uma vez.
--  Fontes públicas de imprensa/fandom. Coordenadas aproximadas.
-- ------------------------------------------------------------
insert into public.places (artist, name, category, city, address, lat, lng, description, link, submitted_by, confirms, doubts)
values
-- ---- Harry Styles ----
('Harry Styles','Kaffeine','cafe','Londres, Reino Unido','66 Great Titchfield St, Fitzrovia, W1W 7QJ',51.5185,-0.1400,'Chamado pelo próprio Harry de seu café favorito. Em 2026 ele pagou o café de fãs que visitaram o local para comemorar a turnê.','https://www.standard.co.uk/showbiz/harry-styles-together-tour-2027-london-coffee-b1297492.html','equipe',42,1),
('Harry Styles','How Matcha!','cafe','Londres, Reino Unido','Blandford Street, Marylebone',51.5178,-0.1533,'Café de matchá em Marylebone conhecido pelas combinações de sabores; o cantor já foi visto por lá.','https://www.cntraveller.com/article/harry-styles-guide-to-london','equipe',18,3),
('Harry Styles','Rita''s Soho','restaurante','Londres, Reino Unido','Soho, Londres',51.5138,-0.1330,'Bistrô de estilo americano no Soho. Já recebeu Harry Styles e Zoë Kravitz em um jantar.','https://uk.news.yahoo.com/inside-excellent-gorgeous-london-restaurant-040000048.html','equipe',14,2),
('Harry Styles','SAY Doughnuts','loja','Bedford, Reino Unido','Bedford, Inglaterra',52.1360,-0.4666,'Loja de donuts em Bedford onde Harry virou "meio que um cliente frequente" segundo os donos.','https://www.yahoo.com/entertainment/celebrity/articles/harry-styles-bit-regular-local-190217668.html','equipe',27,0),
('Harry Styles','Daunt Books Marylebone','loja','Londres, Reino Unido','83 Marylebone High St, W1U 4QW',51.5205,-0.1520,'Livraria eduardiana clássica em Marylebone, citada em guias sobre a Londres do Harry.','https://www.vogue.co.uk/article/harry-styles-london','equipe',9,1),
('Harry Styles','Hampstead Heath (Men''s Pond)','outro','Londres, Reino Unido','Hampstead Heath, Londres',51.5608,-0.1607,'Parque enorme no norte de Londres. Harry já foi visto nadando no Men''s Pond, como muitos londrinos.','https://www.cntraveller.com/article/harry-styles-guide-to-london','equipe',21,4),
('Harry Styles','Barbican Estate','gravacao','Londres, Reino Unido','Barbican, City of London, EC2Y',51.5200,-0.0937,'O clipe de "As It Was" abre com Harry no complexo brutalista do Barbican, no centro de Londres.','https://www.capitalfm.com/news/harry-styles-as-it-was-music-video-location/','equipe',55,0),
('Harry Styles','Isle of Skye','gravacao','Escócia, Reino Unido','Ilha de Skye, Terras Altas da Escócia',57.2736,-6.2155,'As paisagens épicas do clipe de "Sign of the Times" foram filmadas na Ilha de Skye, na Escócia.','https://www.sonymusic.co.uk/harry-styles-premieres-sign-of-the-times-music-video/','equipe',33,1),
('Harry Styles','Costa Amalfitana','gravacao','Amalfi, Itália','Costa Amalfitana, Itália',40.6340,14.6027,'O clipe de "Golden" mostra Harry correndo, nadando e dirigindo pela deslumbrante Costa Amalfitana.','https://www.sportskeeda.com/us/music/where-harry-styles-golden-video-filmed-shooting-locations-fine-line-song-mv-explored','equipe',24,2),
('Harry Styles','Praia de Malibu','gravacao','Malibu, Califórnia, EUA','Malibu, Califórnia',34.0359,-118.6905,'Clipe de "Watermelon Sugar" foi gravado em uma praia de Malibu — a mesma de "What Makes You Beautiful" (2011).','https://www.capitalfm.com/artists/harry-styles/watermelon-sugar-video-what-makes-you-beautiful/','equipe',30,3),
-- ---- Taylor Swift ----
('Taylor Swift','Cornelia Street','outro','Nova York, EUA','Cornelia Street, West Village, Manhattan',40.7317,-74.0033,'Rua do West Village onde Taylor morou em uma casa alugada; virou nome de música em "Lover".','https://en.wikipedia.org/wiki/Cornelia_Street_(song)','equipe',48,1),
('Taylor Swift','Cornaro Palace (Miss Americana)','gravacao','Nova York, EUA','Cornaro/Centro',40.7128,-74.0060,'Cenários de Nova York aparecem em clipes e no documentário; ponto de peregrinação de fãs.','','equipe',6,2),
-- ---- BTS ----
('BTS','HYBE Insight / Área de Yongsan','outro','Seul, Coreia do Sul','Yongsan-gu, Seul',37.5299,126.9648,'Região da sede da HYBE em Seul, parada frequente de fãs (ARMY) em roteiros pela cidade.','','equipe',12,1),
('BTS','Gyeongbokgung (cenário de conteúdos)','gravacao','Seul, Coreia do Sul','161 Sajik-ro, Jongno-gu, Seul',37.5796,126.9770,'Palácio histórico que já apareceu em conteúdos do grupo; visita clássica de quem vai a Seul.','','equipe',9,0);
