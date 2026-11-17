'use strict';
(function(root){
 const types={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
 const pattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/i;
 function validate(file){return !types[file?.type]?'Escolha uma imagem JPG, PNG ou WebP.':!file.size||file.size>5*1024*1024?'A imagem deve ter até 5 MB e não pode estar vazia.':'';}
 function url(path){return typeof path==='string'&&pattern.test(path)?'https://zetarilmjhsqxrvnqnxp.supabase.co/storage/v1/object/public/tournament-banners/'+path:'';}
 const api={types,validate,url};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ZukaBanner=api;
})(globalThis);
