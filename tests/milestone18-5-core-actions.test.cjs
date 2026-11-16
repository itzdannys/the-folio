const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../js/inventory.js');require('../js/data.js');
const M=require('../js/class-mechanics.js');
const B=require('../js/builder.js');
const S=require('../js/storage.js');
function fixture(name,n=7){
 const cl=B.classes.find(x=>x.name===name);
 const character={templateKind:'starter',level:n,className:name,scores:{str:12,dex:16,con:14,int:14,wis:16,cha:18},build:{characterClass:name,slotMax:B.slotsFor(cl,n)}};
 const resources={hp:13,maxHp:48,tempHp:0,classResources:M.normalizeResources(character),classState:{},spellSlots:[...character.build.slotMax],conditions:[],concentration:''};
 return {character,resources,inventory:{items:[]}};
}
test('Bard Inspiration grants a level-scaled die, spends a use, and never applies the die to self',()=>{
 for(const [n,die] of [[1,6],[4,6],[5,8],[9,8],[10,10],[14,10],[15,12],[20,12]]){
  const s=fixture('Bard',n),starting=s.resources.classResources['bardic-inspiration'];
  const after=M.grantBardicInspiration(s);
  assert.equal(after.resources.classResources['bardic-inspiration'],starting-1);
  assert.equal(after.resources.lastClassEffect.die,die);
  assert.match(after.resources.lastClassEffect.recipient,/another creature/);
  assert.equal(after.resources.hp,s.resources.hp);
  assert.equal(s.resources.classResources['bardic-inspiration'],starting);
 }
});
test('Bard Inspiration denies wrong class and depleted pool',()=>{
 assert.throws(()=>M.grantBardicInspiration(fixture('Monk')),/Bard/);
 const s=fixture('Bard');s.resources.classResources['bardic-inspiration']=0;
 assert.throws(()=>M.grantBardicInspiration(s),/No Bardic Inspiration/);
});
test('Font of Inspiration spends an existing spell slot to restore exactly one Inspiration',()=>{
 const s=fixture('Bard',5);s.resources.classResources['bardic-inspiration']=0;
 const cap=s.resources.spellSlots[1];
 const after=M.useFontOfInspiration(s,2);
 assert.equal(after.resources.spellSlots[1],cap-1);
 assert.equal(after.resources.classResources['bardic-inspiration'],1);
 assert.equal(s.resources.spellSlots[1],cap);
 assert.equal(M.rest(s.character,{...s.resources.classResources,'bardic-inspiration':0},'short')['bardic-inspiration'],4);
});
test('Font of Inspiration prevents misuse, overfill, invalid slots, and low-level/wrong classes',()=>{
 assert.throws(()=>M.useFontOfInspiration(fixture('Bard',4),1),/level 5/);
 assert.throws(()=>M.useFontOfInspiration(fixture('Wizard',7),1),/Bard/);
 const s=fixture('Bard',7);
 assert.throws(()=>M.useFontOfInspiration(s,1),/already full/);
 s.resources.classResources['bardic-inspiration']=0;
 assert.throws(()=>M.useFontOfInspiration(s,0),/valid spell slot/);
 assert.throws(()=>M.useFontOfInspiration(s,10),/valid spell slot/);
 assert.throws(()=>M.useFontOfInspiration(s,9),/No spell slot/);
});
test('Tactical Mind spends Second Wind only if its d10 changes the failed check to success',()=>{
 const s=fixture('Fighter',2),start=s.resources.classResources['second-wind'];
 const success=M.useTacticalMind(s,10,15,5);
 assert.equal(success.resources.classResources['second-wind'],start-1);
 assert.equal(success.resources.lastClassEffect.success,true);
 assert.equal(success.resources.lastClassEffect.finalTotal,15);
 const failure=M.useTacticalMind(s,10,18,5);
 assert.equal(failure.resources.classResources['second-wind'],start);
 assert.equal(failure.resources.lastClassEffect.success,false);
 assert.equal(failure.resources.lastClassEffect.spentSecondWind,false);
});
test('Tactical Mind validates failed check, roll, DC, second wind and class level',()=>{
 assert.throws(()=>M.useTacticalMind(fixture('Fighter',1),10,15,7),/level 2/);
 assert.throws(()=>M.useTacticalMind(fixture('Ranger'),10,15,7),/Fighter/);
 const s=fixture('Fighter',3);
 assert.throws(()=>M.useTacticalMind(s,15,15,1),/failed ability check/);
 assert.throws(()=>M.useTacticalMind(s,10,15,0),/valid check/);
 assert.throws(()=>M.useTacticalMind(s,10,15,11),/valid check/);
 assert.throws(()=>M.useTacticalMind(s,10,0,1),/valid check/);
 s.resources.classResources['second-wind']=0;
 assert.throws(()=>M.useTacticalMind(s,10,15,6),/No Second Wind/);
});
test('Monk Martial Arts die progression follows 2024 SRD levels',()=>{
 for(const [n,die] of [[2,6],[4,6],[5,8],[10,8],[11,10],[16,10],[17,12],[20,12]])assert.equal(M.monkMartialDie(n),die);
});
test('Monk Flurry of Blows spends one Focus and scales attacks at level 10',()=>{
 for(const [n,attacks] of [[2,2],[9,2],[10,3],[20,3]]){
  const s=fixture('Monk',n),start=s.resources.classResources['focus-points'];
  const after=M.useMonkFocus(s,'flurry');
  assert.equal(after.resources.classResources['focus-points'],start-1);
  assert.equal(after.resources.lastClassEffect.attacks,attacks);
 }
});
test('Monk free and paid defenses/dashes distinguish effects and resource cost',()=>{
 const s=fixture('Monk',7),initial=s.resources.classResources['focus-points'];
 const f=M.useMonkFocus(s,'patient-free');
 assert.equal(f.resources.classResources['focus-points'],initial);
 assert.equal(f.resources.lastClassEffect.disengage,true);
 assert.equal(f.resources.lastClassEffect.dodge,false);
 const paid=M.useMonkFocus(s,'patient');
 assert.equal(paid.resources.classResources['focus-points'],initial-1);
 assert.equal(paid.resources.lastClassEffect.dodge,true);
 const dash=M.useMonkFocus(s,'step-free');
 assert.equal(dash.resources.classResources['focus-points'],initial);
 assert.equal(dash.resources.lastClassEffect.dash,true);
 assert.equal(dash.resources.lastClassEffect.disengage,false);
 const boosted=M.useMonkFocus(s,'step');
 assert.equal(boosted.resources.lastClassEffect.doubleJump,true);
 assert.equal(boosted.resources.lastClassEffect.disengage,true);
});
test('Heightened Focus level 10 grants 2 Martial Arts dice temp HP without adding to existing temp HP',()=>{
 const s=fixture('Monk',10);s.resources.tempHp=12;
 const first=M.useMonkFocus(s,'patient',[3,4]);
 assert.equal(first.resources.tempHp,12);
 assert.equal(first.resources.lastClassEffect.temporaryHpOffered,7);
 const second=M.useMonkFocus(s,'patient',[7,8]);
 assert.equal(second.resources.tempHp,15);
 assert.equal(second.resources.lastClassEffect.temporaryHpApplied,3);
 assert.equal(s.resources.tempHp,12);
 assert.throws(()=>M.useMonkFocus(s,'patient',[9,3]),/Invalid Martial Arts dice/);
 assert.throws(()=>M.useMonkFocus(s,'patient',[2]),/Invalid Martial Arts dice/);
});
test('Monk focus rejects wrong classes, unsupported techniques, invalid rolls and spent Focus',()=>{
 assert.throws(()=>M.useMonkFocus(fixture('Fighter'),'flurry'),/Monk/);
 assert.throws(()=>M.useMonkFocus(fixture('Monk',1),'flurry'),/level 2/);
 assert.throws(()=>M.useMonkFocus(fixture('Monk'),'fake'),/Unknown/);
 const s=fixture('Monk');s.resources.classResources['focus-points']=0;
 assert.throws(()=>M.useMonkFocus(s,'flurry'),/Not enough Focus/);
 assert.equal(M.useMonkFocus(s,'step-free').resources.classResources['focus-points'],0);
 assert.throws(()=>M.useMonkFocus(s,'flurry',[3]),/Not enough Focus/);
});
test('Uncanny Metabolism at initiative refills Focus, heals and uses its once-per-rest budget',()=>{
 const s=fixture('Monk',5);s.resources.classResources['focus-points']=1;
 const after=M.useUncannyMetabolism(s,5);
 assert.equal(after.resources.hp,23);
 assert.equal(after.resources.classResources['focus-points'],5);
 assert.equal(after.resources.classResources['uncanny-metabolism'],0);
 assert.equal(after.resources.lastClassEffect.focusRecovered,4);
 assert.throws(()=>M.useUncannyMetabolism(after,5),/already used/);
 assert.equal(M.rest(s.character,after.resources.classResources,'short')['uncanny-metabolism'],0);
 assert.equal(M.rest(s.character,after.resources.classResources,'long')['uncanny-metabolism'],1);
});
test('Uncanny Metabolism clamps healing to max HP and verifies class, level, die',()=>{
 const s=fixture('Monk',17);s.resources.hp=47;
 assert.equal(M.useUncannyMetabolism(s,12).resources.hp,48);
 assert.throws(()=>M.useUncannyMetabolism(s,13),/Martial Arts die/);
 assert.throws(()=>M.useUncannyMetabolism(fixture('Monk',1),1),/level 2/);
 assert.throws(()=>M.useUncannyMetabolism(fixture('Bard'),1),/Monk/);
});
test('Perfect Focus restores to exactly four points at level 15 and rejects invalid usage',()=>{
 const s=fixture('Monk',15);s.resources.classResources['focus-points']=1;
 const after=M.usePerfectFocus(s);
 assert.equal(after.resources.classResources['focus-points'],4);
 assert.equal(after.resources.lastClassEffect.focusRecovered,3);
 assert.throws(()=>M.usePerfectFocus(after),/3 or fewer/);
 assert.throws(()=>M.usePerfectFocus(fixture('Monk',14)),/level 15/);
 assert.throws(()=>M.usePerfectFocus(fixture('Fighter',16)),/Monk/);
});
test('new class effects survive JSON clone and Undo stack shapes without modifying other resources',()=>{
 const fighter=M.useTacticalMind(fixture('Fighter'),10,13,4);
 const bard=M.grantBardicInspiration(fixture('Bard',10));
 const monk=M.useMonkFocus(fixture('Monk',10),'patient',[4,5]);
 for(const s of [fighter,bard,monk]){
  const backup=S.clone(s);
  assert.deepEqual(backup.resources.classResources,s.resources.classResources);
  assert.deepEqual(backup.resources.lastClassEffect,s.resources.lastClassEffect);
  assert.deepEqual(backup.resources.spellSlots,s.resources.spellSlots);
 }
});
