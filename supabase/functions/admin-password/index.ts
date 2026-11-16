// Admin credentials are read exclusively from the Edge Function environment.
export function createHandler(env,request=fetch){
 const allowed=new Set(['https://zukaplay.com.br','https://www.zukaplay.com.br','https://zuka-play.pages.dev']);
 return async(req)=>{
  const origin=req.headers.get('Origin');const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};
  if(origin&&allowed.has(origin)){headers['Access-Control-Allow-Origin']=origin;headers['Access-Control-Allow-Headers']='authorization, apikey, content-type';headers['Access-Control-Allow-Methods']='POST, OPTIONS';}
  const reply=(status,message)=>new Response(JSON.stringify({message}),{status,headers});
  if(origin&&!allowed.has(origin))return reply(403,'Origem não permitida.');
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(req.method!=='POST')return reply(405,'Método não permitido.');
  const authorization=req.headers.get('Authorization');if(!authorization?.startsWith('Bearer '))return reply(401,'Entre novamente.');
  try{
   const userHeaders={apikey:env.SUPABASE_ANON_KEY,Authorization:authorization,'Content-Type':'application/json'};
   const identity=await request(env.SUPABASE_URL+'/auth/v1/user',{headers:userHeaders,signal:AbortSignal.timeout(10000)});
   if(!identity.ok)return reply(401,'Sessão inválida.');
   const permission=await request(env.SUPABASE_URL+'/rest/v1/rpc/is_super_admin',{method:'POST',headers:userHeaders,body:'{}',signal:AbortSignal.timeout(10000)});
   if(!permission.ok||await permission.json()!==true)return reply(403,'Acesso restrito ao superadministrador.');
   const raw=await req.text();if(raw.length>4096)return reply(400,'Solicitação inválida.');
   const {userId,password}=JSON.parse(raw);
   if(typeof userId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)||typeof password!=='string'||password.length<8||password.length>128)return reply(400,'Use uma senha de 8 a 128 caracteres.');
   const serverHeaders={apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'};
   const profile=await request(env.SUPABASE_URL+'/rest/v1/organizer_profiles?select=id&id=eq.'+userId,{headers:serverHeaders,signal:AbortSignal.timeout(10000)});
   if(!profile.ok||(await profile.json()).length!==1)return reply(404,'Organizador não encontrado.');
   const updated=await request(env.SUPABASE_URL+'/auth/v1/admin/users/'+userId,{method:'PUT',headers:serverHeaders,body:JSON.stringify({password}),signal:AbortSignal.timeout(10000)});
   if(!updated.ok)return reply(400,'Não foi possível alterar a senha. Verifique os requisitos e tente novamente.');
   return reply(200,'Senha alterada.');
  }catch{return reply(500,'Não foi possível concluir a operação. Tente novamente.');}
 };
}
if(typeof Deno!=='undefined')Deno.serve(createHandler({SUPABASE_URL:Deno.env.get('SUPABASE_URL'),SUPABASE_ANON_KEY:Deno.env.get('SUPABASE_ANON_KEY'),SUPABASE_SERVICE_ROLE_KEY:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}));
