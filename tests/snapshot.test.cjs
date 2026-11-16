const {test}=require('node:test');const assert=require('node:assert/strict');const {readFileSync}=require('node:fs');const {PGlite}=require('@electric-sql/pglite');
test('snapshot transaction enforces owner, conflict detection and rollback',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
 await db.exec(readFileSync('supabase/migrations/202611160001_initial_schema.sql','utf8'));
 await db.exec(readFileSync('supabase/migrations/202611160002_save_event.sql','utf8'));
 const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222',id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 await db.query('insert into auth.users(id) values($1),($2)',[A,B]);
 const event={id,name:'Copa',venue:'Arena',city:'Santos',state:'SP',start:'2026-11-20',end:'2026-11-21',deadline:'2026-11-19',categories:['B'],status:'open'};
 async function save(user,t,m=[]){await db.exec(`reset role;select set_config('request.jwt.claim.sub','${user}',false);set role authenticated;`);return db.query('select public.save_event($1,$2)',[t,m]);}
 await save(A,event);
 await assert.rejects(save(B,event),/proprietário|duplicate key/);
 await save(A,{...event,updatedAt:(await db.query('select updated_at from public.tournaments')).rows[0].updated_at});
 const row=(await db.query('select * from public.tournaments')).rows[0];
 await assert.rejects(save(A,{...event,updatedAt:'2000-01-01T00:00:00Z'}),/alterado/);
 await assert.rejects(save(A,{...event,updatedAt:row.updated_at},[{id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',category:'B',teamA:'Ana',teamB:'Bia',round:'Final',court:'Quadra 1',date:event.start,time:'10:00',status:'finished',setsA:[-1],setsB:[4]}]),/check constraint/);
 assert.equal((await db.query('select count(*)::int as n from public.matches')).rows[0].n,0);
 const game={id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',category:'B',teamA:'Ana / Bia',teamB:'Clara / Dani',round:'Final',court:'Quadra 1',date:event.start,time:'10:00',status:'live',setsA:[6],setsB:[4]};
 await save(A,{...event,updatedAt:row.updated_at},[game]);
 assert.equal((await db.query('select games_a from public.match_sets')).rows[0].games_a,6);
 const stamp=(await db.query('select updated_at from public.tournaments')).rows[0].updated_at;
 await save(A,{...event,updatedAt:stamp},[{...game,status:'finished',setsA:[6,6],setsB:[4,3]}]);
 assert.equal((await db.query('select count(*)::int as n from public.match_sets')).rows[0].n,2);
 await db.exec(`reset role;set role anon;`);
 assert.equal((await db.query('select count(*)::int as n from public.match_sets')).rows[0].n,2);
 await assert.rejects(db.query('select public.save_event($1,$2)',[event,[]]),/permission denied/);
 }finally{await db.close();}
});
