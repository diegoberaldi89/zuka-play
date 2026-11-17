'use strict';
// Only the publishable key belongs in a browser. RLS remains authoritative.
const backend = (()=>{
 const url='https://zetarilmjhsqxrvnqnxp.supabase.co',key='sb_publishable_WWDosDYp0LvlmXxNmFhgAA_7JJ7bEea',storageKey='zuka-auth:v1';
 let session=null,refreshing=null;
 try{session=JSON.parse(localStorage.getItem(storageKey));}catch{}
 function remember(s){session=s;try{if(s)localStorage.setItem(storageKey,JSON.stringify(s));else localStorage.removeItem(storageKey);}catch{}}
 async function request(path,method='GET',body,token){
  const headers={apikey:key,'Content-Type':'application/json'};if(token)headers.Authorization='Bearer '+token;
  const res=await fetch(url+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
  const raw=await res.text();let data;try{data=raw?JSON.parse(raw):null;}catch{throw new Error('O serviço retornou uma resposta inválida.');}
  if(!res.ok){const message=data?.msg||data?.message||data?.error_description||data?.error||'Não foi possível concluir a operação.';throw new Error(message==='Invalid login credentials'?'E-mail ou senha incorretos.':message==='Email not confirmed'?'Confirme seu e-mail antes de entrar.':message);}
  return data;
 }
 async function token(){
  if(!session)return undefined;
  if(session.expires_at*1000>Date.now()+60000)return session.access_token;
  if(!refreshing)refreshing=request('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:session.refresh_token}).then(s=>{remember(s);return s.access_token;}).catch(e=>{remember(null);throw e;}).finally(()=>refreshing=null);
  return refreshing;
 }
 async function rest(path,method='GET',body){return request('/rest/v1/'+path,method,body,await token());}
 return {
  user:()=>session?.user||null,
  async login(email,password){remember(await request('/auth/v1/token?grant_type=password','POST',{email,password}));},
  async signup(email,password,name){const r=await request('/auth/v1/signup?redirect_to='+encodeURIComponent(location.origin+'/'),'POST',{email,password,data:{display_name:name}});if(r.access_token)remember(r);return r;},
  async logout(){try{await request('/auth/v1/logout','POST',{},await token());}finally{remember(null);}},
  recover:email=>request('/auth/v1/recover?redirect_to='+encodeURIComponent(location.origin+'/'),'POST',{email}),
  async password(password){await request('/auth/v1/user','PUT',{password},await token());},
  async callback(){const h=new URLSearchParams(location.hash.slice(1));if(h.has('access_token')){const s={access_token:h.get('access_token'),refresh_token:h.get('refresh_token'),expires_at:Math.floor(Date.now()/1000)+Number(h.get('expires_in')||3600)};s.user=await request('/auth/v1/user','GET',undefined,s.access_token);remember(s);history.replaceState(null,'','#organizador');return h.get('type')==='recovery';}if(h.has('error_description')){const message=h.get('error_description');history.replaceState(null,'','#organizador');throw new Error(message);}return false;},
  async load(){
   const [tournaments,matches]=await Promise.all([rest('tournaments?select=*,tournament_categories(*)&order=starts_on.asc'),rest('matches?select=*,tournament_categories(level),team_a:teams!matches_team_a_id_category_id_tournament_id_fkey(name),team_b:teams!matches_team_b_id_category_id_tournament_id_fkey(name),match_sets(*)&order=scheduled_at.asc')]);
   const isAdmin=session?await rest('rpc/is_super_admin','POST',{}):false;const organizers=isAdmin?await rest('rpc/list_organizers','POST',{}):[];
   return {isAdmin,organizers,tournaments:tournaments.map(r=>({...ZukaSupabaseMapping.tournamentFromRow(r),ownerId:r.owner_id})),matches:matches.map(r=>{const parts=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(r.scheduled_at));const sets=r.match_sets.sort((a,b)=>a.set_number-b.set_number);return {id:r.id,tournamentId:r.tournament_id,teamA:r.team_a.name,teamB:r.team_b.name,category:r.tournament_categories.level,round:r.round,court:r.court,date:parts.slice(0,10),time:parts.slice(11,16),status:r.status,setsA:sets.map(s=>s.games_a),setsB:sets.map(s=>s.games_b),updatedAt:r.updated_at};})};
  },
  save:(event,games)=>rest('rpc/save_event','POST',{event,games}),
  async remove(id){const r=await fetch(url+'/rest/v1/tournaments?id=eq.'+encodeURIComponent(id),{method:'DELETE',headers:{apikey:key,Authorization:'Bearer '+await token(),Prefer:'return=representation'}});const data=await r.json();if(!r.ok||!Array.isArray(data)||!data.length)throw new Error('Não foi possível excluir o torneio.');},
  async adminPassword(userId,password){return request('/functions/v1/admin-password','POST',{userId,password},await token());},
  async uploadBanner(file){const error=ZukaBanner.validate(file);if(error)throw new Error(error);if(!session?.user)throw new Error('Entre para enviar o banner.');const path=session.user.id+'/'+crypto.randomUUID()+'.'+ZukaBanner.types[file.type];const res=await fetch(url+'/storage/v1/object/tournament-banners/'+path,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+await token(),'Content-Type':file.type,'Cache-Control':'3600'},body:file});if(!res.ok)throw new Error('Não foi possível enviar o banner. Tente novamente.');return path;},
  async deleteBanner(path){if(!ZukaBanner.url(path))return;const r=await fetch(url+'/storage/v1/object/tournament-banners',{method:'DELETE',headers:{apikey:key,Authorization:'Bearer '+await token(),'Content-Type':'application/json'},body:JSON.stringify({prefixes:[path]})});if(!r.ok)throw new Error('Não foi possível remover o arquivo anterior.');},
  syncSession(){try{session=JSON.parse(localStorage.getItem(storageKey));}catch{session=null;}}
 };
})();
