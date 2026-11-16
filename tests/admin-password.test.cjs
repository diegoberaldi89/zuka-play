const {test}=require('node:test');const assert=require('node:assert/strict');
test('password endpoint requires verified admin before privileged calls',async()=>{
 const {createHandler}=await import('../supabase/functions/admin-password/index.ts');
 const env={SUPABASE_URL:'https://db.example',SUPABASE_ANON_KEY:'public',SUPABASE_SERVICE_ROLE_KEY:'server-only'};let calls=[];
 const response=x=>new Response(JSON.stringify(x));
 let admin=false;
 const handler=createHandler(env,async(url,options)=>{calls.push({url,options});if(url.endsWith('/auth/v1/user'))return response({id:'self'});if(url.endsWith('/rpc/is_super_admin'))return response(admin);if(url.includes('/organizer_profiles?'))return response([{id:'target'}]);return response({id:'target'});});
 const req=()=>new Request('https://function.example',{method:'POST',headers:{Origin:'https://zukaplay.com.br',Authorization:'Bearer user-token'},body:JSON.stringify({userId:'11111111-1111-4111-8111-111111111111',password:'TestPassword123!'})});
 assert.equal((await handler(new Request('https://function.example',{method:'POST'}))).status,401);
 assert.equal((await handler(req())).status,403);assert.equal(calls.some(c=>c.options.headers.apikey==='server-only'),false);
 admin=true;calls=[];const result=await handler(req());assert.equal(result.status,200);const text=await result.text();assert.ok(!text.includes('TestPassword'));assert.ok(!text.includes('server-only'));
 assert.equal(calls.at(-1).options.method,'PUT');assert.equal(calls.at(-1).options.headers.Authorization,'Bearer server-only');
 assert.equal((await handler(new Request('https://function.example',{method:'POST',headers:{Origin:'https://evil.example',Authorization:'Bearer token'}}))).status,403);
});
