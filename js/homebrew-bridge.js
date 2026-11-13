(function(root){'use strict';
// Milestone 9 personal-library records can be copied into a character without changing the library.
// The library form has deliberately limited mechanics. Imports are editable snapshots, not official rules.
const inv=()=>root.PipInventory;
function record(list,id,kind){const option=(list||[]).find(x=>x.id===id&&x.kind===kind);if(!option)throw Error('Homebrew '+kind+' entry not found.');return option;}
function addSpell(book,option,newId){
 if(!option||option.kind!=='spell')throw Error('Choose a saved homebrew spell.');
 if((book.custom||[]).some(x=>x.sourceHomebrewId===option.id))throw Error('This homebrew spell is already on the character.');
 if(!newId||typeof newId!=='string')throw Error('A new spell ID is required.');
 const level=Number(option.level);
 if(!Number.isInteger(level)||level<0||level>9)throw Error('The homebrew spell level must be 0–9.');
 const name=String(option.name||'').trim();if(!name)throw Error('The homebrew spell needs a name.');
 const description=String(option.description||'').trim()||'Custom effect; confirm details with the DM.';
 const sp={id:newId,sourceHomebrewId:option.id,name,level,source:'Custom · Homebrew library',school:'Custom',time:'Action',range:'Self',duration:'Instantaneous',components:'—',short:description.slice(0,550),detail:description,concentration:false,ritual:false,alwaysPrepared:true,tags:['Utility'],resolution:'Custom'};
 return {...book,custom:[...(book.custom||[]),sp]};
}
function addEquipment(inventory,option,newId){
 if(!option||!['weapon','item'].includes(option.kind))throw Error('Choose a saved homebrew weapon or item.');
 if(!newId||typeof newId!=='string')throw Error('A new item ID is required.');
 const I=inv();const name=String(option.name||'').trim();if(!name)throw Error('The homebrew item needs a name.');
 let entry=I.gear(newId,name,option.kind==='weapon'?'weapon':'gear',1,String(option.description||''));
 if(option.kind==='weapon'){
   const damage=String(option.damage||'1d6').trim();if(!/^\d{1,2}d(?:4|6|8|10|12|20)(?:\s*[+-]\s*\d{1,2})?$/i.test(damage))throw Error('Use valid damage dice, such as 1d8.');
   const mastery=['Cleave','Graze','Nick','Push','Sap','Slow','Topple','Vex'].includes(option.mastery)?option.mastery:'—';
   entry.weapon=I.weapon(damage,'Slashing','5 ft',mastery,{kind:'Melee',category:'Martial',grip:1,ability:'auto',properties:'',propertyList:[],mastered:false});
 }
 if(!I.validateItem(entry))throw Error('Homebrew equipment is invalid.');
 return I.add(inventory,entry);
}
function modal(list,kind){const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const options=(list||[]).filter(o=>kind==='spell'?o.kind==='spell':['weapon','item'].includes(o.kind));
 const title=kind==='spell'?'Add from Homebrew Library':'Add homebrew equipment';
 return `<div class="modal-scrim" data-action="close-modal"><section class="dialog form-dialog" role="dialog" aria-modal="true" aria-labelledby="homebrew-import-title"><button class="close-modal" data-action="close-modal" aria-label="Close homebrew chooser">×</button><span class="eyebrow">MY SAVED HOMEBREW</span><h2 id="homebrew-import-title">${title}</h2><p>Copies a saved option into this character. You can edit the copy without changing your library.</p><div class="homebrew-import-list">${options.map(o=>`<div class="ledger-item"><div><strong>${esc(o.name)}</strong><p class="muted-on-paper">${o.kind==='spell'?'Level '+Number(o.level||0):o.kind==='weapon'?(esc(o.damage||'1d6')+' · '+esc(o.mastery||'No mastery')):'Equipment'} · ${esc(o.description||'').slice(0,250)}</p></div><button class="btn secondary" data-action="${kind==='spell'?'homebrew-import-spell':'homebrew-import-equipment'}" data-id="${esc(o.id)}">Add to character</button></div>`).join('')||'<p>No matching homebrew entries yet. Create one under Library → Homebrew.</p>'}</div><p class="muted-on-paper">Imported spells default to Action, Self, no concentration and always prepared. Imported weapons default to melee, Slashing, one hand, and no mastered property. Review and edit the details before play.</p><div class="dialog-footer"><button class="btn secondary" data-action="close-modal">Close</button></div></section></div>`;
}
root.FolioHomebrewBridge={record,addSpell,addEquipment,modal};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioHomebrewBridge;
})(typeof window!=='undefined'?window:globalThis);
