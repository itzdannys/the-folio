(function(root){'use strict';
const F=root.FolioFeat2024;
const SPELLCHOICES=['Fey-Touched','Shadow-Touched','Ritual Caster','Telepathic','Telekinetic'];
const e=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const option=(list,v='',empty='Choose later')=>'<option value="">'+e(empty)+'</option>'+list.map(x=>`<option value="${e(x)}" ${x===v?'selected':''}>${e(x)}</option>`).join('');
const field=(key,label,values,value,blank)=>`<label class="feat-input">${e(label)}<select data-feat-field="${e(key)}">${option(values,value,blank)}</select></label>`;
function config(c,feat){const n=feat.name,v=F.configured(c,n),spells=root.FolioSpellRules?.catalog?.()||[];
 const schools=n==='Fey-Touched'?['Divination','Enchantment']:['Illusion','Necromancy'];let controls='';
 if(['Fey-Touched','Shadow-Touched'].includes(n))controls+=field('spell','Additional level-1 spell',[...new Set(spells.filter(x=>x.level===1&&schools.includes(x.school)).map(x=>x.name))].sort(),v.spell);
 if(n==='Ritual Caster'){const all=[...new Set(spells.filter(x=>x.level===1&&x.ritual).map(x=>x.name))].sort();controls+=Array.from({length:F.PB(c)},(_,i)=>field('ritual-'+i,`Prepared ritual ${i+1}`,all,(v.rituals||[])[i])).join('');}
 if(n==='Elemental Adept'){const num=Math.max(1,F.count(c,n));controls+=Array.from({length:num},(_,i)=>field('damageType-'+i,'Damage type '+(i+1),F.ELEMENTS,(v.damageTypes||[])[i])).join('');}
 if(n==='Boon of Energy Resistance')controls+=field('resistance-0','Resistance 1',F.ENERGY,v.resistances?.[0])+field('resistance-1','Resistance 2',F.ENERGY,v.resistances?.[1]);
 if(n==='Skill Expert')controls+=field('skill','New skill proficiency',F.SKILLS,v.skill)+field('expertise','Expertise skill',[...new Set([...c.profSkills||[],v.skill].filter(Boolean))].sort(),v.expertise);
 if(n==='Keen Mind')controls+=field('skill','Arcana / History / Investigation / Nature',['Arcana','History','Investigation','Nature'],v.skill);
 if(n==='Observant')controls+=field('skill','Insight or Perception',['Insight','Perception'],v.skill);
 if(n==='Boon of Skill')controls+=field('expertise','Expertise in one skill',F.SKILLS,v.expertise);
 if(n==='Weapon Master')controls+=field('weapon','Weapon with a Mastery property',[...new Set((root.FolioWeaponCatalog?.weapons||[]).map(x=>x.name))].sort(),v.weapon);
 if(!controls)return '';
 return `<div class="feat-config" data-feat-config="${e(n)}"><p class="micro-note">Choices are saved per character and carried through level progression. Ability-score increases are chosen separately under Build & Level.</p><div class="feat-config-grid">${controls}</div><button class="btn primary" data-action="feat-save" data-feat="${e(n)}">Save choices</button></div>`;
}
const ACTIONS={
 'Charger':[['charger','Record charge','Once per turn; after a qualifying straight-line movement and hit, choose extra damage or a shove.']],
 'Crusher':[['crusher','Record bludgeoning push','Once per turn after bludgeoning damage; DM confirms position.']],
 'Defensive Duelist':[['defensive-duelist','Parry melee hit','Reaction with a Finesse weapon: +PB AC against melee attacks.']],
 'Dual Wielder':[['dual-wielder','Record off-hand attack','Bonus Action after Light-weapon attack; record actual attack in Weapons.']],
 'Durable':[['durable','Spend Hit Die · heal self','Bonus Action, expend one Hit Die and roll to recover HP.']],
 'Grappler':[['grappler','Record grapple attack','Once per turn: confirm grapple or advantage conditions with DM.']],
 'Chef':[['chef-prepare','Prepare PB treats','Requires ingredients, Cook’s Utensils and one hour or a Long Rest.'],['chef-eat','Consume one treat','Bonus Action; grants PB temporary HP.']],
 'Inspiring Leader':[['inspiring-leader','Grant temporary HP','Confirm completed rest and eligible allies. Only self HP applies automatically.']],
 'Mage Slayer':[['mage-slayer-guard','Guarded Mind · succeed save','After a confirmed failed INT, WIS or CHA save; once per rest.']],
 'Piercer':[['piercer','Mark damage reroll','Once per turn, reroll a piercing damage die and use new result.']],
 'Poisoner':[['poisoner','Record poison crafting','Track 50 GP materials, one hour of work and PB poison doses in Inventory.']],
 'Polearm Master':[['polearm','Record polearm attack','Bonus Action butt-end attack or triggered opportunity attack.']],
 'Sentinel':[['sentinel','Record Sentinel reaction','DM confirms Opportunity Attack and any speed reduction.']],
 'Shield Master':[['shield-bash','Shield bash · STR save','After a qualifying melee weapon hit; once per turn.']],
 'Slasher':[['slasher','Record speed reduction','Once per turn after slashing damage; DM confirms effect.']],
 'Telekinetic':[['telekinetic-shove','Telekinetic shove','Bonus Action; target makes STR save against feat DC.']],
 'Fighting Style: Interception':[['interception','Interception Reaction','Reduce an adjacent ally’s damage by a die plus proficiency bonus.']],
 'Fighting Style: Protection':[['protection','Protection Reaction','Shield-equipped Reaction against an eligible visible attacker.']],
 'Boon of Combat Prowess':[['combat-prowess','Turn miss into hit','Once before start of your next turn; DM confirms missed attack.']],
 'Boon of Dimensional Travel':[['boon-dimensional','Blink step · teleport','Teleport up to 30 feet immediately after Attack or Magic action.']],
 'Boon of Energy Resistance':[['boon-energy','Redirect energy · Reaction','After taking a selected resisted damage type, target DEX save; no enemy HP is changed automatically.']],
 'Boon of Fate':[['fate','Improve Fate · roll 2d4','Apply as bonus or penalty to an eligible d20 test; refresh on Initiative or Short/Long Rest.']],
 'Boon of Fortitude':[['fortitude-heal','Additional healing','After recovering HP, add CON modifier once until the start of your next turn.']],
 'Boon of Recovery':[['recovery-dice','Expend recovery dice · heal','Bonus Action: choose up to 10 available d10 healing dice.']],
 'Boon of Speed':[['boon-speed-disengage','Bonus Action Disengage','Also ends Grappled on you.']],
 'Boon of the Night Spirit':[['boon-night','Set shadow condition','Only if DM confirms Dim Light/Darkness; does not invent current lighting.']]
};
function actionControls(c,feat,s){const buttons=ACTIONS[feat.name]||[],r=s.resources||{},v=F.configured(c,feat.name);if(!buttons.length)return '';
 const power=buttons.map(([k,label,hint])=>{const cap=F.specs(c).find(x=>x.key===k),left=cap?F.remaining(c,r,k):null;
 return `<div class="feat-action"><p class="micro-note">${e(hint)}</p><button class="btn secondary" data-action="feat-use" data-kind="${e(k)}" data-feat="${e(feat.name)}" ${left===0?'disabled':''}>${e(label)}${left!=null?' ('+left+'/'+cap.max+')':''}</button></div>`;
 }).join('');
 const showTarget=buttons.some(x=>['inspiring-leader','chef-eat','telekinetic-shove','boon-energy'].includes(x[0]));
 const selfBox=buttons.some(x=>['inspiring-leader','chef-eat'].includes(x[0]));
 const dice=feat.name==='Boon of Recovery'?`<label class="feat-input">Recovery dice (d10)<input data-feat-field="diceCount" type="number" min="1" max="10" value="1"></label>`:'';
 const type=feat.name==='Boon of Energy Resistance'?field('damageType','Damage type triggering Reaction',v.resistances||[],v.resistances?.[0]):'';
 const mode=feat.name==='Boon of the Night Spirit'?field('mode','Lighting state',['on','off'],s.resources?.featState?.nightSpiritActive?'on':'off','Choose lighting'):'';
 return `<div class="feat-action-controls">${showTarget?`<label class="feat-input">Target (if applicable)<input data-feat-field="target" maxlength="70" placeholder="DM-confirmed target"></label>`:''}${selfBox?'<label class="feat-check"><input data-feat-field="self" type="checkbox"> Apply benefit to myself</label>':''}${dice}${type}${mode}<div class="feat-action-grid">${power}</div><label class="feat-check"><input type="checkbox" data-feat-confirm> I confirm the trigger, timing and any DM-controlled conditions.</label></div>`;
}
function view(state){const c=state?.character;if(!F?.supported(c))return '';
 const granted=F.granted(c),categories=['General','Fighting Style','Epic Boon'],missing=granted.filter(x=>x.abilityChoices?.length&&!F.abilityFor(c,x.name));
 if(!granted.length)return `<section class="feat-section"><header class="feat-header"><div><span class="eyebrow">PHB 24 · FEATS</span><h3>General Feats, Fighting Styles & Epic Boons</h3><p>Earn a feat through Build & Level to see its choices and actions here.</p></div></header></section>`;
 const groups=categories.map(category=>{const list=granted.filter(x=>x.category===category);if(!list.length)return '';
  return `<div class="feat-group"><h4>${e(category)}${category==='Epic Boon'?'s':''} <small>${list.length}</small></h4><div class="feat-card-grid">${list.map(feat=>{
   const ab=F.abilityFor(c,feat.name),label=feat.category==='Fighting Style'?feat.name.replace('Fighting Style: ',''):feat.name;
   return `<details class="feat-card"><summary><span><strong>${e(label)}</strong><small>${e(feat.category)}${ab?' · '+ab.toUpperCase()+' +1':''}</small></span><span class="feat-chevron" aria-hidden="true">⌄</span></summary><div class="feat-card-body"><p>${e(feat.details)}</p>${feat.abilityChoices?.length&&!ab?'<p class="feat-warning">Ability-score choice pending in Build & Level; no stat bonus is assumed.</p>':''}${config(c,feat)}${actionControls(c,feat,state)}${SPELLCHOICES.includes(feat.name)?'<p class="micro-note">Selected spells appear in Spellbook, including free uses where granted.</p>':''}</div></details>`;
  }).join('')}</div></div>`;}).join('');
 return `<section class="feat-section" aria-label="2024 General feats Fighting Style feats and Epic Boons"><header class="feat-header"><div><span class="eyebrow">PHB 24 · COMPLETE FEAT SYSTEM</span><h3>Your General Feats & Epic Boons</h3><p>Passive abilities appear on the sheet; expand a feat to configure choices or record a confirmed action. Origin feats remain in the Background section above.</p></div><span class="feat-total">${granted.length} earned</span></header>${missing.length?`<p class="feat-warning">${missing.length} feat ability increase${missing.length!==1?'s':''} need a choice in Build & Level: ${e(missing.map(x=>x.name).join(', '))}.</p>`:''}${groups}${state.resources?.featState?.last?`<p class="feat-last" role="status">${e(state.resources.featState.last)}</p>`:''}</section>`;
}
root.FolioFeatUI={view};if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioFeatUI;
})(typeof window!=='undefined'?window:globalThis);
