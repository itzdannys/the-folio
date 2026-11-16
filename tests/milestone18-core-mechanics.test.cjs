const {test}=require('node:test'),assert=require('node:assert/strict');
require('../js/inventory.js');require('../js/data.js');require('../js/class-mechanics.js');require('../js/core.js');require('../js/character.js');require('../js/dice.js');require('../js/journal.js');require('../js/appearance.js');require('../js/layout.js');require('../js/storage.js');
const M=require('../js/class-mechanics.js'),B=require('../js/builder.js'),L=require('../js/library.js'),S=globalThis.PipStorage,C=globalThis.PipCore,WR=require('../js/weapon-rules.js'),FR=require('../js/rules-engine.js'),I=globalThis.PipInventory;
function build(className,level=5,scores={str:16,dex:14,con:14,int:12,wis:14,cha:16}){
 const c={templateKind:'starter',level,scores,profSaves:[],profSkills:[],expertise:[],speed:30,overrides:{},build:{characterClass:className,slotMax:B.slotsFor(B.classes.find(x=>x.name===className),level)}};return c;
}
function stateFor(className,level=5){const character=build(className,level),resources={hp:10,maxHp:45,spellSlots:[...(character.build.slotMax||Array(9).fill(0))],classResources:M.normalizeResources(character),classState:{},concentration:''};return {character,resources,inventory:{items:[]}};}
test('SRD class resource catalogues have no invented counters for Rogue and cover all other classes',()=>{
 assert.equal(M.resourcesFor(build('Rogue')).length,0);
 for(const name of ['Barbarian','Bard','Cleric','Druid','Fighter','Monk','Paladin','Ranger','Sorcerer','Warlock','Wizard'])assert.ok(M.resourcesFor(build(name)).length>0,name);
 assert.equal(M.resourcesFor(build('Barbarian',1)).find(x=>x.key==='rage').max,2);
 assert.equal(M.resourcesFor(build('Barbarian',17)).find(x=>x.key==='rage').max,6);
 assert.equal(M.resourcesFor(build('Fighter',10)).find(x=>x.key==='second-wind').max,4);
 assert.equal(M.resourcesFor(build('Fighter',17)).find(x=>x.key==='action-surge').max,2);
 assert.equal(M.resourcesFor(build('Druid',17)).find(x=>x.key==='wild-shape').max,4);
 assert.equal(M.resourcesFor(build('Paladin',11)).find(x=>x.key==='channel-divinity').max,3);
 assert.equal(M.resourcesFor(build('Cleric',18)).find(x=>x.key==='channel-divinity').max,4);
 assert.equal(M.resourcesFor(build('Ranger',17)).find(x=>x.key==='favored-enemy').max,6);
 assert.equal(M.resourcesFor(build('Monk',20)).find(x=>x.key==='focus-points').max,20);
});
test('per-class rest rules restore exact capacities, avoiding a generic long-rest reset on short rests',()=>{
 const cleric=build('Cleric',6),rage=build('Barbarian',5),monk=build('Monk',8),bard=build('Bard',5);
 assert.equal(M.rest(cleric,{'channel-divinity':0},'short')['channel-divinity'],1);
 assert.equal(M.rest(cleric,{'channel-divinity':1},'long')['channel-divinity'],3);
 assert.equal(M.rest(rage,{rage:0},'short').rage,1);
 assert.equal(M.rest(monk,{'focus-points':2},'short')['focus-points'],8);
 assert.equal(M.rest(bard,{'bardic-inspiration':0},'short')['bardic-inspiration'],3);
 assert.equal(M.rest(build('Bard',4),{'bardic-inspiration':0},'short')['bardic-inspiration'],0);
});
test('class counter level-ups retain spent uses and do not corrupt class switches',()=>{
 const before=build('Fighter',3),after=build('Fighter',4);
 assert.equal(M.normalizeResources(after,{'second-wind':1,'action-surge':0},before)['second-wind'],2);
 assert.equal(M.normalizeResources(build('Monk',5),{'second-wind':1},before)['focus-points'],5);
 assert.throws(()=>M.adjust(build('Rogue'),'rage',-1),/Invalid class resource/);
});
test('Barbarian and Monk receive their real unarmored AC and movement without applying it through armor',()=>{
 const barbarian=build('Barbarian',5),monk=build('Monk',6);
 assert.equal(C.derived(barbarian,{items:[]}).ac,14,'Barbarian = 10 + Dex(2) + Con(2)');
 assert.equal(C.derived(monk,{items:[]}).ac,14,'Monk = 10 + Dex(2) + Wis(2)');
 assert.equal(M.passive(monk,{items:[]}).movement,15);
 const shield={category:'shield',quantity:1,equipped:true,armor:{baseAC:2}};
 assert.equal(M.passive(monk,{items:[shield]}).unarmoredAC,null);
 const armor={category:'armor',quantity:1,equipped:true,armor:{kind:'heavy',baseAC:16}};
 assert.equal(M.passive(barbarian,{items:[armor]}).unarmoredAC,null);
 assert.equal(M.passive(barbarian,{items:[armor]}).movement,0);
});
test('Fighter and Rogue passive advancement is derived from exact level thresholds',()=>{
 assert.equal(M.passive(build('Fighter',4),{items:[]}).attacks,1);
 assert.equal(M.passive(build('Fighter',5),{items:[]}).attacks,2);
 assert.equal(M.passive(build('Fighter',11),{items:[]}).attacks,3);
 assert.equal(M.passive(build('Fighter',20),{items:[]}).attacks,4);
 assert.equal(M.passive(build('Rogue',7),{items:[]}).rogueSneakAttackDice,4);
});
test('Rage spending ends concentration, prevents casting, disallows heavy armor, and stops when toggled off',()=>{
 let state=stateFor('Barbarian',5);state.resources.concentration='Bless';
 state=M.startRage(state);assert.equal(state.resources.classState.raging,true);assert.equal(state.resources.concentration,'');assert.equal(state.resources.classResources.rage,2);
 assert.deepEqual(FR.castOptions(state.character,{},state.resources,'any'),[]); // API returns no options while raging
 state=M.startRage(state);assert.equal(state.resources.classState.raging,false);assert.equal(state.resources.classResources.rage,2);
 state.inventory.items=[{category:'armor',quantity:1,equipped:true,armor:{kind:'heavy',baseAC:16}}];assert.throws(()=>M.startRage(state),/Heavy armor/);
});
test('Second Wind heals exactly die + Fighter level, respects cap, and spends a use',()=>{
 let s=stateFor('Fighter',5);s=M.useSecondWind(s,7);assert.equal(s.resources.hp,22);assert.equal(s.resources.classResources['second-wind'],2);
 assert.equal(M.useSecondWind({...s,resources:{...s.resources,hp:40}},10).resources.hp,45);
 assert.throws(()=>M.useSecondWind(s,0),/Roll a d10/);
});
test('Lay On Hands heals self and deducts exact pool, rejecting overspend',()=>{
 let s=stateFor('Paladin',7);s=M.useLayOnHands(s,12);assert.equal(s.resources.hp,22);assert.equal(s.resources.classResources['lay-on-hands'],23);
 assert.throws(()=>M.useLayOnHands(s,24),/Not enough/);
});
test('Magical Cunning restores rounded-up half of spent pact slots and only once per long rest',()=>{
 let s=stateFor('Warlock',11);const ix=s.resources.spellSlots.findIndex(x=>x>0);s.resources.spellSlots[ix]=0;
 s=M.useMagicalCunning(s);assert.equal(s.resources.spellSlots[ix],2);assert.equal(s.resources.classResources['magical-cunning'],0);
 assert.throws(()=>M.useMagicalCunning(s),/already/);
});
test('Font of Magic converts slots/points with cost table, validates limits, and Sorcerous Restoration recovers points',()=>{
 let s=stateFor('Sorcerer',7);s.resources.classResources['sorcery-points']=4;
 s=M.convertSorcery(s,'to-points',2);assert.equal(s.resources.classResources['sorcery-points'],6);assert.equal(s.resources.spellSlots[1],2);
 s=M.convertSorcery(s,'to-slot',2);assert.equal(s.resources.classResources['sorcery-points'],3);assert.equal(s.resources.spellSlots[1],3);
 assert.throws(()=>M.useSorcerousRestoration(s),/Short Rest/);s.resources.classState=M.restClassState(s.character,s.resources.classState,'short');
 s=M.useSorcerousRestoration(s);assert.equal(s.resources.classResources['sorcery-points'],6);assert.equal(s.resources.classResources['sorcerous-restoration'],0);
 assert.throws(()=>M.useSorcerousRestoration(s),/Short Rest|already/);
});
test('Rage damage bonus applies to actual Strength weapon attacks, not Dexterity attacks',()=>{
 const s=stateFor('Barbarian',9),item=I.gear('test-sword','Test sword','weapon',1,'',{equipped:true,weapon:I.weapon('1d8','Slashing','5 ft','',{ability:'str',category:'Martial',kind:'Melee'})});
 s.inventory.items=[item];s.resources.classState.raging=true;
 const rr=()=>4,att=WR.attack(s.character,s.inventory,item.id,'melee','normal',11,rr,s.resources);
 assert.equal(att.result.damageBonus,6,'Str +3 + Rage +3');
});
test('new class resource state survives normalized backups without altering legacy specialist saves',()=>{
 let s=L.startCharacter({name:'River'}).present;
 const b=B.buildFromInput({name:'River',classId:'class:fighter',speciesId:'species:dwarf',backgroundId:'background:criminal',level:5,scores:{str:16,dex:12,con:14,int:10,wis:10,cha:10},backgroundPlus:'dex',backgroundOne:'con',backgroundMethod:'split'});
 s=B.applyToState(s,b);assert.equal(s.resources.classResources['second-wind'],3);
 s.resources.classResources['second-wind']=1;
 const restored=S.migrate(s);assert.equal(restored.resources.classResources['second-wind'],1);assert.equal(S.validate(restored),true);
 assert.equal(S.validate(globalThis.PipData.newState()),true);
});
