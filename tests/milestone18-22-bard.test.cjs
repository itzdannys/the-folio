'use strict';
const {test}=require('node:test'),A=require('node:assert/strict');
for(const f of ['data','inventory','spell-catalog','spell-expansions','spell-supplements','weapon-catalog','bard-2024','class-mechanics','core','builder','rules-engine','weapon-rules','storage'])require('../js/'+f+'.js');
const B=require('../js/bard-2024.js'),M=require('../js/class-mechanics.js'),Bu=require('../js/builder.js'),FR=require('../js/rules-engine.js'),C=require('../js/core.js'),I=require('../js/inventory.js'),WR=require('../js/weapon-rules.js'),S=require('../js/storage.js');
const roll=s=>s===20?15:s===12?7:s===10?6:s===8?5:s===6?4:3;
function fixture(level=3,subclass='College of Lore'){
 const c={templateKind:'starter',name:'Test Bard',className:'Bard',level,subclass,scores:{str:10,dex:16,con:14,int:12,wis:12,cha:18},profSaves:['dex','cha'],profSkills:['Performance','Persuasion','Stealth'],expertise:[],tools:[],speed:30,build:{characterClass:'Bard',subclass,spellAbility:'cha',slotMax:Bu.slotsFor({casting:'full'},level),grantedFeatNames:[]}};
 return {version:6,character:c,inventory:I.defaults(),resources:{hp:30,maxHp:95,tempHp:0,conditions:[],classResources:M.normalizeResources(c),classState:{},spellSlots:[...c.build.slotMax],concentration:''},spellbook:{prepared:[],catalogSelections:[],castLog:[],queued:[],custom:[]},encounter:{active:false,roster:[],round:1,currentId:null}};
}
test('Bard 2024 PHB colleges are selectable with stable IDs',()=>{const opts=Bu.optionList('subclass').filter(x=>x.classId==='class:bard');A.deepEqual(opts.map(x=>x.name).sort(),['College of Dance','College of Glamour','College of Lore','College of Valor'].sort());A.equal(new Set(opts.map(x=>x.id)).size,4);});
test('Bard levels 1–20: resource capacity, die sizes, subclass gating and prepared spells',()=>{
 const prepared=[4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22];for(let n=1;n<=20;n++){const s=fixture(n),spec=M.resourcesFor(s.character).find(x=>x.key==='bardic-inspiration');A.equal(spec.max,4);A.equal(spec.reset,n>=5?'short':'long');A.equal(B.die(s.character),n>=15?12:n>=10?10:n>=5?8:6);A.equal(FR.preparationLimits(s.character).prepared,prepared[n-1]);A.equal(FR.preparationLimits(s.character).cantrips,n>=10?4:n>=4?3:2);A.equal(B.lore(s.character),n>=3);}
});
test('Bard skills and Expertise are saved explicitly at levels 2 and 9',()=>{
 let s=fixture(2);s=B.chooseClassSkills(s,['History','Insight','Performance']);A.deepEqual(s.character.build.bardClassSkills,['History','Insight','Performance']);s=B.chooseExpertise(s,['Performance','Insight']);A.deepEqual(s.character.expertise.sort(),['Insight','Performance']);A.throws(()=>B.chooseExpertise(s,['Performance','Stealth','Insight']),/2/);
 s={...s,character:{...s.character,level:9}};s=B.chooseExpertise(s,['Performance','Insight','History','Stealth']);A.equal(s.character.expertise.length,4);
});
test('Jack of All Trades applies half proficiency on untrained skills and initiative, not trained skills',()=>{
 const s=fixture(9),v=C.derived(s.character,s.inventory,s.resources);A.equal(v.initiative,3+2);A.equal(M.resolveAbilityCheck(s,{name:'Athletics',dc:10},[10]).resources.lastClassEffect.modifier,0+2);A.equal(M.resolveAbilityCheck(s,{name:'Performance',dc:10},[10]).resources.lastClassEffect.modifier,4+4);
});
test('Bard turn tracking enforces Bonus Action on Inspiration and resets next turn',()=>{
 let s=B.newTurn(fixture());s=B.grantInspiration(s,{recipient:'Ally',confirmed:true});A.equal(s.resources.classResources['bardic-inspiration'],3);A.equal(s.resources.classState.bardBonusUsed,true);A.throws(()=>B.grantInspiration(s,{recipient:'Second ally',confirmed:true}),/Bonus Action/);s=B.newTurn(s);A.equal(s.resources.classState.bardBonusUsed,false);A.throws(()=>B.grantInspiration(s,{recipient:'Test Bard',confirmed:true}),/another/);
});
test('Font of Inspiration spends a slot but no Action and recovers a single use',()=>{
 let s=fixture(5);s=B.grantInspiration(s,{recipient:'Other',confirmed:true});const before=s.resources.spellSlots[0];s=B.font(s,1);A.equal(s.resources.spellSlots[0],before-1);A.equal(s.resources.classResources['bardic-inspiration'],4);A.throws(()=>B.font(s,1),/already full/);A.throws(()=>B.font(fixture(4),1),/level 5/);
});
test('Bardic Inspiration short-rest recovery begins at 5, not 4',()=>{
 const l4=fixture(4),l5=fixture(5);l4.resources.classResources['bardic-inspiration']=0;l5.resources.classResources['bardic-inspiration']=0;A.equal(M.rest(l4.character,l4.resources.classResources,'short')['bardic-inspiration'],0);A.equal(M.rest(l5.character,l5.resources.classResources,'short')['bardic-inspiration'],4);
});
test('Superior Inspiration restores at least two Inspiration at Initiative; never runs before 18',()=>{
 let s=fixture(18);s.resources.classResources['bardic-inspiration']=0;s=B.superiorInitiative(s);A.equal(s.resources.classResources['bardic-inspiration'],2);A.throws(()=>B.superiorInitiative(fixture(17)),/18/);
});
test('Dance unarmored defense only when no armor or Shield and Valor has martial proficiency',()=>{
 const dance=fixture(3,'College of Dance'),v=C.derived(dance.character,dance.inventory,dance.resources);A.equal(v.ac,17);const w={category:'Martial',kind:'Melee',name:'Longsword',properties:[]};A.equal(WR.proficient(dance.character,w),false);A.equal(WR.proficient(fixture(3,'College of Valor').character,w),true);
});
test('Agile Strikes requires paid Inspiration and resolves Dex weaponless hit with critical dice',()=>{
 let s=B.newTurn(fixture(3,'College of Dance'));A.throws(()=>B.danceStrike(s,{targetAC:10,confirmed:true},roll),/spending Bardic Inspiration/);s=B.grantInspiration(s,{recipient:'Dancer ally',confirmed:true});s=B.danceStrike(s,{targetAC:10,confirmed:true},roll);A.equal(s.resources.lastClassEffect.damage,7);A.equal(s.resources.classState.bardAgileReady,false);A.throws(()=>B.danceStrike(s,{targetAC:10,confirmed:true},roll),/spending Bardic Inspiration/);
});
test('Dance Inspiring Movement costs Reaction and Inspiration, Tandem Footwork initiative die',()=>{
 let s=B.newTurn(fixture(6,'College of Dance'));s=B.danceMove(s,{confirmed:true});A.equal(s.resources.classState.reactionUsed,true);A.equal(s.resources.classResources['bardic-inspiration'],3);A.throws(()=>B.danceMove(s,{confirmed:true}),/Reaction/);s=B.danceTandem(s,{confirmed:true},roll);A.equal(s.resources.lastClassEffect.bonus,5);A.throws(()=>B.danceTandem(s,{confirmed:true},roll),/already/);
});
test('Leading Evasion sets damage fraction for own and valid adjacent allies at 14',()=>{
 const c=fixture(14,'College of Dance').character;A.equal(B.danceEvasion(c,true,2).selfFraction,0);A.equal(B.danceEvasion(c,false,2).allyFraction,0.5);A.throws(()=>B.danceEvasion(fixture(13,'College of Dance').character,true),/14/);
});
test('Glamour has always-prepared spells at 3 and Command at 6',()=>{
 A.deepEqual(B.grantSpells(fixture(3,'College of Glamour').character),['Charm Person','Mirror Image']);A.ok(FR.classGrantedSpellNames(fixture(6,'College of Glamour').character).includes('Command'));A.equal(FR.classGrantedSpellNames(fixture(2,'College of Glamour').character).includes('Command'),false);
});
test('Mantle of Inspiration spends one use and shares twice the Bardic die as temporary HP',()=>{
 let s=B.newTurn(fixture(3,'College of Glamour'));s=B.glamourMantle(s,{targetCount:4,confirmed:true},roll);A.equal(s.resources.lastClassEffect.temporaryHpEach,8);A.equal(s.resources.classResources['bardic-inspiration'],3);A.equal(s.resources.classState.bardBonusUsed,true);A.throws(()=>B.glamourMantle(s,{targetCount:5,confirmed:true},roll),/maximum/);
});
test('Beguiling Magic only follows a slotted Enchantment/Illusion spell, one free use then Inspiration',()=>{
 let s=B.newTurn(fixture(6,'College of Glamour'));A.throws(()=>B.glamourBeguiling(s,{target:'Goblin',saveTotal:10,confirmed:true}),/Cast a qualifying/);
 s=B.recordSpellCast(s,{name:'Charm Person',school:'Enchantment',time:'Action'},'slot1');s=B.glamourBeguiling(s,{target:'Goblin',saveTotal:11,confirmed:true});A.equal(s.resources.lastClassEffect.failed,true);A.equal(s.resources.classResources['bardic-inspiration'],4);s=B.newTurn(s);s=B.recordSpellCast(s,{name:'Mirror Image',school:'Illusion',time:'Action'},'slot2');A.throws(()=>B.glamourBeguiling(s,{target:'Orc',saveTotal:8,confirmed:true}),/already used|restore/);s=B.glamourBeguiling(s,{target:'Orc',saveTotal:8,confirmed:true,restore:true});A.equal(s.resources.classResources['bardic-inspiration'],3);
});
test('Mantle of Majesty tracks concentration, Bonus Action Command and slot restoration',()=>{
 let s=B.newTurn(fixture(9,'College of Glamour'));s=B.glamourMajesty(s,{mode:'start',confirmed:true});A.equal(s.resources.classState.bardMantleMajestyRounds,10);s=B.newTurn(s);s=B.glamourMajesty(s,{mode:'command',confirmed:true});A.equal(s.resources.classState.bardBonusUsed,true);s=B.glamourMajesty(s,{mode:'end'});A.equal(s.resources.classState.bardMantleMajestyActive,false);s=B.glamourRestoreMajesty(s,5);A.equal(s.resources.classState.bardMantleMajestyUsed,false);
});
test('Unbreakable Majesty lasts 10 rounds, one use per Short Rest',()=>{
 let s=B.newTurn(fixture(14,'College of Glamour'));s=B.glamourUnbreakable(s,{confirmed:true});A.equal(s.resources.classState.bardUnbreakableRounds,10);s=B.newTurn(s);A.equal(s.resources.classState.bardUnbreakableRounds,9);A.throws(()=>B.glamourUnbreakable(s,{confirmed:true}),/Short Rest/);A.equal(B.restState(s.character,s.resources.classState,'short').bardUnbreakableUsed,false);
});
test('College of Lore saves exactly three new skill proficiencies and allows changing them',()=>{
 let s=fixture(3,'College of Lore');s=B.loreSkills(s,['History','Insight','Acrobatics']);A.ok(s.character.profSkills.includes('History'));A.deepEqual(s.character.build.bardLoreSkillChoices,['History','Insight','Acrobatics']);s=B.loreSkills(s,['Arcana','Nature','Religion']);A.ok(!s.character.profSkills.includes('History'));A.ok(s.character.profSkills.includes('Arcana'));
});
test('Lore Magical Discoveries chooses two legal external spells and grants them prepared',()=>{
 let s=fixture(6,'College of Lore');const all=FR.catalog(),wizard=all.find(x=>x.level===0&&x.classes?.includes('Wizard')&&!x.classes.includes('Bard')),cleric=all.find(x=>x.level===1&&x.classes?.includes('Cleric')&&!x.classes.includes('Bard'));
 A.ok(wizard&&cleric);s=B.loreDiscoveries(s,[wizard.key,cleric.key]);A.ok(s.character.build.bardLoreDiscoveryNames.includes(wizard.name));A.ok(FR.classGrantedSpellNames(s.character).includes(cleric.name));A.throws(()=>B.loreDiscoveries(s,[wizard.key,wizard.key]),/different/);A.throws(()=>B.loreDiscoveries(fixture(5,'College of Lore'),[wizard.key,cleric.key]),/level 6/);
});
test('Magical Secrets opens Cleric/Druid/Wizard lists only from level 10',()=>{
 const before=FR.spellAccess(fixture(9).character),after=FR.spellAccess(fixture(10).character);A.deepEqual(before.lists,['Bard']);A.deepEqual(after.lists,['Bard','Cleric','Druid','Wizard']);
});
test('Valor Combat Inspiration is owned by recipient; no second Inspiration use deducted',()=>{
 let s=fixture(3,'College of Valor');s=B.valorCombatInspiration(s,{mode:'defense',dieRoll:5,confirmed:true});A.equal(s.resources.classResources['bardic-inspiration'],4);A.equal(s.resources.lastClassEffect.mode,'defense');A.throws(()=>B.valorCombatInspiration(s,{mode:'offense',dieRoll:7,confirmed:true}),/result/);
});
test('Valor level 6 and 14 gain two attacks / Battle Magic, with shared Bonus Action',()=>{
 A.equal(M.passive(fixture(6,'College of Valor').character,{items:[]}).attacks,2);A.equal(M.passive(fixture(5,'College of Valor').character,{items:[]}).attacks,1);A.equal(M.passive(fixture(20,'College of Dance').character,{items:[]}).attacks,1);
 const c=fixture(14,'College of Valor').character,s=B.newTurn(fixture(14,'College of Valor'));const cast=B.recordSpellCast(s,{name:'Vicious Mockery',school:'Enchantment',time:'Action',level:0},'cantrip');A.equal(cast.resources.classState.bardBattleMagicReady,true);
});
test('Bard tracked casting enforces Action, Bonus and one slot per turn',()=>{
 let s=B.newTurn(fixture(9));s=B.recordSpellCast(s,{name:'Healing Word',time:'Bonus Action',level:1},'slot1');A.throws(()=>B.grantInspiration(s,{recipient:'Ally',confirmed:true}),/Bonus Action/);A.throws(()=>B.recordSpellCast(s,{name:'Command',time:'Action',level:1},'slot1'),/One spell slot/);s=B.recordSpellCast(s,{name:'Vicious Mockery',time:'Action',level:0},'cantrip');A.equal(s.resources.classState.bardActionUsed,true);
});
test('Words of Creation grants both Power Words without counting prepared selection',()=>{
 const c=fixture(20).character;A.ok(FR.classGrantedSpellNames(c).includes('Power Word Heal'));A.ok(FR.classGrantedSpellNames(c).includes('Power Word Kill'));A.equal(B.magicWords(c,{name:'Power Word Heal'}).secondTarget,true);A.equal(B.magicWords(fixture(19).character,{name:'Power Word Kill'}),null);
});
test('Short/Long Rests reset Bard timers and retain character skill/discovery choices',()=>{
 let s=fixture(17,'College of Glamour');s=B.glamourUnbreakable(s,{confirmed:true});const restored=M.restClassState(s.character,s.resources.classState,'short');A.equal(restored.bardUnbreakableActive,false);A.equal(restored.bardUnbreakableUsed,false);
 let b=fixture(9,'College of Lore');b=B.loreSkills(b,['Acrobatics','History','Insight']);const migrated=S.migrate(JSON.parse(JSON.stringify(b)));A.equal(migrated.character.build.bardLoreSkillChoices.length,3);
});
test('Pip and other classes stay isolated from Bard methods',()=>{
 for(const cls of ['Paladin','Fighter','Ranger','Cleric','Rogue']){const s=fixture(20);s.character.className=cls;s.character.build.characterClass=cls;A.equal(B.isBard(s.character),false);A.throws(()=>B.grantInspiration(s,{recipient:'Ally',confirmed:true}),/Bard/);}
});
test('Valor explicitly replaces first or second attack with action-time cantrip and cannot double-spend action',()=>{
 const spell={name:'Vicious Mockery',level:0,time:'Action',school:'Enchantment'};
 let s=B.newTurn(fixture(6,'College of Valor'));
 s=B.recordSpellCast(s,spell,'cantrip',{valorReplace:true});
 A.equal(s.resources.classState.bardAttackCount,1);A.equal(s.resources.classState.bardActionUsed,true);A.equal(s.resources.classState.bardCantripReplaced,true);
 A.throws(()=>B.recordSpellCast(s,spell,'cantrip',{valorReplace:true}),/No remaining/);
 A.throws(()=>B.recordSpellCast(s,spell,'cantrip'),/Action already spent/);
 A.throws(()=>B.recordSpellCast(B.newTurn(fixture(6,'College of Lore')),spell,'cantrip',{valorReplace:true}),/Only an action-time Valor/);
});
test('Dance initiative bonus actually updates encounter and resets the initiative-use flag for new combat',()=>{
 let s=fixture(6,'College of Dance');s.encounter={active:true,round:1,roster:[{id:'pip',name:'Bard',initiative:15,isPip:true}],currentId:null};
 s=B.danceTandem(s,{confirmed:true},roll);A.equal(s.encounter.roster[0].initiative,20);
 A.equal(s.resources.classState.bardTandemUsedInCombat,true);
 const f=B.restState(s.character,s.resources.classState,'long');A.equal(f.bardTandemUsedInCombat,false);
});
test('Superior Inspiration floor of 2 also works with low Charisma',()=>{
 let s=fixture(18);s.character.scores.cha=8;s.resources.classResources['bardic-inspiration']=0;
 s=B.superiorInitiative(s);A.equal(s.resources.classResources['bardic-inspiration'],2);
 s=B.grantInspiration(s,{recipient:'Ally',confirmed:true});A.equal(s.resources.classResources['bardic-inspiration'],1);
});
test('Glamour confirmed attacker Charisma save records whether the first attack misses',()=>{
 let s=B.newTurn(fixture(14,'College of Glamour'));
 A.throws(()=>B.glamourUnbreakableSave(s,{attacker:'Ogre',saveTotal:7,confirmed:true}),/Activate/);
 s=B.glamourUnbreakable(s,{confirmed:true});
 s=B.glamourUnbreakableSave(s,{attacker:'Ogre',saveTotal:7,confirmed:true});A.equal(s.resources.lastClassEffect.attackMisses,true);
 s=B.glamourUnbreakableSave(s,{attacker:'Witch',saveTotal:25,confirmed:true});A.equal(s.resources.lastClassEffect.attackMisses,false);
});
test('Lore Magical Discoveries never leak to another subclass or a level below 6',()=>{
 let s=fixture(6,'College of Lore');const spells=FR.catalog(),choices=spells.filter(x=>x.level===0&&x.classes?.includes('Wizard')&&!x.classes.includes('Bard')).slice(0,2);
 A.equal(choices.length,2);s=B.loreDiscoveries(s,choices.map(x=>x.key));
 const original=s.character,notLore={...original,build:{...original.build,subclass:'College of Dance'},subclass:'College of Dance'},lower={...original,level:5};
 A.ok(FR.classGrantedSpellNames(original).includes(choices[0].name));
 A.ok(!FR.classGrantedSpellNames(notLore).includes(choices[0].name));
 A.ok(!FR.classGrantedSpellNames(lower).includes(choices[0].name));
});
test('Casting a competing concentration spell ends tracked Mantle of Majesty',()=>{
 let s=B.newTurn(fixture(9,'College of Glamour'));s=B.glamourMajesty(s,{confirmed:true});s=B.newTurn(s);
 s=B.recordSpellCast(s,{name:'Hold Person',level:2,time:'Action',school:'Enchantment',concentration:true},'slot2');
 A.equal(s.resources.classState.bardMantleMajestyActive,false);
});
test('Rebuilding a Lore Bard at the next level preserves skill expertise and discovery choices',()=>{
 const L=require('../js/library.js');const raw=level=>({name:'Lore Keeper',classId:'class:bard',speciesId:'species:elf',backgroundId:'background:sage',subclassId:'subclass:college-of-lore',featId:'',level,scores:{str:10,dex:10,con:10,int:10,wis:10,cha:10},maxHp:'',backgroundPlus:'int',backgroundOne:'wis'});
 const build=Bu.buildFromInput(raw(6));let s=Bu.applyToState(L.startCharacter({name:'Lore Keeper'}).present,build);
 s=B.chooseClassSkills(s,['Performance','Persuasion','History']);s=B.chooseExpertise(s,['Performance','History']);
 s=B.loreSkills(s,['Acrobatics','Medicine','Stealth']);
 const selections=FR.catalog().filter(x=>x.level===0&&x.classes?.includes('Wizard')&&!x.classes.includes('Bard')).slice(0,2);
 A.equal(selections.length,2);s=B.loreDiscoveries(s,selections.map(x=>x.key));
 const oldSlots=s.character.build.slotMax,next=Bu.buildFromInput(raw(7),[],s.character.build);s=Bu.applyToState(s,next);
 A.equal(s.character.level,7);A.deepEqual(s.character.build.bardLoreDiscoveryKeys,selections.map(x=>x.key));
 A.ok(s.character.profSkills.includes('History'),'background proficiency is preserved');
 A.ok(s.character.profSkills.includes('Acrobatics'));A.ok(s.character.expertise.includes('Performance'));
 A.ok(FR.classGrantedSpellNames(s.character).includes(selections[0].name));
 A.equal(S.validate(s),true);
});
