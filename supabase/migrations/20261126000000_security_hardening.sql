-- セキュリティの強化（2026-11-26 の調査をもとに）
-- 20261125000000_owner_portal.sql のあとに実行する。何度実行しても壊れないように書いてある。

-- ── 1. 記事を「ログインした人なら誰でも」書き換えられる設定を消す ──────────────
-- 記事の本文は HTML としてそのまま表示するため、書き込みは運営のサービスキー（RLS を通らない）だけにする
do $$
declare t text;
begin
  foreach t in array array['articles', 'article_categories', 'article_tags'] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists %I on public.%I', 'Articles are manageable by authenticated users', t);
      execute format('drop policy if exists %I on public.%I', 'Article categories are manageable by authenticated users', t);
      execute format('drop policy if exists %I on public.%I', 'Article tags are manageable by authenticated users', t);
    end if;
  end loop;
end $$;

-- ほかの公開の表も、RLS を必ず有効にしておく（読み取りの設定はそのまま。書き込みの設定は作らない）
do $$
declare t text;
begin
  foreach t in array array['gardens', 'products', 'events', 'event_articles'] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
    end if;
  end loop;
end $$;

-- ── 6. 写真のURLは、このサイトの写真置き場（その園のフォルダ）だけにする ─────────
create or replace function public.is_garden_media_url(gid uuid, url text)
returns boolean language sql immutable as $$
  select url ~ ('^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/garden-media/' || gid::text || '/[A-Za-z0-9._-]+$')
$$;

create or replace function public.is_garden_media_list(gid uuid, photos jsonb)
returns boolean language sql immutable as $$
  select jsonb_typeof(photos) = 'array'
     and jsonb_array_length(photos) <= 6
     and not exists (
       select 1 from jsonb_array_elements(photos) p
       where jsonb_typeof(p) <> 'string' or not public.is_garden_media_url(gid, p #>> '{}')
     )
$$;

alter table public.garden_owner_info drop constraint if exists garden_owner_info_photos_media;
alter table public.garden_owner_info add constraint garden_owner_info_photos_media check (public.is_garden_media_list(garden_id, photos)) not valid;
alter table public.garden_products drop constraint if exists garden_products_image_media;
alter table public.garden_products add constraint garden_products_image_media check (image_url is null or public.is_garden_media_url(garden_id, image_url)) not valid;

-- 電話番号は数字・記号だけ
alter table public.garden_owner_info drop constraint if exists garden_owner_info_phone_chars;
alter table public.garden_owner_info add constraint garden_owner_info_phone_chars check (phone is null or phone ~ '^[0-9０-９()（）+\-－ ]{0,30}$') not valid;

-- ── 11. 最後に更新した人のユーザーIDは、外から読めないようにする ────────────────
revoke select on public.garden_owner_info from anon, authenticated;
grant select (garden_id, description, business_hours, closed_days, visit_info, access_info, parking_info, phone,
              website_url, shop_url, instagram_url, taiken_info, photos, updated_at)
  on public.garden_owner_info to anon, authenticated;

-- ── 7. 数字の水増しを防ぐ（同じ送り元からは、1つの園につき1日30回まで） ─────────
-- 送り元は IP アドレスをその日だけの値と混ぜてハッシュにしたもの（元の IP は残さない）。3日より前の分は消す
create table if not exists public.garden_track_limits (
  key text not null,
  day date not null,
  count integer not null default 0,
  primary key (key, day)
);
alter table public.garden_track_limits enable row level security;
revoke all on public.garden_track_limits from anon, authenticated;

create or replace function public.track_garden(p_garden uuid, p_metric text, p_source text default '')
returns void language plpgsql security definer set search_path = public, extensions as $$
declare
  src text := left(coalesce(p_source, ''), 40);
  today date := (now() at time zone 'Asia/Tokyo')::date;
  headers json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  ip text := coalesce(headers ->> 'cf-connecting-ip', split_part(coalesce(headers ->> 'x-forwarded-for', ''), ',', 1), '');
  k text;
  n integer;
begin
  if p_metric !~ '^(view|website|shop|taiken|phone|map|instagram|product|product:[0-9a-f-]{36})$' then return; end if;
  if src !~ '^[a-z0-9_-]*$' then src := 'other'; end if;
  if not exists (select 1 from public.gardens where id = p_garden) then return; end if;

  k := md5(ip || '|' || today::text || '|' || p_garden::text);
  insert into public.garden_track_limits (key, day, count) values (k, today, 1)
  on conflict (key, day) do update set count = garden_track_limits.count + 1
  returning count into n;
  if n > 30 then return; end if;
  if random() < 0.01 then delete from public.garden_track_limits where day < today - 2; end if;

  insert into public.garden_stats_daily (garden_id, day, metric, source, count)
  values (p_garden, today, p_metric, src, 1)
  on conflict (garden_id, day, metric, source) do update set count = garden_stats_daily.count + 1;
end $$;
revoke all on function public.track_garden(uuid, text, text) from public;
grant execute on function public.track_garden(uuid, text, text) to anon, authenticated;

-- ── 8. 園の方の変更を記録する（毎晩、運営に GitHub で知らせる） ─────────────────
create table if not exists public.garden_change_log (
  id bigserial primary key,
  garden_id uuid not null,
  user_id uuid,
  table_name text not null,
  action text not null,
  item text,
  changed_fields text[],
  created_at timestamptz not null default now()
);
create index if not exists garden_change_log_created_idx on public.garden_change_log (created_at);
alter table public.garden_change_log enable row level security;
revoke all on public.garden_change_log from anon, authenticated;

create or replace function public.log_garden_change() returns trigger language plpgsql security definer set search_path = public as $$
declare
  fields text[];
  rec jsonb := to_jsonb(coalesce(new, old));
begin
  if tg_op = 'UPDATE' then
    select array_agg(key order by key) into fields
    from jsonb_each(to_jsonb(new)) n
    where key not in ('updated_at', 'updated_by', 'created_at') and n.value is distinct from (to_jsonb(old) -> key);
    if fields is null then return new; end if;
  end if;
  insert into public.garden_change_log (garden_id, user_id, table_name, action, item, changed_fields)
  values ((rec ->> 'garden_id')::uuid, auth.uid(), tg_table_name, lower(tg_op), left(rec ->> 'name', 80), fields);
  return coalesce(new, old);
end $$;
drop trigger if exists log_owner_info on public.garden_owner_info;
create trigger log_owner_info after insert or update on public.garden_owner_info for each row execute function public.log_garden_change();
drop trigger if exists log_products on public.garden_products;
create trigger log_products after insert or update or delete on public.garden_products for each row execute function public.log_garden_change();

-- ── 関数を呼べる人を絞る（Supabase は新しい関数を誰でも呼べる設定にするため） ───────
revoke all on function public.is_garden_member(uuid) from public, anon;
grant execute on function public.is_garden_member(uuid) to authenticated;
revoke all on function public.add_garden_member(text, uuid) from public, anon, authenticated;
revoke all on function public.log_garden_change() from public, anon, authenticated;
revoke all on function public.touch_owner_content() from public, anon, authenticated;
revoke all on function public.garden_products_limit() from public, anon, authenticated;
