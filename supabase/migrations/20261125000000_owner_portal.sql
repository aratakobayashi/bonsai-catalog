-- 盆栽園向けの管理画面（/owner）
-- 2段階認証：園のデータを読む・書くには、パスワードに加えて認証アプリのコードで確かめたログイン（aal2）が要る。
-- 画面の側だけでなく、データベースの側（is_garden_member と garden_members の読み取り）でも確かめる
-- Supabase の「SQL Editor」に全文を貼り付けて、1回だけ実行する。何度実行しても壊れないように書いてある。
--
-- 作るもの
--   garden_members      どのログインユーザーが、どの園を管理できるか（運営者が登録する）
--   garden_owner_info   園の方が書き換えた園の情報（公開ページでは gardens より優先して表示）
--   garden_products     園の方が登録した商品（購入は園の通販サイト・電話・メールなどへ案内する）
--   garden_stats_daily  園ごと・日ごとの数字（ページの表示、公式サイトへの移動など）
--   track_garden()      サイトから数字を1つ足す関数（誰でも呼べるが、決まった種類しか受け付けない）
--   garden-media        園の写真・商品の写真の置き場（公開。書き込めるのは、その園のメンバーだけ）

-- ── メンバー ─────────────────────────────────────────
create table if not exists public.garden_members (
  user_id uuid not null references auth.users(id) on delete cascade,
  garden_id uuid not null references public.gardens(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, garden_id)
);
alter table public.garden_members enable row level security;
drop policy if exists "members read own" on public.garden_members;
create policy "members read own" on public.garden_members for select to authenticated using (user_id = auth.uid() and (auth.jwt() ->> 'aal') = 'aal2');

create or replace function public.is_garden_member(gid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select (auth.jwt() ->> 'aal') = 'aal2'
     and exists (select 1 from public.garden_members where user_id = auth.uid() and garden_id = gid)
$$;
revoke all on function public.is_garden_member(uuid) from public;
grant execute on function public.is_garden_member(uuid) to authenticated;

-- ── 園の情報（園の方が書き換えたもの） ─────────────────
create table if not exists public.garden_owner_info (
  garden_id uuid primary key references public.gardens(id) on delete cascade,
  description text check (char_length(description) <= 1200),
  business_hours text check (char_length(business_hours) <= 200),
  closed_days text check (char_length(closed_days) <= 100),
  visit_info text check (char_length(visit_info) <= 300),
  access_info text check (char_length(access_info) <= 300),
  parking_info text check (char_length(parking_info) <= 200),
  phone text check (char_length(phone) <= 30),
  website_url text check (website_url ~ '^https?://' and char_length(website_url) <= 300),
  shop_url text check (shop_url ~ '^https?://' and char_length(shop_url) <= 300),
  instagram_url text check (instagram_url ~ '^https?://' and char_length(instagram_url) <= 300),
  taiken_info text check (char_length(taiken_info) <= 800),
  photos jsonb not null default '[]'::jsonb check (jsonb_typeof(photos) = 'array' and jsonb_array_length(photos) <= 6),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.garden_owner_info enable row level security;
drop policy if exists "owner info public read" on public.garden_owner_info;
create policy "owner info public read" on public.garden_owner_info for select using (true);
drop policy if exists "owner info member insert" on public.garden_owner_info;
create policy "owner info member insert" on public.garden_owner_info for insert to authenticated with check (public.is_garden_member(garden_id));
drop policy if exists "owner info member update" on public.garden_owner_info;
create policy "owner info member update" on public.garden_owner_info for update to authenticated using (public.is_garden_member(garden_id)) with check (public.is_garden_member(garden_id));

-- ── 商品 ─────────────────────────────────────────────
create table if not exists public.garden_products (
  id uuid primary key default gen_random_uuid(),
  garden_id uuid not null references public.gardens(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  price integer check (price is null or price between 0 and 100000000),
  price_note text check (char_length(price_note) <= 60),
  description text check (char_length(description) <= 800),
  image_url text check (image_url is null or image_url ~ '^https://'),
  buy_method text not null default 'url' check (buy_method in ('url', 'phone', 'email', 'visit')),
  buy_url text check (buy_url is null or (buy_url ~ '^https?://' and char_length(buy_url) <= 500)),
  in_stock boolean not null default true,
  published boolean not null default false,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists garden_products_garden_idx on public.garden_products (garden_id, sort);
alter table public.garden_products enable row level security;
drop policy if exists "products public read published" on public.garden_products;
create policy "products public read published" on public.garden_products for select using (published or public.is_garden_member(garden_id));
drop policy if exists "products member insert" on public.garden_products;
create policy "products member insert" on public.garden_products for insert to authenticated with check (public.is_garden_member(garden_id));
drop policy if exists "products member update" on public.garden_products;
create policy "products member update" on public.garden_products for update to authenticated using (public.is_garden_member(garden_id)) with check (public.is_garden_member(garden_id));
drop policy if exists "products member delete" on public.garden_products;
create policy "products member delete" on public.garden_products for delete to authenticated using (public.is_garden_member(garden_id));

-- 1つの園に載せられる商品は100件まで
create or replace function public.garden_products_limit() returns trigger language plpgsql as $$
begin
  if (select count(*) from public.garden_products where garden_id = new.garden_id) >= 100 then
    raise exception '商品は1つの園につき100件まで登録できます';
  end if;
  return new;
end $$;
drop trigger if exists garden_products_limit on public.garden_products;
create trigger garden_products_limit before insert on public.garden_products for each row execute function public.garden_products_limit();

-- ── 変更の記録（毎日の反映で、変更があった日だけサイトを作り直すため） ──
create table if not exists public.owner_content_version (
  id integer primary key default 1 check (id = 1),
  updated_at timestamptz not null default now()
);
insert into public.owner_content_version (id) values (1) on conflict do nothing;
alter table public.owner_content_version enable row level security;
drop policy if exists "version public read" on public.owner_content_version;
create policy "version public read" on public.owner_content_version for select using (true);

create or replace function public.touch_owner_content() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then new.updated_at := now(); end if;
  update public.owner_content_version set updated_at = now() where id = 1;
  return coalesce(new, old);
end $$;
drop trigger if exists touch_owner_info on public.garden_owner_info;
create trigger touch_owner_info before insert or update on public.garden_owner_info for each row execute function public.touch_owner_content();
drop trigger if exists touch_products on public.garden_products;
create trigger touch_products before insert or update or delete on public.garden_products for each row execute function public.touch_owner_content();

-- ── 日ごとの数字 ───────────────────────────────────────
create table if not exists public.garden_stats_daily (
  garden_id uuid not null references public.gardens(id) on delete cascade,
  day date not null,
  metric text not null,
  source text not null default '',
  count integer not null default 0,
  primary key (garden_id, day, metric, source)
);
alter table public.garden_stats_daily enable row level security;
drop policy if exists "stats member read" on public.garden_stats_daily;
create policy "stats member read" on public.garden_stats_daily for select to authenticated using (public.is_garden_member(garden_id));

-- metric：view（園のページの表示） website（公式サイト） shop（通販サイト） taiken（体験の案内ページ）
--         phone（電話） map（地図） instagram（Instagram） product（商品の購入先・全体） product:<商品ID>（商品の購入先・商品ごと）
-- source：どこから来たか（garden・taiken・shops・gardens・search・external・direct など）
create or replace function public.track_garden(p_garden uuid, p_metric text, p_source text default '')
returns void language plpgsql security definer set search_path = public as $$
declare
  src text := left(coalesce(p_source, ''), 40);
begin
  if p_metric !~ '^(view|website|shop|taiken|phone|map|instagram|product|product:[0-9a-f-]{36})$' then return; end if;
  if src !~ '^[a-z0-9_-]*$' then src := 'other'; end if;
  if not exists (select 1 from public.gardens where id = p_garden) then return; end if;
  insert into public.garden_stats_daily (garden_id, day, metric, source, count)
  values (p_garden, (now() at time zone 'Asia/Tokyo')::date, p_metric, src, 1)
  on conflict (garden_id, day, metric, source) do update set count = garden_stats_daily.count + 1;
end $$;
revoke all on function public.track_garden(uuid, text, text) from public;
grant execute on function public.track_garden(uuid, text, text) to anon, authenticated;

-- ── 写真の置き場 ───────────────────────────────────────
-- ファイルの場所は「<園のID>/<ファイル名>」。1枚5MBまで、画像だけ
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('garden-media', 'garden-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "garden media member insert" on storage.objects;
create policy "garden media member insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'garden-media' and public.is_garden_member(((storage.foldername(name))[1])::uuid));
drop policy if exists "garden media member update" on storage.objects;
create policy "garden media member update" on storage.objects for update to authenticated
  using (bucket_id = 'garden-media' and public.is_garden_member(((storage.foldername(name))[1])::uuid));
drop policy if exists "garden media member delete" on storage.objects;
create policy "garden media member delete" on storage.objects for delete to authenticated
  using (bucket_id = 'garden-media' and public.is_garden_member(((storage.foldername(name))[1])::uuid));

-- ── 運営者が使う関数（SQL Editor から実行する。サイトからは呼べない） ──
-- 例：select public.add_garden_member('owner@example.com', '園のID');
create or replace function public.add_garden_member(p_email text, p_garden uuid)
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(p_email);
  if uid is null then return '先に Authentication → Users → Add user で、このメールアドレスのユーザーを作ってください'; end if;
  insert into public.garden_members (user_id, garden_id) values (uid, p_garden) on conflict do nothing;
  return 'OK：' || p_email || ' が園を管理できるようになりました';
end $$;
revoke all on function public.add_garden_member(text, uuid) from public, anon, authenticated;
