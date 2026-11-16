'use strict';
(function(root){
 function createClient({url,key,fetch:request=root.fetch.bind(root)}){
  async function read(path){
   const response=await request(url+'/rest/v1/'+path,{headers:{apikey:key,Accept:'application/json'}});
   const data=await response.json();
   if(!response.ok)throw new Error(data.message||'Não foi possível consultar o banco.');
   return data;
  }
  return {
   listTournaments:()=>read('tournaments?select=*,tournament_categories(*)&published_at=not.is.null&order=starts_on.asc'),
   listMatches:()=>read('matches?select=*,tournament_categories(level),team_a:teams!matches_team_a_id_category_id_tournament_id_fkey(name),team_b:teams!matches_team_b_id_category_id_tournament_id_fkey(name),match_sets(*)&order=scheduled_at.asc')
  };
 }
 const api={createClient};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.ZukaSupabase=api;
})(globalThis);
