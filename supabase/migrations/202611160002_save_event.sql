begin;
-- Invoker rights retain all table grants and RLS. One event is saved atomically.
create or replace function public.save_event(event jsonb, games jsonb) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
 eid uuid := (event->>'id')::uuid; previous public.tournaments; cat uuid; a uuid; b uuid; g jsonb; level_name text; i int;
begin
 if auth.uid() is null then raise exception 'Entre na sua conta para salvar.'; end if;
 select * into previous from public.tournaments where id=eid for update;
 if found then
  if previous.owner_id <> auth.uid() then raise exception 'Somente o proprietário pode alterar este torneio.'; end if;
  if (event->>'updatedAt')::timestamptz is distinct from previous.updated_at then raise exception 'Este torneio foi alterado em outra sessão. Recarregue antes de salvar.'; end if;
  update public.tournaments set name=event->>'name',venue=event->>'venue',city=event->>'city',state=event->>'state',starts_on=(event->>'start')::date,ends_on=(event->>'end')::date,registration_deadline=(event->>'deadline')::date,status=event->>'status',address=coalesce(event->>'address',''),description=coalesce(event->>'description',''),rules=coalesce(event->>'rules',''),public_contact=coalesce(event->>'contact',''),entry_fee=coalesce(event->>'fee',''),prize=coalesce(event->>'prize',''),registration_url=nullif(event->>'url',''),stream_url=nullif(event->>'stream',''),latitude=null,longitude=null where id=eid;
 else
  insert into public.tournaments(id,name,venue,city,state,starts_on,ends_on,registration_deadline,status,address,description,rules,public_contact,entry_fee,prize,registration_url,stream_url,published_at)
  values(eid,event->>'name',event->>'venue',event->>'city',event->>'state',(event->>'start')::date,(event->>'end')::date,(event->>'deadline')::date,event->>'status',coalesce(event->>'address',''),coalesce(event->>'description',''),coalesce(event->>'rules',''),coalesce(event->>'contact',''),coalesce(event->>'fee',''),coalesce(event->>'prize',''),nullif(event->>'url',''),nullif(event->>'stream',''),now());
 end if;
 delete from public.matches where tournament_id=eid;
 delete from public.teams where tournament_id=eid;
 delete from public.tournament_categories where tournament_id=eid;
 for level_name in select jsonb_array_elements_text(event->'categories') loop
  insert into public.tournament_categories(tournament_id,level) values(eid,level_name);
 end loop;
 for g in select value from jsonb_array_elements(games) loop
  select id into strict cat from public.tournament_categories where tournament_id=eid and level=g->>'category' and gender='livre';
  if lower(trim(g->>'teamA'))=lower(trim(g->>'teamB')) then raise exception 'As duplas precisam ser diferentes.'; end if;
  if (g->>'date')::date < (event->>'start')::date or (g->>'date')::date > (event->>'end')::date then raise exception 'A partida deve ocorrer durante o torneio.'; end if;
  insert into public.teams(tournament_id,category_id,name) values(eid,cat,g->>'teamA') returning id into a;
  insert into public.teams(tournament_id,category_id,name) values(eid,cat,g->>'teamB') returning id into b;
  insert into public.matches(id,tournament_id,category_id,team_a_id,team_b_id,round,court,scheduled_at,status)
  values((g->>'id')::uuid,eid,cat,a,b,g->>'round',g->>'court',((g->>'date')||'T'||(g->>'time'))::timestamp at time zone 'America/Sao_Paulo',g->>'status');
  if jsonb_array_length(g->'setsA') <> jsonb_array_length(g->'setsB') then raise exception 'Informe os dois placares.'; end if;
  for i in 0..jsonb_array_length(g->'setsA')-1 loop
   insert into public.match_sets(tournament_id,match_id,set_number,games_a,games_b) values(eid,(g->>'id')::uuid,i+1,(g->'setsA'->>i)::smallint,(g->'setsB'->>i)::smallint);
  end loop;
 end loop;
 return eid;
end;
$$;
revoke all on function public.save_event(jsonb,jsonb) from public,anon;
grant execute on function public.save_event(jsonb,jsonb) to authenticated;
commit;
