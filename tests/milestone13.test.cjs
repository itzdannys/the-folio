const { test } = require('node:test');
const assert = require('node:assert/strict');
const C = require('../js/core.js');
const I = require('../js/inventory.js');
const seed={hp:42,maxHp:60,tempHp:9,concentration:'Bless',lastConcentrationDC:null,deathSuccess:0,deathFailure:0};

test('M13 concentration DC follows 2024 floor, minimum and maximum',()=>{
  assert.equal(C.concentrationDC(1),10);
  assert.equal(C.concentrationDC(21),10);
  assert.equal(C.concentrationDC(29),14);
  assert.equal(C.concentrationDC(60),30);
  assert.equal(C.concentrationDC(1000),30);
});
test('M13 damage through temporary HP still triggers concentration',()=>{
  const r=C.applyDamage(seed,5);
  assert.equal(r.tempHp,4); assert.equal(r.hp,42);assert.equal(r.lastConcentrationDC,10);
  const big=C.applyDamage(seed,999);assert.equal(big.hp,0);assert.equal(big.tempHp,0);assert.equal(big.lastConcentrationDC,30);
});
test('M13 healing does not add temporary HP and clears old reminder',()=>{
  const d=C.applyDamage(seed,29),h=C.applyHealing(d,4);
  assert.equal(h.tempHp,0);assert.equal(h.lastConcentrationDC,null);assert.equal(h.hp,26);
});
test('M13 safe coin calculations reject floating-point integer precision loss',()=>{
  const inv=I.defaults();inv.currency.gp=Number.MAX_SAFE_INTEGER;
  assert.throws(()=>I.adjustCurrency(inv,'gp',1,'add'),/too large/);
  assert.equal(inv.currency.gp,Number.MAX_SAFE_INTEGER);
});
