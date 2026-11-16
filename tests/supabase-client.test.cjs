const test=require('node:test');
const assert=require('node:assert/strict');
const {createClient}=require('../dist/supabase-client.js');
test('public catalog uses public key without user credentials',async()=>{
 let request;
 const client=createClient({url:'https://example.supabase.co',key:'public-key',fetch:async(url,options)=>{request={url,options};return {ok:true,json:async()=>[]};}});
 assert.deepEqual(await client.listTournaments(),[]);
 assert.equal(request.options.headers.apikey,'public-key');
 assert.equal(request.options.headers.Authorization,undefined);
 assert.match(request.url,/published_at=not.is.null/);
});
test('API errors are surfaced rather than treated as an empty catalog',async()=>{
 const client=createClient({url:'https://example.supabase.co',key:'public-key',fetch:async()=>({ok:false,status:503,json:async()=>({message:'Unavailable'})})});
 await assert.rejects(client.listTournaments(),/Unavailable/);
});
