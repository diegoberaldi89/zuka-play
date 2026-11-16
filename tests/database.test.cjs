const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');

// Real PostgreSQL policies in an isolated embedded database. Only Supabase's
// auth schema/JWT context are fixtures; no production permission logic is mocked.
test('database enforces public reading and single-organizer ownership',async t=>{
 const db=new PGlite();
 const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
 const TA='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',TB='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',DRAFT='dddddddd-dddd-4ddd-8ddd-dddddddddddd';
 async function as(role,id,sql,params=[]){
  await db.exec(`reset role; select set_config('request.jwt.claim.sub','${id||''}',false); set role ${role};`);
  return db.query(sql,params);
 }
 try{
 await db.exec(`create role anon nologin;create role authenticated nologin;create schema auth;
 create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`);
 await db.exec(readFileSync('supabase/migrations/202611160001_initial_schema.sql','utf8'));
 assert.ok((await db.query("select to_regclass('public.tournaments') as name")).rows[0].name,'Migration must create tournament storage');
 await db.query('insert into auth.users(id,raw_user_meta_data) values($1,$3),($2,$3)',[A,B,{display_name:'Organizador de teste'}]);
 async function tournament(id,name){return as('authenticated',id===TB?B:A,`insert into public.tournaments(id,name,venue,city,state,starts_on,ends_on,registration_deadline,published_at) values($1,$2,'Arena','Campinas','SP','2026-11-20','2026-11-22','2026-11-19',$3) returning *`,[id,name,id===DRAFT?null:'2026-11-16T12:00:00Z']);}
 await tournament(TA,'Evento A');await tournament(TB,'Evento B');await tournament(DRAFT,'Rascunho A');
 await t.test('anonymous visitors see only published tournaments',async()=>{
  const r=await as('anon',null,'select name from public.tournaments order by name');assert.deepEqual(r.rows.map(x=>x.name),['Evento A','Evento B']);
 });
 await t.test('anonymous visitors cannot create tournaments',async()=>{
  await assert.rejects(as('anon',null,"insert into public.tournaments(name,venue,city,state,starts_on,ends_on,registration_deadline) values('Intruso','Arena','Campinas','SP','2026-11-20','2026-11-22','2026-11-19')"),/permission denied|row-level security/);
 });
 await t.test('owner sees their drafts but another organizer cannot',async()=>{
  assert.equal((await as('authenticated',A,'select id from public.tournaments where id=$1',[DRAFT])).rows.length,1);
  assert.equal((await as('authenticated',B,'select id from public.tournaments where id=$1',[DRAFT])).rows.length,0);
 });
 await t.test('owner can edit their event',async()=>{assert.equal((await as('authenticated',A,"update public.tournaments set name='Evento A atualizado' where id=$1 returning id",[TA])).rows.length,1);});
 await t.test('another organizer cannot edit or delete a public event',async()=>{
  assert.equal((await as('authenticated',B,"update public.tournaments set name='Ataque' where id=$1 returning id",[TA])).rows.length,0);
  assert.equal((await as('authenticated',B,'delete from public.tournaments where id=$1 returning id',[TA])).rows.length,0);
 });
 await t.test('ownership cannot be transferred by a client',async()=>{await assert.rejects(as('authenticated',A,'update public.tournaments set owner_id=$1 where id=$2',[B,TA]),/permission denied|row-level security/);});
 await t.test('new events cannot impersonate another owner',async()=>{await assert.rejects(as('authenticated',B,"insert into public.tournaments(owner_id,name,venue,city,state,starts_on,ends_on,registration_deadline) values($1,'Ataque','Arena','Campinas','SP','2026-11-20','2026-11-22','2026-11-19')",[A]),/row-level security/);});
 let categoryA,categoryB,team1,team2,match;
 await t.test('owner creates category, teams, match and score',async()=>{
  categoryA=(await as('authenticated',A,"insert into public.tournament_categories(tournament_id,level) values($1,'C') returning id",[TA])).rows[0].id;
  categoryB=(await as('authenticated',B,"insert into public.tournament_categories(tournament_id,level) values($1,'C') returning id",[TB])).rows[0].id;
  team1=(await as('authenticated',A,"insert into public.teams(tournament_id,category_id,name) values($1,$2,'Ana / Bia') returning id",[TA,categoryA])).rows[0].id;
  team2=(await as('authenticated',A,"insert into public.teams(tournament_id,category_id,name) values($1,$2,'Clara / Dani') returning id",[TA,categoryA])).rows[0].id;
  match=(await as('authenticated',A,"insert into public.matches(tournament_id,category_id,team_a_id,team_b_id,round,court) values($1,$2,$3,$4,'Final','Quadra 1') returning id",[TA,categoryA,team1,team2])).rows[0].id;
  await as('authenticated',A,'insert into public.match_sets(tournament_id,match_id,set_number,games_a,games_b) values($1,$2,1,6,4)',[TA,match]);
  assert.equal((await as('anon',null,'select games_a,games_b from public.match_sets where match_id=$1',[match])).rows[0].games_a,6);
 });
 await t.test('another organizer cannot add children or change scores',async()=>{
  await assert.rejects(as('authenticated',B,"insert into public.tournament_categories(tournament_id,level) values($1,'D')",[TA]),/row-level security/);
  assert.equal((await as('authenticated',B,'update public.match_sets set games_a=99 where match_id=$1 returning id',[match])).rows.length,0);
 });
 await t.test('category cannot be linked across tournaments',async()=>{await assert.rejects(as('authenticated',A,"insert into public.teams(tournament_id,category_id,name) values($1,$2,'Equipe inválida')",[TA,categoryB]),/foreign key/);});
 await t.test('negative scores and inverted dates are rejected',async()=>{
  await assert.rejects(as('authenticated',A,'update public.match_sets set games_a=-1 where match_id=$1',[match]),/check constraint/);
  await assert.rejects(as('authenticated',A,"update public.tournaments set ends_on='2026-11-01' where id=$1",[TA]),/check constraint/);
 });
 await t.test('profiles are private to each organizer',async()=>{
  assert.equal((await as('anon',null,'select * from public.organizer_profiles')).rows.length,0);
  assert.equal((await as('authenticated',A,'select id from public.organizer_profiles')).rows.length,1);
  assert.equal((await as('authenticated',A,'select id from public.organizer_profiles where id=$1',[B])).rows.length,0);
 });
 await t.test('organizers cannot change database structure or permissions',async()=>{
  await assert.rejects(as('authenticated',A,'alter table public.tournaments add column attack text'),/must be owner|permission denied/);
  await assert.rejects(as('authenticated',A,'truncate public.tournaments cascade'),/permission denied/);
  await assert.rejects(as('authenticated',A,'create table public.attack(id int)'),/permission denied/);
 });
 }finally{await db.close();}
});
