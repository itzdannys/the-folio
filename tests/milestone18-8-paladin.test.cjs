'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const I=require('../js/inventory.js');
require('../js/core.js');require('../js/dice.js');require('../js/weapon-catalog.js');require('../js/spell-catalog.js');require('../js/spell-expansions.js');require('../js/spell-supplements.js');
const M=require('../js/class-mechanics.js'),W=require('../js/weapon-rules.js'),S=require('../js/storage.js');
function fixture(n=2){
 const character={templateKind:'starter',className:'Paladin',level:n,scores:{str:18,dex:12,con:14,int:10,wis:12,cha:16},build:{characterClass:'Paladin',slotMax:n>=17?[4,3,3,3,1]:n>=13?[4,3,3,1]:n>=9?[4,3,2]:n>=5?[4,2]:[2]}};
 const sword=I.gear('sword','Longsword','weapon',1,'',{equipped:true,weapon:{category:'Martial',kind:'Melee',damage:'1d8',type:'Slashing',properties:'Versatile',propertyList:['Versatile'],versatileDice:'1d10',ability:'str',grip:1,mastered:false}});
 const javelin=I.gear('javelin','Javelin','weapon',1,'',{equipped:false,weapon:{category:'Simple',kind:'Melee',damage:'1d6',type:'Piercing',properties:'Thrown',propertyList:['Thrown'],ability:'str',grip:1,mastered:false}});
 return {character,resources:{hp:10,maxHp:50,tempHp:0,conditions:[],classResources:M.normalizeResources(character),classState:{},spellSlots:[...character.build.slotMax]},inventory:{items:[sword,javelin]}};
}
function atk(s,dice=[12,4,5,6],cost='free',fiendOrUndead=false,ac=10,mode='melee',id='sword'){
 let i=0;return W.attack(s.character,s.inventory,id,mode,'normal',ac,()=>dice[i++],s.resources,null,null,cost==='none'?null:{cost,fiendOrUndead});
}
test('Paladin smite free use appears from level 2 and resets on Long Rest',()=>{
 assert.equal(M.resourcesFor(fixture(1).character).some(x=>x.key==='divine-smite-free'),false);
 const s=fixture(2);assert.equal(s.resources.classResources['divine-smite-free'],1);
 const a=atk(s).resources;assert.equal(a.classResources['divine-smite-free'],0);
 assert.equal(M.rest(s.character,a.classResources,'short')['divine-smite-free'],0);
 assert.equal(M.rest(s.character,a.classResources,'long')['divine-smite-free'],1);
});
test('Divine Smite adds 2d8 Radiant on a confirmed hit and spends only free use',()=>{
 const s=fixture(),r=atk(s,[12,3,4,5]);
 assert.equal(r.result.hit,true);assert.equal(r.result.divineSmite.extraDamage,9);
 assert.deepEqual(r.result.divineSmite.diceRolled,[4,5]);
 assert.equal(r.result.damage,3+4+9);
 assert.deepEqual(r.resources.spellSlots,s.resources.spellSlots);
 assert.equal(r.resources.classResources['divine-smite-free'],0);
 assert.deepEqual(r.result.damageComponents,[{type:'Slashing',amount:7},{type:'Radiant',amount:9}]);
 assert.match(r.result.message,/Divine Smite \+9 Radiant/);
});
test('Divine Smite is not spent on a miss, including natural 1',()=>{
 const s=fixture(),r=atk(s,[1]);
 assert.equal(r.result.hit,false);assert.equal(r.result.divineSmite.applied,false);
 assert.equal(r.result.damage,0);assert.equal(r.resources,undefined);
 assert.match(r.result.message,/NOT spent on miss/);
});
test('Divine Smite requires a confirmed target AC and eligible melee attack',()=>{
 const s=fixture();assert.throws(()=>atk(s,[20,5,5], 'free',false,null),/target AC/);
 s.inventory.items[0].equipped=false;s.inventory.items[1].equipped=true;
 const thrown=atk(s,[14,2,3,4],'free',false,12,'throw','javelin');assert.equal(thrown.result.divineSmite.applied,true);
});
test('Divine Smite upcasts from actual slots, Fiend bonus, and critical damage dice double',()=>{
 const s=fixture(11),r=atk(s,[20,3,2,4,5,6,7,8,1,2,3,4,5,6,7], 'slot3',true);
 assert.equal(r.result.critical,true);
 // Radiant Strikes 2d8, then Smite (2+2+1)*2d8.
 assert.equal(r.result.radiantStrikes.diceRolled.length,2);
 assert.equal(r.result.divineSmite.diceRolled.length,10);
 assert.equal(r.resources.spellSlots[2],s.resources.spellSlots[2]-1);
 assert.equal(r.resources.classResources['divine-smite-free'],1);
 assert.equal(r.result.damageComponents.reduce((n,x)=>n+x.amount,0),r.result.damage);
 assert.equal(r.result.damageComponents.find(x=>x.type==='Radiant').amount,58);
});
test('Radiant Strikes level 11 works on confirmed melee hits without Smite, but not at 10',()=>{
 const above=fixture(11),b=atk(above,[12,2,7],'none');
 assert.equal(b.result.radiantStrikes.extraDamage,7);assert.equal(b.result.damage,13);
 assert.equal(b.resources,undefined);
 const below=fixture(10),c=atk(below,[12,2],'none');
 assert.equal(c.result.radiantStrikes,null);assert.equal(c.result.damage,6);
});
test('Radiant Strikes applies to thrown Melee weapons under 2024 text',()=>{
 const s=fixture(11);s.inventory.items[0].equipped=false;s.inventory.items[1].equipped=true;
 const r=atk(s,[12,3,3],'none',false,10,'throw','javelin');
 assert.equal(r.result.radiantStrikes.extraDamage,3);assert.deepEqual(r.result.damageComponents,[{type:'Piercing',amount:7},{type:'Radiant',amount:3}]);
});
test('Once free Smite is used, another free use fails, but a spell-slot Smite remains available',()=>{
 const s=fixture(),first=atk(s,[12,3,4,5]);
 const spent={...s,resources:first.resources};
 assert.throws(()=>atk(spent,[12,2,4,4]),/Free Divine Smite already/);
 const second=atk(spent,[12,2,4,4],'slot1');
 assert.equal(second.resources.spellSlots[0],1);
});
test('Wrong level, exhausted slots, and Incapacitated all prevent Divine Smite',()=>{
 const s=fixture(1);assert.throws(()=>atk(s),/level 2/);
 const a=fixture();a.resources.spellSlots[0]=0;
 assert.throws(()=>atk(a,[12,2,4,4],'slot1'),/No spell slot/);
 a.resources.conditions=['Incapacitated'];assert.throws(()=>atk(a,[12,2,4,4]),/Incapacitated/);
});
test('Paladin can remove Poisoned for 5 Lay On Hands points starting level 1',()=>{
 const s=fixture(1);s.resources.conditions=['Poisoned','Prone'];
 const r=M.usePaladinTouch(s,0,['Poisoned']);
 assert.deepEqual(r.resources.conditions,['Prone']);assert.equal(r.resources.classResources['lay-on-hands'],0);
 assert.equal(r.resources.hp,s.resources.hp);
});
test('Restoring Touch at 14 removes only valid present conditions, spending 5 per condition plus healing',()=>{
 const s=fixture(14);s.resources.conditions=['Frightened','Paralyzed','Prone'];
 const r=M.usePaladinTouch(s,8,['Frightened','Paralyzed']);
 assert.equal(r.resources.hp,18);assert.deepEqual(r.resources.conditions,['Prone']);
 assert.equal(r.resources.classResources['lay-on-hands'],70-18);
 assert.deepEqual(r.resources.lastClassEffect.conditionsRemoved,['Frightened','Paralyzed']);
 const earlier=fixture(13);earlier.resources.conditions=['Frightened'];
 assert.throws(()=>M.usePaladinTouch(earlier,0,['Frightened']),/level 14/);
 assert.throws(()=>M.usePaladinTouch(s,0,['Blinded']),/currently active/);
});
test('Paladin Smite/Touch resource state survives save-like copying and remains undoable',()=>{
 const s=fixture(14),r=atk(s,[13,5,3,4,5,6]);
 const next={...s,resources:r.resources},copy=S.clone(next);
 assert.equal(copy.resources.classResources['divine-smite-free'],0);
 assert.equal(copy.resources.lastClassEffect.feature,'Divine Smite');
 assert.equal(s.resources.classResources['divine-smite-free'],1);
 assert.equal(M.rest(copy.character,copy.resources.classResources,'long')['divine-smite-free'],1);
});
test('2024 Paladin Smite and Find Steed are always prepared; Smite must be cast via attack',()=>{
 const FR=require('../js/rules-engine.js');const a=fixture(1),b=fixture(2),c=fixture(5);
 assert.deepEqual(FR.classGrantedSpellNames(a.character),[]);
 assert.deepEqual(FR.classGrantedSpellNames(b.character),['Divine Smite']);
 assert.deepEqual(FR.classGrantedSpellNames(c.character),['Divine Smite','Find Steed']);
 const book={catalogSelections:[],custom:[]},smite=FR.catalogKeyForName('Divine Smite'),steed=FR.catalogKeyForName('Find Steed');
 assert.ok(smite);assert.ok(steed);
 assert.equal(FR.selectionSummary(b.character,book).counts.granted,1);
 assert.equal(FR.selectionSummary(c.character,book).counts.granted,2);
 assert.deepEqual(FR.castOptions(b.character,book,b.resources,smite),[],'cannot cast Divine Smite from ordinary cast window without a hit');
 const options=FR.castOptions(c.character,book,c.resources,steed);
 assert.ok(options.some(x=>x.key==='paladin-steed-free'));
 assert.ok(options.some(x=>x.key==='slot2'));
 assert.match(FR.selectionError(c.character,book,[steed]),/always prepared/);
});
test('Faithful Steed casts for free once per Long Rest without slot spending, then can use slots',()=>{
 const FR=require('../js/rules-engine.js');const s=fixture(5),book={catalogSelections:[],custom:[]},key=FR.catalogKeyForName('Find Steed');
 const a=FR.cast(s.character,book,s.resources,key,'paladin-steed-free');
 assert.equal(a.resources.classResources['faithful-steed-free'],0);
 assert.deepEqual(a.resources.spellSlots,s.resources.spellSlots);
 assert.equal(a.book.castLog.at(-1).cost,'paladin-steed-free');
 assert.equal(FR.castOptions(s.character,book,a.resources,key).some(o=>o.key==='paladin-steed-free'),false);
 const b=FR.cast(s.character,book,a.resources,key,'slot2');
 assert.equal(b.resources.spellSlots[1],s.resources.spellSlots[1]-1);
 assert.equal(M.rest(s.character,a.resources.classResources,'long')['faithful-steed-free'],1);
});
