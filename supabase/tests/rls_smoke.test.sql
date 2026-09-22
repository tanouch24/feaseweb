-- À exécuter avec `supabase test db` dans un environnement local/test.
-- Ce fichier documente les invariants minimum; il ne contient aucune donnée réelle.
begin;

select plan(4);
select has_table('public', 'profiles', 'profiles existe');
select has_table('public', 'prospects', 'prospects existe');
select has_table('public', 'internal_notes', 'notes internes existent');
select rls_enabled('public', 'prospects', 'RLS prospects activée');

select * from finish();
rollback;
