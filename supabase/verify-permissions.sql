-- Read-only audit, safe to rerun through the Supabase SQL Editor.
select c.relname as table_name,
 c.relrowsecurity as rls_enabled,
 has_table_privilege('anon',c.oid,'INSERT,UPDATE,DELETE') as anonymous_can_write,
 has_schema_privilege('authenticated','public','CREATE') as organizer_can_create_tables
from pg_class c
join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r'
order by c.relname;

select tablename,policyname,roles,cmd
from pg_policies where schemaname='public'
order by tablename,policyname;
