(function(root){'use strict';
// 2024 Player's Handbook species implementation. Original summaries and tracked effects;
// manuscript text is not redistributed. Enemy outcomes remain DM-confirmed.
const PB=c=>2+Math.floor((Math.max(1,Number(c?.level)||1)-1)/4);
const id=c=>{const key=c?.build?.ids?.species||'';return key.startsWith('species:')?key.slice(8):({'Aasimar':'aasimar','Dragonborn':'dragonborn','Dwarf':'dwarf','Elf':'elf','Gnome':'gnome','Goliath':'goliath','Halfling':'halfling','Human':'human','Orc':'orc','Tiefling':'tiefling'}[c?.species]||'');};
const PHB=['aasimar','dragonborn','dwarf','elf','gnome','goliath','halfling','human','orc','tiefling'];
const supported=c=>c?.templateKind==='starter'&&PHB.includes(id(c));
const variant=c=>c?.build?.speciesVariant||'';
const spellAbility=c=>c?.build?.speciesCastingAbility||'';
const mod=(c,a='cha')=>Math.floor(((Number(c?.scores?.[a])||10)-10)/2);
const spellStats=c=>spellAbility(c)?{ability:spellAbility(c),saveDC:8+PB(c)+mod(c,spellAbility(c)),attackBonus:PB(c)+mod(c,spellAbility(c))}:null;
const ancestryDamage=Object.freeze({Black:'Acid',Blue:'Lightning',Brass:'Fire',Bronze:'Lightning',Copper:'Acid',Gold:'Fire',Green:'Poison',Red:'Fire',Silver:'Cold',White:'Cold'});
const heritageDamage=c=>id(c)==='dragonborn'?ancestryDamage[variant(c)]||'':id(c)==='aasimar'?'Radiant':id(c)==='dwarf'?'Poison':id(c)==='tiefling'?({Abyssal:'Poison',Chthonic:'Necrotic',Infernal:'Fire'}[variant(c)]||''):'';
const PASSIVE={aasimar:['Necrotic and Radiant resistance','Darkvision 60 ft'],dragonborn:['Resistance to chosen ancestry damage','Darkvision 60 ft'],dwarf:['Poison resistance and advantage against Poisoned','Darkvision 120 ft','Maximum HP +1 per level'],elf:['Advantage on saves to avoid/end Charmed','Trance: four-hour conscious Long Rest','Darkvision 60 ft (Drow 120 ft)'],gnome:['Advantage on INT, WIS and CHA saving throws','Darkvision 60 ft'],goliath:['Carry as one size larger; advantage on saves to end Grappled','35 ft base speed'],halfling:['Advantage on saves against Frightened','Move through larger creatures’ spaces','Hide behind larger creatures'],human:['Additional Origin feat choice','Skill proficiency choice'],orc:['Darkvision 120 ft'],tiefling:['Darkvision 60 ft','Legacy damage resistance']};
const SPELLS={
 elf:{Drow:[[1,'Dancing Lights'],[3,'Faerie Fire'],[5,'Darkness']], 'High Elf':[[1,'Prestidigitation'],[3,'Detect Magic'],[5,'Misty Step']], 'Wood Elf':[[1,'Druidcraft'],[3,'Longstrider'],[5,'Pass without Trace']]},
 gnome:{'Forest Gnome':[[1,'Minor Illusion'],[1,'Speak with Animals']], 'Rock Gnome':[[1,'Mending'],[1,'Prestidigitation']]},
 tiefling:{Abyssal:[[1,'Poison Spray'],[1,'Thaumaturgy'],[3,'Ray of Sickness'],[5,'Hold Person']],Chthonic:[[1,'Chill Touch'],[1,'Thaumaturgy'],[3,'False Life'],[5,'Ray of Enfeeblement']],Infernal:[[1,'Fire Bolt'],[1,'Thaumaturgy'],[3,'Hellish Rebuke'],[5,'Darkness']]},
 aasimar:{'':[[1,'Light']]}
};
function grants(c){if(!supported(c))return [];let table=(SPELLS[id(c)]||{})[variant(c)]||(SPELLS[id(c)]||{})['']||[];
 if(id(c)==='elf'&&variant(c)==='High Elf'&&c.build?.speciesHighElfCantrip)table=table.map(([n,s])=>s==='Prestidigitation'?[n,c.build.speciesHighElfCantrip]:[n,s]);
 return table.filter(([n])=>c.level>=n).map(([,s])=>s);
}
function specifications(c){if(!supported(c))return [];const pb=PB(c),s=id(c);let o=[];
 if(s==='aasimar')o=[['healing',1,'long'],...(c.level>=5?[['revelation',1,'long']]:[])];
 if(s==='dragonborn')o=[['breath',pb,'long'],...(c.level>=5?[['flight',1,'long']]:[])];
 if(s==='dwarf')o=[['stone',pb,'long']];
 if(s==='elf')o=[...(c.level>=3?[['spell3',1,'long']]:[]),...(c.level>=5?[['spell5',1,'long']]:[])];
 if(s==='gnome'&&variant(c)==='Forest Gnome')o=[['speak',pb,'long']];
 if(s==='goliath')o=[['ancestry',pb,'long'],...(c.level>=5?[['large',1,'long']]:[])];
 if(s==='orc')o=[['rush',pb,'short'],['endurance',1,'long']];
 if(s==='tiefling')o=[...(c.level>=3?[['spell3',1,'long']]:[]),...(c.level>=5?[['spell5',1,'long']]:[])];
 return o.map(([key,max,reset])=>({key,max,reset}));
}
function normalize(c,state={},oldC=null){const fresh=!oldC||id(c)!==id(oldC),old=oldC?Object.fromEntries(specifications(oldC).map(x=>[x.key,x.max])):{};const charges={};for(const spec of specifications(c)){const was=state?.charges?.[spec.key];charges[spec.key]=fresh||!Number.isInteger(was)?spec.max:Math.min(spec.max,Math.max(0,was+Math.max(0,spec.max-(old[spec.key]??spec.max))));}return {charges,active:fresh?{}:{...(state?.active||{})},last:fresh?'':String(state?.last||'').slice(0,400)};}
function rest(c,state={},kind='long'){let next=normalize(c,state,c);for(const spec of specifications(c))if(kind==='long'||spec.reset==='short')next.charges[spec.key]=spec.max;if(kind==='long')next.active={};return next;}
function charge(c,r,key){const spec=specifications(c).find(x=>x.key===key);return spec?(r?.speciesState?.charges?.[key]??spec.max):0;}
function spend(state,key,patch={},detail=''){const c=state.character;if(!supported(c))throw Error('The selected character does not have a 2024 PHB species ability.');const spec=specifications(c).find(x=>x.key===key);if(!spec||charge(c,state.resources,key)<=0)throw Error('No uses remain for this species ability.');const old=normalize(c,state.resources.speciesState,c);const next={...old,charges:{...old.charges,[key]:old.charges[key]-1},active:{...old.active,...patch},last:String(detail||'').slice(0,400)};return {...state,resources:{...state.resources,speciesState:next,lastClassEffect:{feature:'Species · '+c.species,note:next.last}}};}
function use(state,kind,opts={},roll=n=>Math.floor(Math.random()*n)+1){const c=state.character,s=id(c),pb=PB(c),v=variant(c),r=state.resources,ok=!!opts.confirmed;
 if(!supported(c))throw Error('Choose a 2024 PHB species in the character builder.');
 const requireConfirm=()=>{if(!ok)throw Error('Confirm the stated trigger, target or position with your DM before using this ability.');};
 if(kind==='heal'&&s==='aasimar'){requireConfirm();let amount=0;for(let i=0;i<pb;i++)amount+=roll(4);const n=spend(state,'healing',{},`Healing Hands: ${pb}d4 = ${amount} HP; ${opts.self?'self target':'other target to record manually'}.`);return opts.self?{...n,resources:root.PipCore?.applyHealing?root.PipCore.applyHealing(n.resources,amount):{...n.resources,hp:Math.min(n.resources.maxHp,n.resources.hp+amount)}}:n;}
 if(kind==='revelation'&&s==='aasimar'&&c.level>=5){const mode=opts.mode;if(!['Heavenly Wings','Inner Radiance','Necrotic Shroud'].includes(mode))throw Error('Choose a Celestial Revelation form.');requireConfirm();return spend(state,'revelation',{revelation:mode,revelationBonusUsed:false},`Celestial Revelation (${mode}) active for up to 1 minute. Once per turn, confirmed damage adds ${pb} ${mode==='Necrotic Shroud'?'Necrotic':'Radiant'} damage. DM resolves nearby creature saves and effects.`);}
 if(kind==='revelation-bonus'&&s==='aasimar'){if(!r.speciesState?.active?.revelation||r.speciesState?.active?.revelationBonusUsed)throw Error('Revelation bonus already used this turn or not active.');requireConfirm();return mutate(state,{revelationBonusUsed:true},`Revelation damage +${pb} on a confirmed damaging spell or attack.`);}
 if(kind==='breath'&&s==='dragonborn'){requireConfirm();const dice=c.level>=17?4:c.level>=11?3:c.level>=5?2:1;let total=0;for(let i=0;i<dice;i++)total+=roll(10);return spend(state,'breath',{},`Breath Weapon: ${opts.shape==='line'?'30-ft line, 5 ft wide':'15-ft cone'}; ${dice}d10 ${heritageDamage(c)} = ${total}; Dexterity save DC ${8+mod(c,'con')+pb}; success halves. Replaces one attack of Attack action; DM confirms targets and saves.`);}
 if(kind==='flight'&&s==='dragonborn'&&c.level>=5){return spend(state,'flight',{flight:true},'Draconic Flight active: fly speed equals walking speed, up to 10 minutes.');}
 if(kind==='stone'&&s==='dwarf'){requireConfirm();return spend(state,'stone',{stone:true},'Stonecunning active: Tremorsense 60 ft for 10 minutes, only while touching/standing on stone.');}
 if(kind==='ancestry'&&s==='goliath'){requireConfirm();if(!v)throw Error('Choose Giant Ancestry first.');const extra={Fire:`+${roll(10)} Fire damage`,Frost:`+${roll(6)} Cold damage; speed -10 ft until next turn`,Hill:'Large or smaller confirmed target Prone',Cloud:'Teleport up to 30 ft to confirmed visible unoccupied space',Stone:`Reduce triggering damage by ${Math.max(0,roll(12)+mod(c,'con'))}`,Storm:`Deal ${roll(8)} Thunder to confirmed creature within 60 ft`};return spend(state,'ancestry',{},`${v} Giant Ancestry: ${extra[v]||'See feature'}. ${['Fire','Frost','Hill'].includes(v)?'Requires a confirmed damaging attack.': 'Requires a confirmed trigger.'} No enemy HP/conditions changed.`);}
 if(kind==='large'&&s==='goliath'&&c.level>=5){requireConfirm();return spend(state,'large',{large:true},'Large Form active for 10 minutes: Large, +10 ft speed, Advantage on Strength checks; must have sufficient space.');}
 if(kind==='rush'&&s==='orc'){requireConfirm();const n=spend(state,'rush',{},`Adrenaline Rush: Bonus Action Dash and ${pb} temporary HP.`);return {...n,resources:{...n.resources,tempHp:Math.max(n.resources.tempHp||0,pb)}};}
 if(kind==='endurance'&&s==='orc'){requireConfirm();if(r.hp!==0)throw Error('Use after damage reduces HP to zero without killing the character outright.');const n=spend(state,'endurance',{},'Relentless Endurance: remain at 1 HP rather than 0; trigger confirmed by DM.');return {...n,resources:{...n.resources,hp:1}};}
 if(kind==='speak'&&s==='gnome'&&v==='Forest Gnome'){return spend(state,'speak',{},'Speak with Animals cast without a slot (Forest Gnome).');}
 if(kind==='device'&&s==='gnome'&&v==='Rock Gnome'){requireConfirm();const active=(r.speciesState?.active?.devices||0);if(active>=3)throw Error('Three clockwork devices already exist. Dismantle one first.');return mutate(state,{devices:active+1},`Rock Gnome device ${active+1}/3: cast Prestidigitation for 10 minutes; device lasts 8 hours. Confirm effect with DM.`);}
 if(kind==='device-remove'&&s==='gnome'&&v==='Rock Gnome'){return mutate(state,{devices:Math.max(0,(r.speciesState?.active?.devices||0)-1)},'Clockwork device dismantled/expired.');}
 if(kind==='luck'&&s==='halfling'){requireConfirm();return mutate(state,{},`Halfling Luck: qualifying natural 1 rerolled into ${roll(20)}; use new result.`);}
 if(kind==='end'&&['aasimar','dragonborn','dwarf','goliath'].includes(s)){return mutate(state,{revelation:null,flight:false,stone:false,large:false},'Species transformation/sense ended.');}
 if(kind==='new-turn'&&s==='aasimar')return mutate(state,{revelationBonusUsed:false},'New turn: Celestial Revelation bonus ready if active.');
 throw Error('That species feature is not available for this character and level.');
}
function startTurn(state){if(!supported(state.character))return state;const prior=state.resources.speciesState;if(!prior?.active?.revelationBonusUsed)return state;return {...state,resources:{...state.resources,speciesState:{...prior,active:{...prior.active,revelationBonusUsed:false}}}};}
function mutate(state,patch,detail){const old=normalize(state.character,state.resources.speciesState,state.character);return {...state,resources:{...state.resources,speciesState:{...old,active:{...old.active,...patch},last:detail},lastClassEffect:{feature:'Species · '+state.character.species,note:detail}}};}
function speciesSpell(c,name){if(!supported(c)||!grants(c).includes(name))return null;const all=(SPELLS[id(c)]||{})[variant(c)]||(SPELLS[id(c)]||{})['']||[];const row=all.find(([n,s])=>s===name);if(!row||row[0]<=1)return null;return row[0]===3?'spell3':'spell5';}
root.FolioSpecies2024={PB,id,PHB,supported,variant,mod,heritageDamage,PASSIVE,grants,specifications,normalize,rest,charge,use,startTurn,speciesSpell,spellAbility,spellStats};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioSpecies2024;
})(typeof window!=='undefined'?window:globalThis);
