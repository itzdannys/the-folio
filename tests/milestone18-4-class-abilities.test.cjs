const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../js/inventory.js');require('../js/data.js');
const M=require('../js/class-mechanics.js');
const B=require('../js/builder.js');
const S=require('../js/storage.js');
function fixture(name,n=7,wis=16){
 const cls=B.classes.find(x=>x.name===name);
 const character={templateKind:'starter',level:n,className:name,scores:{str:12,dex:14,con:14,int:16,wis,cha:16},build:{characterClass:name,slotMax:B.slotsFor(cls,n)}};
 const resources={hp:22,maxHp:43,tempHp:0,classResources:M.normalizeResources(character),classState:{},spellSlots:[...character.build.slotMax],conditions:[],concentration:''};
 return {character,resources,inventory:{items:[]}};
}
test('Wizard Arcane Recovery restores a chosen group of expended slots within ceil(level/2) and spends one use',()=>{
 const s=fixture('Wizard',5),base=s.resources.spellSlots; s.resources.classState.wizardShortRestReady=true;
 s.resources.spellSlots=[base[0]-2,base[1]-1,base[2],...base.slice(3)];
 const after=M.recoverWizardSlots(s,[1,2]);
 assert.equal(after.resources.spellSlots[0],base[0]-1);
 assert.equal(after.resources.spellSlots[1],base[1]);
 assert.equal(after.resources.classResources['arcane-recovery'],0);
 assert.deepEqual(after.resources.lastClassEffect.recovered,[1,2]);
 assert.deepEqual(s.resources.spellSlots,[base[0]-2,base[1]-1,base[2],...base.slice(3)],'pure, no mutation');
 assert.throws(()=>M.recoverWizardSlots(after,[1]),/already used/);
 assert.equal(M.rest(s.character,after.resources.classResources,'long')['arcane-recovery'],1);
});
test('Wizard Arcane Recovery respects the 1–5 level limit, maximum budget and expended capacity',()=>{
 const s=fixture('Wizard',4);s.resources.classState.wizardShortRestReady=true;s.resources.spellSlots[0]=2;s.resources.spellSlots[1]=1;
 assert.throws(()=>M.recoverWizardSlots(s,[1,2]),/exceeds half/);
 assert.throws(()=>M.recoverWizardSlots(s,[6]),/level 1 to 5/);
 assert.throws(()=>M.recoverWizardSlots(s,[0]),/level 1 to 5/);
 assert.throws(()=>M.recoverWizardSlots(s,[]),/Choose one/);
 const limited=fixture('Wizard',7);limited.resources.classState.wizardShortRestReady=true;limited.resources.spellSlots[1]--;assert.throws(()=>M.recoverWizardSlots(limited,[2,2]),/No expended level 2/);
 assert.throws(()=>M.recoverWizardSlots(fixture('Cleric'),[1]),/Wizard/);
 const one=fixture('Wizard',1);one.resources.classState.wizardShortRestReady=true;assert.throws(()=>M.recoverWizardSlots(one,[1]),/No expended/);
});
test('Druid Wild Resurgence trades a slot for Wild Shape ONLY when the Wild Shape pool is empty',()=>{
 const s=fixture('Druid',5),spells=s.resources.spellSlots;
 assert.throws(()=>M.regainWildShapeFromSlot(s,1),/must be empty/);
 s.resources.classResources['wild-shape']=0;
 const after=M.regainWildShapeFromSlot(s,2);
 assert.equal(after.resources.classResources['wild-shape'],1);
 assert.equal(after.resources.spellSlots[1],spells[1]-1);
 assert.equal(after.resources.classResources['wild-resurgence-slot'],1,'independent daily exchange');
 assert.equal(s.resources.classResources['wild-shape'],0,'original unchanged');
 assert.throws(()=>M.regainWildShapeFromSlot(s,9),/No spell slot/);
 assert.throws(()=>M.regainWildShapeFromSlot(fixture('Druid',4),1),/level 5/);
});
test('Druid Wild Resurgence grants one level 1 slot for a Wild Shape use, once per Long Rest',()=>{
 const s=fixture('Druid',10),original=s.resources.spellSlots[0];
 const after=M.exchangeWildShapeForSlot(s);
 assert.equal(after.resources.spellSlots[0],original+1,'created slot may exceed normal cap');
 assert.equal(after.resources.classResources['wild-shape'],s.resources.classResources['wild-shape']-1);
 assert.equal(after.resources.classResources['wild-resurgence-slot'],0);
 assert.throws(()=>M.exchangeWildShapeForSlot(after),/already used/);
 assert.equal(M.rest(s.character,after.resources.classResources,'long')['wild-resurgence-slot'],1);
 s.resources.classResources['wild-shape']=0;
 assert.throws(()=>M.exchangeWildShapeForSlot(s),/No Wild Shape/);
 assert.throws(()=>M.exchangeWildShapeForSlot(fixture('Wizard',5)),/Druid/);
});
test('Cleric Divine Spark healing correctly targets another creature; it never increases the character’s own HP',()=>{
 const s=fixture('Cleric',2);const start=s.resources.classResources['channel-divinity'];
 const after=M.useDivineSpark(s,'heal',[4]);
 assert.equal(after.resources.lastClassEffect.amount,7,'1d8+3 WIS');
 assert.equal(after.resources.lastClassEffect.target,'another creature within 30 feet');
 assert.equal(after.resources.hp,22,'no self-healing');
 assert.equal(after.resources.classResources['channel-divinity'],start-1);
 assert.equal(s.resources.classResources['channel-divinity'],start,'original untouched');
});
test('Divine Spark scales 1d8 → 2d8 → 3d8 → 4d8 and computes target Constitution save and half damage',()=>{
 for(const [level,dice] of [[2,1],[6,1],[7,2],[12,2],[13,3],[17,3],[18,4],[20,4]]){
  const state=fixture('Cleric',level),rolls=Array(dice).fill(5);
  const after=M.useDivineSpark(state,'radiant',rolls);
  const eff=after.resources.lastClassEffect;
  assert.equal(eff.amount,dice*5+3);
  assert.equal(eff.constitutionSaveDC,8+(2+Math.floor((level-1)/4))+3);
  assert.equal(eff.successDamage,Math.floor((dice*5+3)/2));
  assert.equal(eff.kind,'radiant');
  if(dice>1)assert.throws(()=>M.useDivineSpark(state,'necrotic',[2]),/requires .* d8/);
 }
});
test('Divine Spark enforces class, level, channel availability, roll validity and nonnegative result',()=>{
 assert.throws(()=>M.useDivineSpark(fixture('Cleric',1),'heal',[3]),/level 2/);
 assert.throws(()=>M.useDivineSpark(fixture('Paladin',7),'heal',[3,3]),/Cleric/);
 const s=fixture('Cleric',7);s.resources.classResources['channel-divinity']=0;
 assert.throws(()=>M.useDivineSpark(s,'heal',[4,5]),/No Channel Divinity/);
 s.resources.classResources['channel-divinity']=1;
 assert.throws(()=>M.useDivineSpark(s,'cold',[4,5]),/Choose healing/);
 assert.throws(()=>M.useDivineSpark(s,'heal',[0,5]),/valid d8/);
 assert.throws(()=>M.useDivineSpark(s,'heal',[9,5]),/valid d8/);
 assert.throws(()=>M.useDivineSpark(s,'heal',[1]),/2 valid d8/);
 const custom=fixture('Cleric',7);custom.character.overrides={spellDC:19};
 assert.equal(M.useDivineSpark(custom,'necrotic',[3,3]).resources.lastClassEffect.constitutionSaveDC,19,'honor sheet spell DC override');
 const negative=fixture('Cleric',2,1);
 assert.equal(M.useDivineSpark(negative,'necrotic',[1]).resources.lastClassEffect.amount,0);
});
test('class effects persist through JSON/Undo-style clone without wiping spells or other resources',()=>{
 const d=fixture('Druid',7),w=fixture('Wizard',7);w.resources.classState.wizardShortRestReady=true;w.resources.spellSlots[0]-=1;
 const afterWizard=M.recoverWizardSlots(w,[1]);
 const afterDruid=M.exchangeWildShapeForSlot(d);
 for(const state of [afterWizard,afterDruid]){
  const clone=S.clone(state);
  assert.deepEqual(clone.resources.classResources,state.resources.classResources);
  assert.deepEqual(clone.resources.spellSlots,state.resources.spellSlots);
  assert.deepEqual(clone.resources.lastClassEffect,state.resources.lastClassEffect);
 }
});
