'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { tournamentFromRow } = require('../dist/supabase-mapping.js');
test('converte torneio publicado e categorias para o formato do catálogo', () => {
 const t = tournamentFromRow({id:'abc',name:'Copa',venue:'Arena',city:'Santos',state:'SP',starts_on:'2026-11-20',ends_on:'2026-11-21',registration_deadline:'2026-11-19',status:'open',latitude:null,longitude:null,tournament_categories:[{level:'B'},{level:'A'},{level:'B'}]});
 assert.equal(t.start,'2026-11-20'); assert.equal(t.deadline,'2026-11-19'); assert.deepEqual(t.categories,['B','A']); assert.equal(t.coords,null); assert.equal(t.demo,false);
});
