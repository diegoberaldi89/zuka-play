'use strict';
(function(root){
 function tournamentFromRow(row){
  return {id:row.id,name:row.name,poster:row.name,venue:row.venue,city:row.city,state:row.state,start:row.starts_on,end:row.ends_on,deadline:row.registration_deadline,status:row.status,categories:[...new Set((row.tournament_categories||[]).map(c=>c.level))],coords:row.latitude==null||row.longitude==null?null:[row.latitude,row.longitude],description:row.description||'',address:row.address||'',contact:row.public_contact||'',fee:row.entry_fee||'',prize:row.prize||'',rules:row.rules||'',url:row.registration_url||'',stream:row.stream_url||'',palette:0,demo:false,updatedAt:row.updated_at};
 }
 const api={tournamentFromRow};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.ZukaSupabaseMapping=api;
})(globalThis);
