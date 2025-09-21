-- Create event-related enums
create type event_price_type as enum ('free', 'paid');
create type event_relation_type as enum ('announcement', 'report', 'summary');

-- Create events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  start_date date not null,
  end_date date not null,
  prefecture text not null,
  venue_name text,
  address text,
  lat double precision,
  lng double precision,
  types jsonb not null default '[]'::jsonb, -- ["exhibition","sale","workshop","lecture"]
  price_type event_price_type not null default 'free',
  price_note text,
  organizer_name text,
  official_url text,
  garden_id uuid references public.gardens(id) on delete set null,
  related_product_tags text[] default '{}',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes for events table
create index on public.events (start_date, end_date);
create index on public.events (prefecture);
create index on public.events using gin (types);
create index on public.events using gin (related_product_tags);

-- Create event_articles junction table
create table if not exists public.event_articles (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  relation_type event_relation_type not null default 'report',
  created_at timestamptz not null default now(),
  unique(event_id, article_id, relation_type)
);

-- Enable Row Level Security (RLS)
alter table public.events enable row level security;
alter table public.event_articles enable row level security;

-- Create RLS policies for public read access
create policy "Events are viewable by everyone"
  on public.events for select
  using (true);

create policy "Event articles are viewable by everyone"
  on public.event_articles for select
  using (true);

-- Create trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

create trigger update_events_updated_at
  before update on public.events
  for each row execute procedure update_updated_at_column();