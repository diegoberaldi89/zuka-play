-- Zuka Play: PostgreSQL storage and single-owner authorization.
-- Apply once through Supabase migrations, never through a public browser client.
begin;

revoke create on schema public from public, anon, authenticated;
grant usage on schema public to anon, authenticated;

create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create table public.organizer_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (char_length(trim(display_name)) between 1 and 100),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.tournaments (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
 name text not null check (char_length(trim(name)) between 1 and 100),
 venue text not null check (char_length(trim(venue)) between 1 and 100),
 city text not null check (char_length(trim(city)) between 1 and 100),
 municipality_code text check (municipality_code ~ '^[0-9]{7}$'),
 state text not null check (state in ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),
 address text not null default '' check (char_length(address) <= 300),
 latitude double precision check (latitude between -90 and 90),
 longitude double precision check (longitude between -180 and 180),
 timezone text not null default 'America/Sao_Paulo',
 starts_on date not null,
 ends_on date not null,
 registration_deadline date not null,
 status text not null default 'open' check (status in ('open','upcoming','live','finished','postponed','cancelled')),
 description text not null default '' check (char_length(description) <= 4000),
 rules text not null default '' check (char_length(rules) <= 10000),
 public_contact text not null default '' check (char_length(public_contact) <= 200),
 entry_fee text not null default '' check (char_length(entry_fee) <= 100),
 prize text not null default '' check (char_length(prize) <= 200),
 registration_url text check (registration_url ~ '^https?://[^[:space:]]+$'),
 stream_url text check (stream_url ~ '^https?://[^[:space:]]+$'),
 published_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (ends_on >= starts_on),
 check (registration_deadline <= ends_on),
 check ((latitude is null) = (longitude is null))
);

create table public.tournament_categories (
 id uuid primary key default gen_random_uuid(),
 tournament_id uuid not null references public.tournaments(id) on delete cascade,
 level text not null check (level in ('Profissional','A','B','C','D','Iniciante')),
 gender text not null default 'livre' check (gender in ('masculina','feminina','mista','livre')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (id,tournament_id),
 unique (tournament_id,level,gender)
);

create table public.teams (
 id uuid primary key default gen_random_uuid(),
 tournament_id uuid not null references public.tournaments(id) on delete cascade,
 category_id uuid not null,
 name text not null check (char_length(trim(name)) between 1 and 160),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (id,category_id,tournament_id),
 foreign key (category_id,tournament_id) references public.tournament_categories(id,tournament_id) on delete cascade
);

create table public.matches (
 id uuid primary key default gen_random_uuid(),
 tournament_id uuid not null references public.tournaments(id) on delete cascade,
 category_id uuid not null,
 team_a_id uuid not null,
 team_b_id uuid not null,
 round text not null check (char_length(trim(round)) between 1 and 100),
 court text not null default '' check (char_length(court) <= 100),
 scheduled_at timestamptz,
 status text not null default 'scheduled' check (status in ('scheduled','live','finished','cancelled')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (id,tournament_id),
 check (team_a_id <> team_b_id),
 foreign key (category_id,tournament_id) references public.tournament_categories(id,tournament_id) on delete cascade,
 foreign key (team_a_id,category_id,tournament_id) references public.teams(id,category_id,tournament_id),
 foreign key (team_b_id,category_id,tournament_id) references public.teams(id,category_id,tournament_id)
);

create table public.match_sets (
 id uuid primary key default gen_random_uuid(),
 tournament_id uuid not null references public.tournaments(id) on delete cascade,
 match_id uuid not null,
 set_number smallint not null check (set_number between 1 and 3),
 games_a smallint not null check (games_a between 0 and 99),
 games_b smallint not null check (games_b between 0 and 99),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (match_id,set_number),
 foreign key (match_id,tournament_id) references public.matches(id,tournament_id) on delete cascade
);

create index tournaments_owner_idx on public.tournaments(owner_id);
create index tournaments_discovery_idx on public.tournaments(state,city,starts_on) where published_at is not null;
create index tournaments_status_idx on public.tournaments(status,starts_on) where published_at is not null;
create index categories_event_idx on public.tournament_categories(tournament_id);
create index teams_category_idx on public.teams(category_id,tournament_id);
create index matches_event_schedule_idx on public.matches(tournament_id,scheduled_at);
create index matches_team_a_idx on public.matches(team_a_id,category_id,tournament_id);
create index matches_team_b_idx on public.matches(team_b_id,category_id,tournament_id);
create index match_sets_event_idx on public.match_sets(tournament_id);

create function app_private.touch_updated_at() returns trigger
 language plpgsql set search_path = '' as $$
begin
 new.updated_at = now();
 return new;
end;
$$;
revoke all on function app_private.touch_updated_at() from public, anon, authenticated;

-- Only the Auth trigger creates profiles. Users cannot choose an admin role.
create function app_private.create_organizer_profile() returns trigger
 language plpgsql security definer set search_path = '' as $$
begin
 insert into public.organizer_profiles(id,display_name)
 values (new.id,coalesce(nullif(left(trim(new.raw_user_meta_data ->> 'display_name'),100),''),'Organizador'));
 return new;
end;
$$;
revoke all on function app_private.create_organizer_profile() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
 for each row execute function app_private.create_organizer_profile();

-- Preserve existing Auth accounts when applying to an empty application schema.
insert into public.organizer_profiles(id,display_name)
 select id,coalesce(nullif(left(trim(raw_user_meta_data ->> 'display_name'),100),''),'Organizador') from auth.users;

do $$
declare table_name text;
begin
 foreach table_name in array array['organizer_profiles','tournaments','tournament_categories','teams','matches','match_sets'] loop
  execute format('alter table public.%I enable row level security',table_name);
  execute format('revoke all on table public.%I from public, anon, authenticated',table_name);
  execute format('grant select on table public.%I to anon, authenticated',table_name);
  execute format('create trigger touch_updated_at before update on public.%I for each row execute function app_private.touch_updated_at()',table_name);
 end loop;
end;
$$;

grant update (display_name) on public.organizer_profiles to authenticated;
create policy profile_read_own on public.organizer_profiles for select to authenticated
 using (id = (select auth.uid()));
create policy profile_update_own on public.organizer_profiles for update to authenticated
 using (id = (select auth.uid())) with check (id = (select auth.uid()));

grant insert,delete on public.tournaments to authenticated;
-- No UPDATE privilege for owner_id, id or creation metadata.
grant update (name,venue,city,municipality_code,state,address,latitude,longitude,timezone,starts_on,ends_on,registration_deadline,status,description,rules,public_contact,entry_fee,prize,registration_url,stream_url,published_at) on public.tournaments to authenticated;
create policy tournament_public_read on public.tournaments for select to anon,authenticated
 using (published_at is not null or owner_id = (select auth.uid()));
create policy tournament_owner_insert on public.tournaments for insert to authenticated
 with check (owner_id = (select auth.uid()));
create policy tournament_owner_update on public.tournaments for update to authenticated
 using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy tournament_owner_delete on public.tournaments for delete to authenticated
 using (owner_id = (select auth.uid()));

do $$
declare table_name text;
begin
 foreach table_name in array array['tournament_categories','teams','matches','match_sets'] loop
  execute format('grant insert,update,delete on table public.%I to authenticated',table_name);
  -- Parent RLS determines whether a visitor may see this event and its children.
  execute format('create policy event_visible on public.%I for select to anon,authenticated using (exists (select 1 from public.tournaments t where t.id = tournament_id))',table_name);
  execute format('create policy owner_insert on public.%I for insert to authenticated with check (exists (select 1 from public.tournaments t where t.id = tournament_id and t.owner_id = (select auth.uid())))',table_name);
  execute format('create policy owner_update on public.%I for update to authenticated using (exists (select 1 from public.tournaments t where t.id = tournament_id and t.owner_id = (select auth.uid()))) with check (exists (select 1 from public.tournaments t where t.id = tournament_id and t.owner_id = (select auth.uid())))',table_name);
  execute format('create policy owner_delete on public.%I for delete to authenticated using (exists (select 1 from public.tournaments t where t.id = tournament_id and t.owner_id = (select auth.uid())))',table_name);
 end loop;
end;
$$;

commit;
