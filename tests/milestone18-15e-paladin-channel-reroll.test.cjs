'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
require('../js/data.js');require('../js/inventory.js');require('../js/core.js');
const M=require('../js/class-mechanics.js');
function make(sub='Oath of Glory',level=20,cha=18){
 const c={templateKind:'starter',className:'Paladin',subclass:sub,level,
  scores:{str:16,dex:12,con:14,int:10,wis:10,cha},profSaves:['wis','cha'],
  build:{characterClass:'Paladin',subclass:sub,slotMax:[4,3,3,2,1,0,0,0,0]}};
 return {character:c,inventory:{items:[]},resources:{hp:70,maxHp:80,tempHp:0,conditions:[],classState:{},classResources:M.normalizeResources(c),spellSlots:c.build.slotMax,concentration:''}};
}
const target=(name,total)=>({name,wisdomSaveTotal:total,visibleWithin60:true});
test('Divine Sense spends exactly one shared Channel Divinity and records 60ft, 10m',()=>{
 const s=make('Oath of Devotion',3),start=s.resources.classResources['channel-divinity'];
 const next=M.activateDivineSense(s);
 assert.equal(start,2);assert.equal(next.resources.classResources['channel-divinity'],1);
 assert.equal(next.resources.classState.divineSenseActive,true);
 assert.equal(next.resources.lastClassEffect.durationMinutes,10);
 assert.equal(next.resources.lastClassEffect.range,60);
 assert.equal(s.resources.classResources['channel-divinity'],start);
 assert.throws(()=>M.activateDivineSense(next),/already active/);
 const off=M.endDivineSense(next);
 assert.equal(off.resources.classState.divineSenseActive,false);
 assert.equal(off.resources.classResources['channel-divinity'],1);
});
test('Divine Sense gates level, class, incapacitation, missing uses',()=>{
 assert.throws(()=>M.activateDivineSense(make('Oath of Glory',2)),/level 3/);
 const barbarian=make();barbarian.character.build.characterClass='Barbarian';
 assert.throws(()=>M.activateDivineSense(barbarian),/level 3/);
 for(const condition of ['Incapacitated','Paralyzed','Stunned','Petrified','Unconscious']){
  const s=make();s.resources.conditions=[condition];
  assert.throws(()=>M.activateDivineSense(s),/Incapacitated/);
 }
 const dead=make();dead.resources.hp=0;assert.throws(()=>M.activateDivineSense(dead),/0 HP/);
 const empty=make();empty.resources.classResources['channel-divinity']=0;assert.throws(()=>M.activateDivineSense(empty),/No Channel/);
});
test('Short or long rest clears Divine Sense (which lasts at most 10 minutes)',()=>{
 const s=M.activateDivineSense(make());
 assert.equal(M.restClassState(s.character,s.resources.classState,'short').divineSenseActive,false);
 assert.equal(M.restClassState(s.character,s.resources.classState,'long').divineSenseActive,undefined);
});
test('Abjure Foes computes each enemy Wisdom save vs Paladin spell DC and spends one Channel Divinity',()=>{
 const s=make('Oath of the Ancients',9),dc=require('../js/core.js').derived(s.character,s.inventory,s.resources).spellDC;
 assert.equal(dc,16);
 const next=M.abjureFoes(s,[target('Wight',15),target('Cultist',16)]);
 assert.equal(next.resources.classResources['channel-divinity'],1);
 assert.equal(next.resources.lastClassEffect.saveDC,dc);
 assert.equal(next.resources.lastClassEffect.targets[0].frightened,true);
 assert.equal(next.resources.lastClassEffect.targets[1].frightened,false);
 assert.equal(next.resources.lastClassEffect.targets[0].name,'Wight');
 assert.equal(JSON.parse(JSON.stringify(next)).resources.lastClassEffect.targets.length,2);
});
test('Abjure Foes enforces CHA target limit, visibility, and unique targets',()=>{
 const s=make('Oath of Vengeance',9,14); // +2 CHA
 assert.throws(()=>M.abjureFoes(s,[]),/1–2/);
 assert.throws(()=>M.abjureFoes(s,[target('a',9),target('b',9),target('c',9)]),/1–2/);
 assert.throws(()=>M.abjureFoes(s,[target('a',9),target('A',9)]),/only once/);
 assert.throws(()=>M.abjureFoes(s,[{...target('a',9),visibleWithin60:false}]),/visible within 60/);
 assert.throws(()=>M.abjureFoes(s,[{...target('a',9),wisdomSaveTotal:NaN}]),/full Wisdom/);
 assert.throws(()=>M.abjureFoes(s,[{...target('a',9),wisdomSaveTotal:14.2}]),/full Wisdom/);
 const one=make('Oath of Glory',9,8);assert.doesNotThrow(()=>M.abjureFoes(one,[target('x',1)]));
 assert.throws(()=>M.abjureFoes(one,[target('x',1),target('y',1)]),/1–1/);
});
test('Abjure Foes requires class level 9 and Channel Divinity and conscious Paladin',()=>{
 assert.throws(()=>M.abjureFoes(make('Oath of Glory',8),[target('x',10)]),/level 9/);
 const r=make();r.resources.classResources['channel-divinity']=0;
 assert.throws(()=>M.abjureFoes(r,[target('x',10)]),/No Channel/);
 const unconscious=make();unconscious.resources.conditions=['Unconscious'];
 assert.throws(()=>M.abjureFoes(unconscious,[target('x',10)]),/Incapacitated/);
});
test('Channel Divinity is SHARED with Vow of Enmity, Sacred Weapon, and Divine Sense',()=>{
 const s=M.activateDivineSense(make('Oath of Vengeance',11));
 const t=M.vowOfEnmity(s,'Gargoyle');
 assert.equal(t.resources.classResources['channel-divinity'],1);
 const u=M.abjureFoes(t,[target('Gargoyle',10)]);
 assert.equal(u.resources.classResources['channel-divinity'],0);
 assert.throws(()=>M.activateDivineSense(M.endDivineSense(u)),/No Channel/);
});
test('Living Legend Saving Throw Reroll applies full current modifier including aura and spends Reaction',()=>{
 const s=M.oathCapstone(make(),'free');
 const save=require('../js/core.js').derived(s.character,s.inventory,s.resources).saves.wis;
 assert.equal(save,10); // Wisdom +0 + PB 6 + CHA aura +4
 const next=M.livingLegendSaveReroll(s,{ability:'wis',initialTotal:8,dc:18},9);
 assert.equal(next.resources.lastClassEffect.total,19);
 assert.equal(next.resources.lastClassEffect.success,true);
 assert.equal(next.resources.lastClassEffect.die,9);
 assert.equal(next.resources.classState.reactionUsed,true);
 assert.equal(next.resources.classResources['living-legend'],0); // no additional charge spent
 assert.throws(()=>M.livingLegendSaveReroll(next,{ability:'wis',initialTotal:8,dc:18},20),/Reaction/);
});
test('Living Legend reroll MUST use a worse or failed result too',()=>{
 const s=M.oathCapstone(make(),'free');
 const result=M.livingLegendSaveReroll(s,{ability:'wis',initialTotal:17,dc:19},1).resources.lastClassEffect;
 assert.equal(result.total,11);assert.equal(result.success,false);
 assert.equal(result.initialTotal,17);
});
test('Living Legend saving reroll enforces subclass, level, activation and valid failed save',()=>{
 const opts={ability:'wis',initialTotal:5,dc:20};
 assert.throws(()=>M.livingLegendSaveReroll(make(),opts,10),/active Living Legend/);
 assert.throws(()=>M.livingLegendSaveReroll(make('Oath of Glory',19),opts,10),/level 20/);
 assert.throws(()=>M.livingLegendSaveReroll(make('Oath of Devotion'),opts,10),/Living Legend/);
 const s=M.oathCapstone(make(),'free');
 assert.throws(()=>M.livingLegendSaveReroll(s,{...opts,initialTotal:20},10),/failed saving/);
 assert.throws(()=>M.livingLegendSaveReroll(s,{...opts,dc:0},10),/failed saving/);
 assert.throws(()=>M.livingLegendSaveReroll(s,{...opts,ability:'luck'},10),/ability/);
 assert.throws(()=>M.livingLegendSaveReroll(s,opts,21),/d20/);
 for(const condition of ['Stunned','Paralyzed','Unconscious']){
  const r={...s,resources:{...s.resources,conditions:[condition]}};
  assert.throws(()=>M.livingLegendSaveReroll(r,opts,10),/Incapacitated/);
 }
});
test('Living Legend Reaction conflict with other feature and next-turn reset',()=>{
 const s=M.oathCapstone(make(),'free');
 const used=M.gloriousDefense(s,{attackTotal:18,targetAC:15});
 assert.throws(()=>M.livingLegendSaveReroll(used,{ability:'wis',initialTotal:8,dc:20},15),/Reaction/);
 const saved=M.livingLegendSaveReroll(s,{ability:'wis',initialTotal:8,dc:20},15);
 assert.equal(M.resetReaction(saved).resources.classState.reactionUsed,false);
 const e={...saved,encounter:{active:true,round:2,currentId:'p',roster:[{id:'p',isPip:true}]}};
 assert.equal(M.paladinStartTurn(e).resources.classState.reactionUsed,false);
});
test('Dropping the Paladin to 0 HP ends an active Divine Sense without refunding Channel Divinity',()=>{
 const s=M.activateDivineSense(make('Oath of Devotion',3));
 const old=s.resources.classResources['channel-divinity'];
 const out=M.resolveIncomingDamage(s,99,'Fire').state;
 assert.equal(out.resources.hp,0);
 assert.equal(out.resources.classState.divineSenseActive,false);
 assert.equal(out.resources.classResources['channel-divinity'],old);
});
test('Existing Paladin characters can serialize new class state and their original resources remain stable',()=>{
 const s=M.activateDivineSense(make('Oath of Glory',20));
 const restored=JSON.parse(JSON.stringify(s));
 assert.equal(restored.resources.classState.divineSenseActive,true);
 assert.equal(restored.character.build.subclass,'Oath of Glory');
 assert.equal(restored.resources.classResources['lay-on-hands'],100);
 const next=M.endDivineSense(restored);
 assert.equal(next.resources.classResources['lay-on-hands'],100);
});
