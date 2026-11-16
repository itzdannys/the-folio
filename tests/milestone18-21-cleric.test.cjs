'use strict';
const {test}=require('node:test'),A=require('node:assert/strict');
for(const key of ['data','inventory','spell-catalog','spell-expansions','spell-supplements','weapon-catalog','cleric-2024','class-mechanics','core','builder','rules-engine','weapon-rules','storage'])require('../js/'+key+'.js');
const C=require('../js/cleric-2024.js'),M=require('../js/class-mechanics.js'),B=require('../js/builder.js'),FR=require('../js/rules-engine.js'),I=require('../js/inventory.js'),WR=require('../js/weapon-rules.js'),S=require('../js/storage.js');
const roll=sides=>sides===20?14:sides===10?6:sides===8?5:sides===6?4:sides===4?3:2;
function fixture(level=3,subclass='Life Domain'){
 const c={templateKind:'starter',name:'Test Cleric',className:'Cleric',level,subclass,scores:{str:16,dex:12,con:14,int:13,wis:18,cha:10},profSaves:['wis','cha'],profSkills:['Religion','Medicine'],expertise:[],tools:[],speed:30,build:{characterClass:'Cleric',subclass,spellAbility:'wis',slotMax:[4,2,1],grantedFeatNames:[]}};
 return {version:6,character:c,inventory:I.defaults(),resources:{hp:12,maxHp:62,tempHp:0,conditions:[],concentration:'',classResources:M.normalizeResources(c),classState:{},spellSlots:[4,2,1]},spellbook:{prepared:[],catalogSelections:[],queued:[],custom:[],castLog:[]},encounter:{active:false,round:1,roster:[],currentId:null}};
}
test('Four Cleric subclasses are available, with unique stable IDs and only 2024 options',()=>{
 const opts=B.optionList('subclass').filter(x=>x.classId==='class:cleric');A.deepEqual(opts.map(x=>x.name).sort(),['Life Domain','Light Domain','Trickery Domain','War Domain'].sort());A.equal(new Set(opts.map(x=>x.id)).size,4);
});
test('All four Cleric subclasses gate on level 3 and Channel Divinity progresses through 20',()=>{
 for(let n=1;n<=20;n++)for(const sub of ['Life Domain','Light Domain','Trickery Domain','War Domain']){
  const s=fixture(n,sub),spec=M.resourcesFor(s.character).find(x=>x.key==='channel-divinity');A.equal(!!spec,n>=2);if(spec)A.equal(spec.max,n>=18?4:n>=6?3:2);
  A.equal(C[sub==='Life Domain'?'life':sub==='Light Domain'?'light':sub==='Trickery Domain'?'trickery':'war'](s.character),n>=3);
 }
});
test('Divine Order is chosen once and Thaumaturge adjusts cantrip count and relevant checks',()=>{
 let s=fixture(1);s=C.chooseOrder(s,'Thaumaturge');A.equal(s.character.build.clericOrder,'Thaumaturge');A.equal(FR.preparationLimits(s.character).cantrips,4);
 const check=M.resolveAbilityCheck(s,{name:'Religion',dc:17},[12]);A.equal(check.resources.lastClassEffect.modifier,1+2+4);
 A.throws(()=>C.chooseOrder(s,'Protector'),/permanent/);s=C.chooseOrder(s,'Thaumaturge');A.equal(s.character.build.clericOrder,'Thaumaturge');
});
test('Protector order gives martial-weapon proficiency, Thaumaturge does not',()=>{
 let s=fixture(2),weapon={name:'Longsword',category:'Martial',kind:'Melee',properties:''};A.equal(WR.proficient(s.character,weapon),false);s=C.chooseOrder(s,'Protector');A.equal(WR.proficient(s.character,weapon),true);
});
test('Cleric domain spell grants unlock at proper levels and do not count as prepared selections',()=>{
 const c=fixture(9,'War Domain').character;for(const name of ['Shield of Faith','Spiritual Weapon','Fire Shield','Steel Wind Strike'])A.ok(FR.classGrantedSpellNames(c).includes(name));
 A.equal(C.grantSpells(fixture(2,'War Domain').character).length,0);A.equal(C.grantSpells(fixture(3,'Trickery Domain').character).length,4);
 A.equal(FR.classGrantedSpellNames(fixture(9,'Light Domain').character).includes('Fireball'),true);
});
test('Cleric turn budget enforces one Action, one Bonus and one spell slot cast',()=>{
 let s=C.newTurn(fixture(10));s=C.recordSpellCast(s,{name:'Cure Wounds',castingTime:'Action'},'slot1');A.throws(()=>C.turnUndead(s,{confirmed:true},roll),/already spent/);
 s=C.recordSpellCast(s,{name:'Healing Word',castingTime:'Bonus Action'},'cantrip');A.throws(()=>C.recordSpellCast(s,{name:'Healing Word',castingTime:'Bonus Action'},'slot1'),/already spent/);
 s=C.newTurn(s);A.equal(s.resources.classState.clericActionUsed,false);A.equal(s.resources.classState.clericSlotUsed,false);
});
test('Spellcasting unknown time requires explicit input only during tracked combat',()=>{
 let s=C.newTurn(fixture(10));A.throws(()=>C.recordSpellCast(s,{name:'Homebrew'},'slot1'),/Confirm/);s=C.recordSpellCast(s,{name:'Homebrew'},'slot1',{confirmedTime:'action'});A.equal(s.resources.classState.clericActionUsed,true);
 const untracked=C.recordSpellCast(fixture(10),{name:'Homebrew'},'slot1');A.equal(untracked.resources.classState.clericSlotUsed,undefined);
});
test('Turn Undead and level-5 Sear Undead consume Channel Divinity once for multiple targets',()=>{
 let s=fixture(5);s=C.turnUndead(s,{confirmed:true,targets:[{name:'Skeleton',saveTotal:7},{name:'Ghoul',saveTotal:22}]},roll);
 const info=s.resources.lastClassEffect;A.equal(info.results[0].searDamage,20);A.equal(info.results[1].searDamage,0);A.equal(s.resources.classResources['channel-divinity'],1);
 A.throws(()=>C.turnUndead(s,{confirmed:false},roll),/Confirm/);
});
test('Divine Spark damage/save/healing uses the correct dice progression and requires another target',()=>{
 for(const [level,count] of [[2,1],[7,2],[13,3],[18,4]]){
  let s=fixture(level);s=C.divineSpark(s,{kind:'necrotic',target:'Orc',saveTotal:99},roll);A.equal(s.resources.lastClassEffect.damage,Math.floor(5*count/2));
 }
 A.throws(()=>C.divineSpark(fixture(4),{kind:'heal',target:'Self'},roll),/other than yourself/);
});
test('Preserve Life uses Channel Divinity, respects bloodied maximum and tracks own healing',()=>{
 let s=fixture(8);s=C.newTurn(s);s=C.preserveLife(s,15,10);A.equal(s.resources.hp,27);A.equal(s.resources.classResources['channel-divinity'],2);A.throws(()=>C.preserveLife(s,2,0),/already spent/);
});
test('Disciple of Life adds slot-level bonus, Blessed Healer applies self-heal and Supreme Healing maximizes',()=>{
 let s=fixture(17,'Life Domain');s=C.lifeHeal(s,{slotLevel:3,healedOthers:true,healingDice:[8,8],confirmed:true},roll);A.equal(s.resources.lastClassEffect.healing,21);A.equal(s.resources.hp,17);
 A.throws(()=>C.lifeHeal(fixture(6,'War Domain'),{slotLevel:3,confirmed:true},roll),/Life Domain/);
});
test('Light Radiance of Dawn resolves confirmed Constitution saves, applies half damage and expends one use',()=>{
 let s=fixture(3,'Light Domain');s=C.lightRadiance(s,{confirmed:true,targets:[{name:'Orc',saveTotal:2},{name:'Elf',saveTotal:30}]},roll);A.equal(s.resources.lastClassEffect.targets[0].damage,15);A.equal(s.resources.lastClassEffect.targets[1].damage,7);A.equal(s.resources.classResources['channel-divinity'],1);
});
test('Warding Flare consumes reaction, improved use recovers on short rest and self temporary HP applies',()=>{
 let s=C.newTurn(fixture(6,'Light Domain'));s=C.wardingFlare(s,{confirmed:true,self:true,target:'Self'},roll);A.equal(s.resources.tempHp,12);A.equal(s.resources.classState.reactionUsed,true);
 A.throws(()=>C.wardingFlare(s,{confirmed:true},roll),/reaction already spent/);
 let f=C.restState(s.character,s.resources.classState,'short');A.equal(f.reactionUsed,false);A.equal(M.resourcesFor(s.character).find(x=>x.key==='cleric-warding-flare').reset,'short');
});
test('Corona of Light lasts 10 tracked rounds and cannot restart after resource is spent',()=>{
 let s=fixture(17,'Light Domain');s=C.corona(s);A.equal(s.resources.classState.clericCoronaRounds,10);s=C.newTurn(s);A.equal(s.resources.classState.clericCoronaRounds,9);
 for(let i=0;i<3;i++){s=C.newTurn(s);s=C.corona(s);}s=C.newTurn(s);A.throws(()=>C.corona(s),/No cleric-corona/);s=C.corona(s,'end');A.equal(s.resources.classState.clericCoronaRounds,0);
});
test('Trickery blessing stores recipient and Invoke Duplicity shares turn bonus action',()=>{
 let s=fixture(6,'Trickery Domain');s=C.trickBless(s,'Scout');A.equal(s.resources.classState.clericBlessingTarget,'Scout');s=C.newTurn(s);
 s=C.duplicate(s,{mode:'create',confirmed:true,swap:true});A.equal(s.resources.classState.clericDuplicateRounds,10);A.equal(s.resources.classState.clericBonusUsed,true);A.throws(()=>C.duplicate(s,{mode:'move',confirmed:true}),/bonus already spent/);
});
test('Improved Duplicity self-heal and duration expiry survive save/reopen',()=>{
 let s=fixture(17,'Trickery Domain');s=C.duplicate(s,{mode:'create',confirmed:true,healSelf:true});let read=S.migrate(JSON.parse(JSON.stringify(s)));A.equal(read.resources.classState.clericDuplicateActive,true);
 read=C.duplicate(read,{mode:'end',confirmed:true,healSelf:true});A.equal(read.resources.hp,29);
});
test('War Domain Guided Strike adds +10 only after a miss, allied assistance costs Reaction',()=>{
 let s=C.newTurn(fixture(6,'War Domain'));s=C.guidedStrike(s,{self:false,attackTotal:11,targetAC:18,confirmed:true});A.equal(s.resources.lastClassEffect.nowHit,true);A.equal(s.resources.classState.reactionUsed,true);A.throws(()=>C.guidedStrike(s,{self:false,attackTotal:10,targetAC:18,confirmed:true}),/reaction already spent/);
});
test('War God’s Blessing uses Channel Divinity, a Bonus Action and no spell slot',()=>{
 let s=C.newTurn(fixture(6,'War Domain'));const before=[...s.resources.spellSlots];s=C.warBlessing(s,'Spiritual Weapon');A.deepEqual(s.resources.spellSlots,before);A.equal(s.resources.classState.clericWarFaithRounds,10);A.throws(()=>C.warBlessing(s,'Shield of Faith'),/bonus already spent/);
});
test('War Priest Bonus Action has limited uses and resets on Short Rest',()=>{
 let s=C.newTurn(fixture(3,'War Domain'));s=C.warPriest(s,{confirmed:true});A.equal(s.resources.classResources['cleric-war-priest'],3);A.throws(()=>C.warPriest(s,{confirmed:true}),/bonus already spent/);
 const spec=M.resourcesFor(s.character).find(x=>x.key==='cleric-war-priest');A.equal(spec.reset,'short');
});
test('War Avatar of Battle resists physical damage without requiring manual checkbox',()=>{
 let s=fixture(17,'War Domain');const result=M.resolveIncomingDamage(s,21,'Slashing');A.equal(result.details.resolved,10);A.equal(result.details.source,'Avatar of Battle');
});
test('Divine Intervention validates eligible Cleric spells and tracks Long Rest recovery for Wish',()=>{
 let s=fixture(20,'Life Domain');A.throws(()=>C.intervention(s,{name:'Fireball',spellLevel:3,confirmed:true},roll),/verified Cleric/);
 s=C.intervention(s,{name:'Wish',spellLevel:9,confirmed:true},roll);A.equal(s.resources.classState.clericWishCooldown,6);A.throws(()=>C.intervention(s,{name:'Cure Wounds',spellLevel:1,confirmed:true},roll),/recovering/);
 let f=C.restState(s.character,s.resources.classState,'long');A.equal(f.clericWishCooldown,5);
});
test('Level-7 Divine Strike applies only once per turn, doubles dice on crit, grows at 14',()=>{
 let s=C.chooseStrikes(fixture(14),'Divine Strike');let v=C.attackPower(s,{hit:true,critical:true},roll);A.equal(v.damage,20);s={...s,resources:v.resources};A.equal(C.attackPower(s,{hit:true},roll).damage,0);
 s=C.newTurn(s);A.equal(C.attackPower(s,{hit:true,critical:false},roll).damage,10);
});
test('Potent Spellcasting applies Wisdom to confirmed cantrip damage with temporary HP at 14',()=>{
 let s=C.chooseStrikes(fixture(14),'Potent Spellcasting');s=C.cantripPower(s,{damageConfirmed:true,target:'Self'});A.equal(s.resources.lastClassEffect.extraDamage,4);A.equal(s.resources.tempHp,8);
});
test('Cleric weapon attack shares normal weapon roller and can apply Divine Strike',()=>{
 let s=C.chooseStrikes(fixture(8,'War Domain'),'Divine Strike');s.inventory={items:[]};s.inventory.items.push(I.gear('w-test','Mace','weapon',1,'',{equipped:true,weapon:{category:'Simple',kind:'Melee',damage:'1d6',type:'Bludgeoning',properties:'',proficiency:'auto',ability:'str',magicBonus:0,attackAdjustment:0,damageAdjustment:0}}));
 s=C.newTurn(s);s=C.weaponAttack(s,{weaponId:'w-test',targetAC:12,confirmed:true},roll);A.equal(s.resources.lastClassEffect.extraDamage,5);A.equal(s.resources.classState.clericActionUsed,true);A.throws(()=>C.weaponAttack(s,{weaponId:'w-test',targetAC:12,confirmed:true},roll),/Action|action already spent/);
});
test('Life and Trickery are absent below level 3; other classes and Pip cannot use Cleric methods',()=>{
 for(const cls of ['Monk','Ranger','Paladin','Fighter','Rogue','Barbarian','Wizard']){let s=fixture(17);s.character.className=cls;s.character.build.characterClass=cls;A.equal(C.isCleric(s.character),false);A.throws(()=>C.turnUndead(s,{confirmed:true}),/Cleric/);}
 A.throws(()=>C.lightRadiance(fixture(2,'Light Domain'),{confirmed:true}),/required/);
});
