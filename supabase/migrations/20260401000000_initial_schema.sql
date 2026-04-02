-- Pause Mantra — Initial Schema
-- All tables require RLS. Default policy: auth.uid() = user_id

-- user_settings
create table public.user_settings (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid references auth.users not null unique,
  gate_delay_seconds          int default 3,           -- 0 | 3 | 5 | 10
  reflection_prompts_enabled  boolean default false,   -- Pro only
  master_mantra_active        boolean default false,
  gate_mantra_id              uuid,                    -- references master_mantras (added after table exists)
  subscription_status         text default 'trial',    -- 'trial' | 'active' | 'paused'
  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now()
);

alter table public.user_settings enable row level security;
create policy "Users manage own settings" on public.user_settings
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_gated_apps
create table public.user_gated_apps (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users not null,
  app_name      text not null,
  bundle_id     text,           -- iOS
  package_name  text,           -- Android
  created_at    timestamptz default now()
);

alter table public.user_gated_apps enable row level security;
create policy "Users manage own gated apps" on public.user_gated_apps
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- mantras (master library — 10K+ rows at launch)
create table public.mantras (
  id          uuid primary key default gen_random_uuid(),
  text        text not null,
  category    text not null,   -- one of 15 categories
  source      text default 'curated', -- 'curated' | 'ai' | 'custom'
  active      boolean default true,
  created_at  timestamptz default now()
);

alter table public.mantras enable row level security;
create policy "Mantras are readable by all authenticated users" on public.mantras
  for select using (auth.role() = 'authenticated');

-- seen_mantras (lifetime dedup — MNTR-03)
create table public.seen_mantras (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  mantra_id   uuid references public.mantras not null,
  seen_at     timestamptz default now(),
  show_again  boolean default false,
  unique(user_id, mantra_id)
);

alter table public.seen_mantras enable row level security;
create policy "Users manage own seen mantras" on public.seen_mantras
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- liked_mantras (hearts)
create table public.liked_mantras (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  mantra_id   uuid references public.mantras not null,
  created_at  timestamptz default now(),
  deleted_at  timestamptz,     -- soft delete
  unique(user_id, mantra_id)
);

alter table public.liked_mantras enable row level security;
create policy "Users manage own liked mantras" on public.liked_mantras
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- master_mantras (AI synthesised)
create table public.master_mantras (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users not null,
  mantra_text     text not null,
  liked_count     int not null,
  created_at      timestamptz default now()
);

alter table public.master_mantras enable row level security;
create policy "Users manage own master mantras" on public.master_mantras
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Add FK from user_settings to master_mantras now that table exists
alter table public.user_settings
  add constraint fk_gate_mantra
  foreign key (gate_mantra_id) references public.master_mantras(id);

-- gate_events
create table public.gate_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  app_name    text not null,
  mantra_id   uuid references public.mantras,
  outcome     text not null,   -- 'entered' | 'closed'
  created_at  timestamptz default now()
);

alter table public.gate_events enable row level security;
create policy "Users manage own gate events" on public.gate_events
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- gate_notes (reflection journal — Base feature)
create table public.gate_notes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users not null,
  gate_event_id  uuid references public.gate_events not null,
  note_text      text not null,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

alter table public.gate_notes enable row level security;
create policy "Users manage own gate notes" on public.gate_notes
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_goals (onboarding category selection)
create table public.user_goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  goal        text not null,
  created_at  timestamptz default now()
);

alter table public.user_goals enable row level security;
create policy "Users manage own goals" on public.user_goals
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Required indexes
create index idx_gate_events_user_date on public.gate_events (user_id, created_at desc);
create index idx_gate_notes_event on public.gate_notes (gate_event_id);
create index idx_liked_mantras_user on public.liked_mantras (user_id);
create index idx_master_mantras_user_date on public.master_mantras (user_id, created_at desc);
create index idx_seen_mantras_user_mantra on public.seen_mantras (user_id, mantra_id);
create index idx_mantras_category on public.mantras (category);
