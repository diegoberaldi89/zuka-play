const {test}=require('node:test');const assert=require('node:assert/strict');const {readFileSync}=require('node:fs');const {PGlite}=require('@electric-sql/pglite');
test('only singleton admin can read identities and edit other events',async()=>{
 const db=new PGlite();try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
 for(const file of ['202611160001_initial_schema.sql','202611160002_save_event.sql','202611160003_super_admin.sql','202611160004_tournament_fields.sql'])await db.exec(readFileSync('supabase/migrations/'+file,'utf8'));
 const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
 await db.query('insert into auth.users(id,email) values($1,$3),($2,$4)',[A,B,'admin@example.test','owner@example.test']);
 await db.query('insert into app_private.super_admin(user_id) values($1)',[A]);
 await assert.rejects(db.query('insert into app_private.super_admin(user_id) values($1)',[B]),/duplicate key/);
 async function as(id){await db.exec(`reset role;select set_config('request.jwt.claim.sub','${id}',false);set role authenticated;`);}
 await as(B);assert.equal((await db.query('select public.is_super_admin() as yes')).rows[0].yes,false);
 await assert.rejects(db.query('select * from public.list_organizers()'),/restrito/);
 await assert.rejects(db.query('insert into app_private.super_admin(user_id) values($1)',[B]),/permission denied/);
 const event={id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',name:'Copa',venue:'Arena',city:'Santos',state:'SP',start:'2026-11-20',end:'2026-11-21',deadline:'2026-11-19',categories:['B'],status:'open',fees:[100,0,50,null],prizeAmount:1234.5,street:'Rua Um',number:'100',neighborhood:'Centro',postalCode:'12345-678'};
 await db.query('select public.save_event($1,$2)',[event,[]]);
 const fields=(await db.query('select * from public.tournaments')).rows[0];assert.equal(fields.name,'COPA');assert.equal(Number(fields.entry_fee_amount),100);assert.equal(Number(fields.second_entry_fee),0);assert.equal(fields.fourth_entry_fee,null);assert.equal(Number(fields.prize_amount),1234.5);assert.equal(fields.street,'Rua Um');assert.equal(fields.postal_code,'12345-678');
 const stamp=(await db.query('select updated_at from public.tournaments')).rows[0].updated_at;
 await as(A);assert.equal((await db.query('select * from public.list_organizers()')).rows.length,2);
 await db.query('select public.save_event($1,$2)',[{...event,name:'Alterado pelo admin',updatedAt:stamp},[]]);
 assert.equal((await db.query('select owner_id from public.tournaments')).rows[0].owner_id,B);
 await db.exec("reset role;select set_config('request.jwt.claim.sub','',false);set role anon;");assert.equal((await db.query('select public.is_super_admin() as yes')).rows[0].yes,false);
 await assert.rejects(db.query('select * from public.list_organizers()'),/permission denied/);
 }finally{await db.close();}
});
