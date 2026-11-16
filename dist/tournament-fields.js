'use strict';
(function(root){
 const amount=value=>value==null||String(value).trim()===''?null:Number(String(value).replace(',','.'));
 function money(value){const n=amount(value);return n!==null&&Number.isFinite(n)&&n>=0?new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n):'';}
 function address(t){return [t.street,t.number,t.neighborhood,t.postalCode?`CEP ${t.postalCode}`:''].filter(Boolean).join(', ')||t.address||`${t.city}, ${t.state}`;}
 const api={amount,money,address};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ZukaFields=api;
})(globalThis);
