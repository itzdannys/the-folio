(function(){'use strict';
const C=window.PipCore,D=window.PipData,S=window.PipStorage,U=window.PipUI,P=window.PipSpells,I=window.PipInventory,IV=window.PipInventoryUI,H=window.PipCharacter,HV=window.PipCharacterUI,J=window.PipJournal;
const B=window.FolioBuilder,BU=window.FolioBuilderUI,FR=window.FolioSpellRules,WR=window.FolioWeaponRules,DICE=window.FolioDice;
const app=document.getElementById('app'),L=window.FolioLibrary,LU=window.FolioLibraryUI;
let saveSequence=0,library=null,activeId=null,screen='library',stack={present:D.newState(),past:[]},libraryUI={filterId:'all',query:'',libraryModal:'',libraryEditId:'',notice:'',saveStatus:'',storageMode:'Offline'};
let ui={tab:'sheet',modalType:'',modalId:'',draftNote:null,editScore:'',inventoryFilter:'all',spellFilter:{view:'all',query:'',purpose:'',economy:'',concentration:'all',level:''},prepareQuery:'',prepareLevel:'',preparePurpose:'',prepareEconomy:'',prepareFocus:'all',prepMode:false,swapOut:'',swapIn:'',journalFilter:{query:'',type:'All',status:'All',tag:''},journalPreset:null,journalReturnId:'',catalogSearch:'',catalogLevel:'',catalogSchool:'',catalogConcentration:'',catalogRitual:'',catalogDraft:null,weaponCatalogSearch:'',weaponCatalogFilter:'all',quickRoll:{open:false,minimized:false,count:1,modifier:0,mode:'normal',rolling:false,rollingDie:20,result:null,history:[]},notice:window.PipStorageError?'Could not read the previous save. Starting with Pip’s default sheet.':'',roll:''};
const A=window.FolioAppearance,AV=window.FolioAppearanceUI;
const clone=S.clone;
let focusReturn=null;
function appearanceDraft(){return A.normalize(ui.appearanceDraft||stack.present.appearance,stack.present.character.templateKind);}
function appearanceForm(){return document.getElementById('appearance-form');}
function previewAppearance(){AV.updatePreview(appearanceForm(),appearanceDraft(),stack.present.character.templateKind,stack.present.character.name);}
function savedAppearance(){return A.fromForm(appearanceForm(),appearanceDraft(),stack.present.character.templateKind);}
function setAppearanceDraft(next){ui.appearanceDraft=A.normalize(next,stack.present.character.templateKind);render();}
function render(preserve=true){
 document.body.classList.toggle('show-library',screen==='library');document.body.classList.toggle('starter-theme',screen!=='library'&&stack.present.character.templateKind==='starter');A.apply(document.body,stack.present.appearance,stack.present.character.templateKind,screen==='library');window.FolioActiveAppearance=stack.present.appearance;
 if(screen==='library'){app.innerHTML=library?LU.render(library,libraryUI):'<div class="library-loading">Opening your private character library…</div>';if(!preserve)window.scrollTo(0,0);if(libraryUI.libraryModal==='new-character')BU.preview(document.getElementById('library-character-create'),library);return;}
 const y=window.scrollY,hadDialog=!!app.querySelector('.modal-scrim');
 if(!hadDialog && ui.modalType){const trigger=document.activeElement?.closest?.('[data-action]');focusReturn=trigger?{action:trigger.getAttribute('data-action'),id:trigger.getAttribute('data-id'),tab:trigger.getAttribute('data-tab')}:null;}
 window.FolioActiveLibrary=library;app.innerHTML=U.render(stack.present,ui,stack.past.length);
 const dialog=app.querySelector('.modal-scrim .dialog');
 const canvas=document.getElementById('quick-roll-tray');if(canvas){const q=ui.quickRoll;const visual=q.rolling?q.pending:q.result;window.FolioDice3D?.mount(canvas,{sides:visual?.sides||20,values:visual?.rolls||[1],seed:q.visualSeed||1731,rolling:q.rolling,palette:A.dicePalette(stack.present.appearance)});}

 for(const selector of ['.topbar','.content-wrap','.mobile-bottom-nav','.floating-die','.quick-roll-window']){const element=app.querySelector(selector);if(element)element.inert=!!dialog;}
 updateCastCostPreview();updateEditorPreview();const buildEdit=document.getElementById('character-build-edit');if(buildEdit)BU.preview(buildEdit,library,stack.present);previewAppearance();
 if(dialog && (!hadDialog||document.activeElement===document.body)){
   const initial=dialog.querySelector('#note-name,.close-modal,input:not([type=hidden]),button');initial?.focus({preventScroll:true});
 }else if(!dialog && hadDialog){
   let target=null;if(focusReturn){target=[...app.querySelectorAll('[data-action]')].find(el=>el.getAttribute('data-action')===focusReturn.action&&(!focusReturn.id||el.getAttribute('data-id')===focusReturn.id)&&(!focusReturn.tab||el.getAttribute('data-tab')===focusReturn.tab));}
   (target||document.querySelector('#main'))?.focus({preventScroll:true});focusReturn=null;
 }
 if(preserve)window.scrollTo(0,y);
}
function updateCastCostPreview(){const selector=document.getElementById('cast-cost'),target=document.getElementById('cast-cost-preview');if(!selector||!target)return;const cost=selector.value,r=stack.present.resources;if(!cost){target.textContent='No casting option available';return;}if(cost.startsWith('slot')){const lvl=Number(cost.slice(4));const current=r.spellSlots?.[lvl-1]??stack.present.character.build?.slotMax?.[lvl-1]??0;target.textContent=`Level ${lvl} slots: ${current} → ${Math.max(0,current-1)} remaining.`;}else if(cost.startsWith('arcanum')){const lvl=Number(cost.slice(7));const current=r.mysticArcanum?.[lvl]||0;target.textContent=`Level ${lvl} Mystic Arcanum: ${current} → ${Math.max(0,current-1)} remaining.`;}else if(cost==='slots1')target.textContent=`Level 1 slots: ${r.slots1} → ${r.slots1-1} remaining · Level 2 slots: ${r.slots2}`;else if(cost==='slots2')target.textContent=`Level 2 slots: ${r.slots2} → ${r.slots2-1} remaining · Level 1 slots: ${r.slots1}`;else if(cost.startsWith('free'))target.textContent=`Free use: ${r[cost]} → ${r[cost]-1} remaining. Spell slots unchanged.`;else target.textContent='No spell slot or free use spent.';
}
function updateEditorPreview(){const form=document.getElementById('character-full-editor'),target=document.getElementById('character-preview'),mobile=document.getElementById('character-preview-mobile');if(!form||!target)return;const markup=HV.previewHtml(form,stack.present);target.innerHTML=markup;if(mobile)mobile.innerHTML=markup;}
function announce(txt){ui.notice=txt;render();}
function transact(fn,msg){
 const before=clone(stack.present),after=fn(clone(stack.present));
 if(!after||JSON.stringify(before)===JSON.stringify(after))return;
 stack={present:after,past:[...stack.past.slice(-49),before]};
 library=L.replaceStack(library,activeId,stack);ui.notice=msg||'Saving locally';saveLibrary();render();
}
function undo(){if(!stack.past.length)return;const past=stack.past.slice();const candidate={present:past.pop(),past};stack=candidate;library=L.replaceStack(library,activeId,stack);ui.notice='Undo applied';saveLibrary();render();}

function saveLibrary(){
 const seq=++saveSequence;libraryUI.saveStatus='Saving…';const badge=document.getElementById('save-indicator');if(badge)badge.textContent='Saving…';
 return L.save(library).then(()=>{if(seq!==saveSequence)return true;libraryUI.saveStatus='Saved on this device';const b=document.getElementById('save-indicator');if(b)b.textContent=libraryUI.saveStatus;return true;}).catch(error=>{if(seq!==saveSequence)return false;libraryUI.saveStatus='SAVE FAILED — EXPORT BACKUP';libraryUI.notice='Could not save: '+error.message;ui.notice='Saving failed. Export a JSON backup before closing this tab.';const b=document.getElementById('save-indicator');if(b)b.textContent=libraryUI.saveStatus;const toast=document.createElement('div');toast.className='toast';toast.setAttribute('role','alert');toast.textContent=ui.notice;app.appendChild(toast);return false;});
}
function downloadJSON(object,filename){const json=JSON.stringify(object,null,2),url=URL.createObjectURL(new Blob([json],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
function libraryGo(){screen='library';ui.modalType='';ui.prepMode=false;libraryUI.libraryModal='';libraryUI.notice='';render(false);}
function libraryOpen(cid){const c=library?.characters.find(x=>x.id===cid);if(!c){libraryUI.notice='Character not found';render();return;}activeId=cid;library=L.openCharacter(library,cid);stack=clone(c.stack);screen='sheet';ui.tab='sheet';ui.modalType='';ui.prepMode=false;ui.notice='';ui.appearanceDraft=null;ui.editScore='';ui.quickRoll.open=false;ui.quickRoll.rolling=false;ui.quickRoll.rollId=(ui.quickRoll.rollId||0)+1;ui.catalogDraft=null;ui.catalogSearch='';saveLibrary();render(false);}
function libraryChange(data,message='Library updated'){library=data;libraryUI.notice=message;saveLibrary();render();}
function libraryHandle(name,el){const id=getParam(el,'id');try{switch(name){
 case 'go-library':libraryGo();return true;
 case 'library-open':libraryOpen(id);return true;
 case 'library-homebrew':libraryUI.libraryModal='homebrew-library';libraryUI.libraryEditId='';render();return true;
 case 'library-hb-home':libraryUI.libraryModal='homebrew-library';libraryUI.libraryEditId='';render();return true;
 case 'library-hb-new':libraryUI.libraryModal='homebrew-form';libraryUI.libraryEditId='';render();return true;
 case 'library-hb-edit':libraryUI.libraryModal='homebrew-form';libraryUI.libraryEditId=id;render();return true;
 case 'library-hb-delete':if(!confirm('Remove this homebrew option from the library? Existing characters retain their applied snapshots.'))return true;libraryChange({...library,homebrew:B.homebrewRemove(library.homebrew||[],id)},'Homebrew removed. Existing character builds are unchanged.');return true;
 case 'library-new-character':libraryUI.libraryModal='new-character';libraryUI.libraryEditId='';render();return true;
 case 'library-new-campaign':libraryUI.libraryModal='new-campaign';libraryUI.libraryEditId='';render();return true;
 case 'library-edit':libraryUI.libraryModal='edit-character';libraryUI.libraryEditId=id;render();return true;
 case 'library-edit-campaign':libraryUI.libraryModal='edit-campaign';libraryUI.libraryEditId=id;render();return true;
 case 'library-modal-close':libraryUI.libraryModal='';libraryUI.libraryEditId='';render();return true;
 case 'library-filter':libraryUI.filterId=id||'all';libraryUI.notice='';render(false);return true;
 case 'library-clear-search':libraryUI.query='';render();return true;
 case 'library-dismiss':libraryUI.notice='';render();return true;
 case 'library-duplicate':{const next=L.duplicateCharacter(library,id);libraryUI.libraryModal='';libraryChange(next.data,'Character duplicated. Its original remains untouched.');return true;}
 case 'library-delete-character':{const c=library.characters.find(x=>x.id===id);if(!c)return true;if(!confirm('Permanently delete '+c.name+' from this browser? This cannot be undone. Export a backup first if you want to keep it.'))return true;libraryUI.libraryModal='';libraryChange(L.removeCharacter(library,id),c.name+' deleted');if(activeId===id)activeId=null;return true;}
 case 'library-delete-campaign':{const c=library.campaigns.find(x=>x.id===id);if(!c)return true;if(!confirm('Delete the '+c.name+' folder? Its characters will remain safely in Unassigned.'))return true;libraryUI.libraryModal='';if(libraryUI.filterId===id)libraryUI.filterId='unassigned';libraryChange(L.deleteCampaign(library,id),'Campaign removed. Character sheets were kept.');return true;}
 case 'library-export-character':{const c=library.characters.find(x=>x.id===id);if(!c)return true;downloadJSON(S.bundle(c.stack),'folio-'+c.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+new Date().toISOString().slice(0,10)+'.json');libraryUI.notice='Character backup exported';render();return true;}
 case 'library-export-all':downloadJSON(L.exportAll(library),'the-folio-library-'+new Date().toISOString().slice(0,10)+'.json');libraryUI.notice='Library backup exported';render();return true;
 default:return false;
 }}catch(error){libraryUI.notice=error.message;render();return true;}}
async function boot(){render(false);try{const data=await L.load();library=data.data;libraryUI.storageMode=data.mode==='indexeddb'?'IndexedDB (on this device)':'Local browser storage';libraryUI.notice=window.PipStorageError?'Previous Pip save could not be read: '+window.PipStorageError:'';libraryUI.saveStatus=data.warning?'Browser storage fallback · Export backups':'Saved on this device';const last=library.characters.find(c=>c.id===library.lastOpenedId)||library.characters[0];activeId=last?.id||null;if(last)stack=clone(last.stack);render(false);}catch(error){app.innerHTML='<div class="library-error"><h2>Could not open your saved characters</h2><p>'+U.escapeHtml(error.message)+'</p><p>Your existing data has not been overwritten. Try another browser, or recover from an exported backup.</p></div>';}}

function closeModal(){if(ui.modalType==='reference'&&ui.journalReturnId){ui.modalType='journal-detail';ui.modalId=ui.journalReturnId;ui.journalReturnId='';render();return;}ui.modalType='';ui.modalId='';ui.draftNote=null;ui.journalPreset=null;ui.journalReturnId='';render();}
function openModal(type,id='',draft=null){ui.modalType=type;ui.modalId=id;ui.draftNote=draft;render();setTimeout(()=>{const focused=type==='note'?'#note-name':'.dialog .close-modal';document.querySelector(focused)?.focus();},0);}
function d20(){return DICE.rollDie(20);}
function getAmount(){const amount=Number(document.getElementById('hp-amount')?.value);return Number.isFinite(amount)&&Number.isInteger(amount)&&amount>0?amount:null;}
function getParam(el,key){return el.getAttribute('data-'+key)||'';}
function saveNote(form){const fd=new FormData(form);const title=String(fd.get('title')||'').trim(),text=String(fd.get('text')||'').trim();if(!title||!text){announce('A play needs a title and at least one line.');return;}
 const note={id:form.getAttribute('data-id')||C.makeId(),title,text,links:fd.getAll('links').map(String),pinned:fd.has('pinned')};
 transact(state=>({...state,notes:state.notes.some(x=>x.id===note.id)?state.notes.map(n=>n.id===note.id?note:n):[...state.notes,note]}),'Play saved');closeModal();}
function saveCharacter(form){const fd=new FormData(form);const scores={};for(const key of ['str','dex','con','int','wis','cha']){const val=Number(fd.get(key));if(!Number.isInteger(val)||val<1||val>30){announce('Ability scores must be between 1 and 30.');return;}scores[key]=val;}
 const level=Number(fd.get('level')),maxHp=Number(fd.get('maxHp')),speed=Number(fd.get('speed'));
 if(![level,maxHp,speed].every(Number.isInteger)||level<1||level>20||maxHp<1||speed<0){announce('Please check level, HP and speed.');return;}
 transact(state=>({...state,character:{...state.character,level,speed,scores,maxHp},resources:{...state.resources,maxHp,hp:Math.min(state.resources.hp,maxHp)}}),'Basic character values updated');closeModal();}
function act(name,el,event){if(libraryHandle(name,el))return;const id=getParam(el,'id');switch(name){
 case 'nav':ui.appearanceDraft=null;ui.journalReturnId='';ui.prepMode=false;ui.tab=getParam(el,'tab');ui.roll='';ui.notice='';ui.modalType='';window.scrollTo(0,0);render(false);return;
 case 'dismiss-toast':ui.notice='';render();return;
 case 'open-appearance':ui.appearanceDraft=A.normalize(stack.present.appearance,stack.present.character.templateKind);ui.tab='appearance';ui.modalType='';window.scrollTo(0,0);render(false);return;
 case 'appearance-cancel':ui.appearanceDraft=null;ui.tab='sheet';window.scrollTo(0,0);render(false);return;
 case 'appearance-remove-image':ui.appearanceDraft={...appearanceDraft(),backgroundImage:''};{const status=document.getElementById('appearance-image-status');if(status)status.textContent='Background removed in preview (Apply to save)';}previewAppearance();return;
 case 'appearance-reset':{const current=appearanceForm(),p=current?.querySelector('[name=preset]:checked')?.value||'classic';const restored={...A.defaults(stack.present.character.templateKind),preset:p,backgroundImage:appearanceDraft().backgroundImage};setAppearanceDraft(restored);return;}
 case 'appearance-use-theme':{const theme=library.themes?.find(x=>x.id===document.getElementById('appearance-saved-theme')?.value);if(!theme){announce('Choose a saved theme first.');return;}setAppearanceDraft(theme.appearance);return;}
 case 'appearance-delete-theme':{const selected=document.getElementById('appearance-saved-theme')?.value;if(!selected){announce('Choose a saved theme first.');return;}if(!confirm('Delete this reusable theme? Existing character appearances will remain unchanged.'))return;libraryChange({...library,themes:(library.themes||[]).filter(x=>x.id!==selected)},'Reusable theme deleted');return;}
 case 'appearance-save-theme':{try{const name=document.getElementById('appearance-theme-name')?.value||'';const proposed=A.savedTheme(name,savedAppearance());if((library.themes||[]).length>=40)throw Error('The reusable theme limit is 40');ui.appearanceDraft=proposed.appearance;libraryChange({...library,themes:[...(library.themes||[]),proposed]},'Reusable theme saved. Use Apply appearance to update this character.');}catch(error){announce(error.message);}return;}
 case 'undo':undo();return;
 case 'damage':{const amount=getAmount();if(amount===null){announce('Enter a positive whole-number damage amount.');return;}
 transact(state=>({...state,resources:C.applyDamage(state.resources,amount)}),`Recorded ${amount} damage`);return;}
 case 'heal':{const amount=getAmount();if(amount===null){announce('Enter a positive whole-number healing amount.');return;}
 transact(state=>({...state,resources:C.applyHealing(state.resources,amount)}),`Recorded ${amount} healing`);return;}
 case 'inspiration-toggle':transact(state=>({...state,resources:{...state.resources,heroicInspiration:!state.resources.heroicInspiration}}),'Heroic Inspiration updated');return;
 case 'death-check':{const key=getParam(el,'key');if(!['deathSuccess','deathFailure'].includes(key))return;transact(state=>({...state,resources:C.changeResource(state.resources,key,Number(getParam(el,'delta')),3)}),'Death save updated');return;}
 case 'death-reset':transact(state=>({...state,resources:{...state.resources,deathSuccess:0,deathFailure:0}}),'Death saving throws reset');return;
 case 'temp-hp':{const prev=stack.present.resources.tempHp;const raw=prompt('Set temporary HP (nonnegative whole number):',String(prev));if(raw===null)return;const val=Number(raw);if(!Number.isInteger(val)||val<0){announce('Enter a nonnegative whole number.');return;}transact(state=>({...state,resources:{...state.resources,tempHp:val}}),'Temporary HP updated');return;}
 case 'generic-slot':{const index=Number(getParam(el,'index')),delta=Number(getParam(el,'delta')),cap=stack.present.character.build?.slotMax?.[index]||0;if(!Number.isInteger(index)||index<0||index>8||!Number.isInteger(delta)||!cap)return;transact(state=>{const values=[...(state.resources.spellSlots||Array(9).fill(0))];values[index]=Math.max(0,Math.min(cap,(values[index]||0)+delta));return {...state,resources:{...state.resources,spellSlots:values}};},'Spell slot updated · Undo available');return;}
 case 'generic-arcanum':{const level=Number(getParam(el,'level')),delta=Number(getParam(el,'delta')),max=FR.mysticArcanumMax(stack.present.character)[level]||0;if(!max||![-1,1].includes(delta))return;transact(state=>({...state,resources:{...state.resources,mysticArcanum:{...(state.resources.mysticArcanum||{}),[level]:Math.max(0,Math.min(max,(state.resources.mysticArcanum?.[level]||0)+delta))}}}),`Level ${level} Mystic Arcanum updated`);return;}
 case 'resource':{const key=getParam(el,'key'),max=Number(getParam(el,'max')),delta=Number(getParam(el,'delta'));
 transact(state=>({...state,resources:C.changeResource(state.resources,key,delta,max)}),'Resource updated');return;}
 case 'short-rest':transact(state=>({...state,resources:state.character.templateKind==='starter'?FR.shortRestResources(state.character,state.resources):C.shortRest(state.resources,state.character.level),customResources:H.restResources(state.customResources,'short')}),'Short Rest recorded. Spend Hit Dice manually.');return;
 case 'long-rest':{const isStarter=stack.present.character.templateKind==='starter',book=stack.present.spellbook,queued=isStarter?!!(book.catalogPending||book.catalogQueued?.length):book.queued.length>0;if(!confirm('Finish a Long Rest? Restores HP and daily resources, clears conditions/concentration, and '+(queued?'applies queued spell changes permitted by your class.':'makes no spell changes.')+' Spent Hit Dice are restored under 2024 rules.'))return;
 transact(state=>({...state,resources:isStarter?{...state.resources,hp:state.resources.maxHp,tempHp:0,hitDice:state.character.level,spellSlots:[...(state.character.build?.slotMax||Array(9).fill(0))],mysticArcanum:FR.mysticArcanumMax(state.character),concentration:'',conditions:[],deathSuccess:0,deathFailure:0}:C.longRest(state.resources,state.character.level),spellbook:isStarter?FR.applyPreparedChanges(state.spellbook):P.applyOneSwap(state.spellbook),inventory:I.longRest(state.inventory),customResources:H.restResources(state.customResources,'long')}),queued?'Long Rest complete · spell changes applied':'Long Rest resources restored');return;}
 case 'journal-new':ui.journalPreset={type:getParam(el,'kind')||'Note'};openModal('journal-edit');return;
 case 'journal-new-linked':{const link=getParam(el,'link');ui.journalPreset={type:link.startsWith('item:')?'Note':'Ruling',link,title:''};ui.journalReturnId='';ui.tab='journal';openModal('journal-edit');window.scrollTo(0,0);return;}
 case 'journal-edit':ui.journalPreset=null;openModal('journal-edit',id);return;
 case 'journal-view':ui.journalReturnId='';openModal('journal-detail',id);return;
 case 'journal-delete':if(!confirm('Delete this journal entry? You can Undo.'))return;transact(state=>({...state,journal:J.remove(state.journal,id)}),'Journal entry deleted · Undo available');ui.modalType='';ui.modalId='';render();return;
 case 'journal-pin':transact(state=>({...state,journal:J.pin(state.journal,id)}),'Journal pin updated');return;
 case 'journal-cycle-status':{const e=stack.present.journal.find(x=>x.id===id);if(!e||e.type!=='Quest')return;const next=J.STATUSES[(J.STATUSES.indexOf(e.status)+1)%J.STATUSES.length];transact(state=>({...state,journal:J.setStatus(state.journal,id,next)}),'Quest status: '+next);return;}
 case 'journal-filter-type':ui.journalFilter.type=getParam(el,'type')||'All';window.scrollTo(0,0);render(false);return;
 case 'journal-filter-tag':ui.journalFilter.tag=getParam(el,'tag');render();return;
 case 'journal-clear-filters':ui.journalFilter={query:'',type:'All',status:'All',tag:''};render();return;
 case 'journal-open-reference':{const raw=getParam(el,'ref'),sep=raw.indexOf(':'),refId=raw.slice(sep+1);if(!refId)return;ui.journalReturnId=ui.modalType==='journal-detail'?ui.modalId:'';openModal('reference',refId);return;}
 case 'reference':openModal('reference',id);return;
 case 'close-modal':if(el.classList.contains('modal-scrim')&&event.target!==el)return;closeModal();return;
 case 'math':openModal('math',getParam(el,'math'));return;
 case 'open-builder':if(stack.present.character.templateKind!=='starter'){announce('Pip’s specialist rules sheet is protected. Create or duplicate a new universal-build character.');return;}ui.tab='builder';ui.modalType='';window.scrollTo(0,0);render(false);return;
 case 'builder-cancel':ui.tab='sheet';window.scrollTo(0,0);render(false);return;
 case 'edit-character':ui.tab='editor';ui.modalType='';window.scrollTo(0,0);render(false);return;
 case 'open-features':ui.tab='features';ui.modalType='';window.scrollTo(0,0);render(false);return;
 case 'editor-cancel':ui.tab='sheet';window.scrollTo(0,0);render(false);return;
 case 'feature-new':openModal('feature');return;
 case 'feature-edit':openModal('feature',id);return;
 case 'feature-delete':if(!confirm('Remove this custom feature or feat? You can Undo.'))return;try{transact(state=>({...state,character:H.deleteFeature(state.character,id)}),'Feature removed');}catch(e){announce(e.message);}return;
 case 'feature-reset':transact(state=>({...state,character:H.resetFeature(state.character,id)}),'Original feature wording restored');closeModal();return;
 case 'custom-resource-new':openModal('custom-resource');return;
 case 'custom-resource-edit':openModal('custom-resource',id);return;
 case 'custom-resource-delete':if(!confirm('Remove this custom resource? You can Undo.'))return;transact(state=>({...state,customResources:state.customResources.filter(r=>r.id!==id)}),'Custom resource removed');return;
 case 'custom-resource-adjust':transact(state=>({...state,customResources:H.adjustResource(state.customResources,id,Number(getParam(el,'delta')))}),'Resource adjusted');return;
 case 'score-edit':ui.editScore=id;render();document.getElementById('inline-'+id)?.focus();return;
 case 'score-cancel':ui.editScore='';render();return;
 case 'backup':openModal('backup');return;
 case 'export-backup':downloadJSON(S.bundle(stack),'folio-'+stack.present.character.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+new Date().toISOString().slice(0,10)+'.json');ui.notice='Character backup exported';render();return;
 case 'note-new':openModal('note','',{title:'',text:'',links:[],pinned:false});return;
 case 'item-new':openModal('item','');return;
 case 'weapon-catalog-open':ui.weaponCatalogSearch='';ui.weaponCatalogFilter='all';openModal('weapon-catalog');return;
 case 'weapon-catalog-add':{const template=window.FolioWeaponCatalog.weapons.find(w=>w.key===id);if(!template)return;try{const item=WR.catalogItem(template,C.makeId());transact(state=>({...state,inventory:I.add(state.inventory,item)}),template.name+' added to Inventory');}catch(e){announce(e.message);}return;}
 case 'weapon-attack':openModal('weapon-attack',id);return;
 case 'item-edit':openModal('item',id);return;
 case 'item-equip':try{transact(state=>({...state,inventory:I.toggleEquip(state.inventory,id)}),'Equipment updated');}catch(e){announce(e.message);}return;
 case 'item-attune':try{transact(state=>({...state,inventory:I.toggleAttune(state.inventory,id)}),'Attunement updated');}catch(e){announce(e.message);}return;
 case 'item-quantity':{const item=stack.present.inventory.items.find(x=>x.id===id);if(!item)return;const n=item.quantity+Number(getParam(el,'delta'));if(!Number.isInteger(n)||n<0||n>99999){announce('Quantity must be between 0 and 99,999.');return;}try{transact(state=>({...state,inventory:I.update(state.inventory,id,{quantity:n})}),'Quantity updated');}catch(e){announce(e.message);}return;}
 case 'item-charge':try{transact(state=>({...state,inventory:I.changeCharges(state.inventory,id,Number(getParam(el,'delta')))}),'Item charges updated');}catch(e){announce(e.message);}return;
 case 'item-delete':{const item=stack.present.inventory.items.find(x=>x.id===id);if(!item)return;if(!confirm('Remove '+item.name+' from inventory? You can Undo.'))return;transact(state=>({...state,inventory:I.remove(state.inventory,id)}),'Item removed · Undo available');return;}
 case 'open-prep':ui.tab='spellbook';ui.prepMode=true;ui.prepareQuery='';ui.prepareLevel='';ui.preparePurpose='';ui.prepareEconomy='';ui.prepareFocus='all';ui.catalogSearch='';ui.catalogLevel='';ui.catalogSchool='';ui.catalogConcentration='';ui.catalogRitual='';ui.catalogDraft=stack.present.character.templateKind==='starter'?[...(stack.present.spellbook.catalogPending||FR.selectedIds(stack.present.spellbook))]:null;ui.swapOut=stack.present.character.templateKind==='starter'?(stack.present.spellbook.prepared?.[0]||FR.selectedIds(stack.present.spellbook)[0]||''):stack.present.spellbook.prepared[0];ui.swapIn='';ui.modalType='';window.scrollTo(0,0);render(false);return;
 case 'close-prep':ui.prepMode=false;ui.swapIn='';ui.catalogDraft=null;ui.catalogSearch='';ui.prepareQuery='';window.scrollTo(0,0);render(false);return;
 case 'select-out':ui.swapOut=id;render();return;
 case 'select-in':ui.swapIn=id;render();return;
 case 'queue-swap':try{const a=ui.swapOut,b=ui.swapIn;transact(state=>({...state,spellbook:P.queueSwap(state.spellbook,a,b)}),'Spell replacement queued for a Long Rest');ui.swapIn='';ui.prepMode=false;window.scrollTo(0,0);render(false);}catch(e){announce(e.message);}return;
 case 'catalog-draft-toggle':{const current=Array.isArray(ui.catalogDraft)?ui.catalogDraft:[...FR.selectedIds(stack.present.spellbook)],next=current.includes(id)?current.filter(x=>x!==id):[...current,id],err=FR.selectionError(stack.present.character,stack.present.spellbook,next);if(err){announce(err);return;}ui.catalogDraft=next;render();return;}
 case 'catalog-save-list':{const draft=Array.isArray(ui.catalogDraft)?ui.catalogDraft:[];if(!draft.length&&!confirm('Save an empty spell list?'))return;const err=FR.selectionError(stack.present.character,stack.present.spellbook,draft);if(err){announce(err);return;}const initial=FR.selectedIds(stack.present.spellbook).length===0;transact(state=>({...state,spellbook:{...state.spellbook,catalogSelections:initial?[...draft]:[...state.spellbook.catalogSelections],catalogPending:initial?null:[...draft]}}),initial?'Initial spell list saved':'Prepared spell list queued for your next Long Rest');ui.prepMode=false;ui.catalogDraft=null;window.scrollTo(0,0);render(false);return;}
 case 'catalog-queue-swap':{const from=ui.swapOut,to=ui.swapIn;if(!from||!to||from===to){announce('Choose one outgoing and one replacement spell.');return;}if(stack.present.spellbook.catalogQueued?.length){announce('A replacement is already queued for your next Long Rest.');return;}const err=FR.swapError(stack.present.character,stack.present.spellbook,from,to);if(err){announce(err);return;}transact(state=>({...state,spellbook:{...state.spellbook,catalogQueued:[{from,to}]}}),'One spell replacement queued for a Long Rest');ui.prepMode=false;ui.swapIn='';window.scrollTo(0,0);render(false);return;}
 case 'catalog-queue-levelup':{const from=ui.swapOut,to=ui.swapIn;if(!from||!to||from===to){announce('Choose one outgoing and one replacement spell.');return;}if(stack.present.spellbook.catalogLevelUpQueued?.length){announce('A known-spell replacement is already queued for your next level-up.');return;}const err=FR.swapError(stack.present.character,stack.present.spellbook,from,to);if(err){announce(err);return;}transact(state=>({...state,spellbook:{...state.spellbook,catalogLevelUpQueued:[{from,to}]}}),'Known-spell replacement queued for next level-up');ui.prepMode=false;ui.swapIn='';window.scrollTo(0,0);render(false);return;}
 case 'catalog-queue-pip-swap':try{transact(state=>({...state,spellbook:P.queueSwap(state.spellbook,ui.swapOut,ui.swapIn)}),'Spell replacement queued for a Long Rest');ui.prepMode=false;ui.swapIn='';window.scrollTo(0,0);render(false);}catch(e){announce(e.message);}return;
 case 'catalog-cancel-pending':transact(state=>({...state,spellbook:{...state.spellbook,catalogPending:null}}),'Pending prepared list canceled');return;
 case 'catalog-cancel-queued':transact(state=>({...state,spellbook:{...state.spellbook,catalogQueued:[]}}),'Queued replacement canceled');return;
 case 'catalog-cancel-levelup':transact(state=>({...state,spellbook:{...state.spellbook,catalogLevelUpQueued:[]}}),'Queued level-up spell change canceled');return;
 case 'queue-remove':transact(state=>({...state,spellbook:{...state.spellbook,queued:state.spellbook.queued.filter((_,i)=>i!==Number(id))}}),'Queued change canceled');return;
 case 'loadout-save':{const input=prompt('Name this seven-spell loadout:','Boss fight');if(input===null)return;const title=input.trim();if(!title||title.length>60){announce('Choose a name between 1 and 60 characters.');return;}transact(state=>({...state,spellbook:P.saveLoadout(state.spellbook,title,C.makeId())}),'Spell loadout saved');return;}
 case 'loadout-plan':try{const l=stack.present.spellbook.loadouts.find(x=>x.id===id);if(!l)return;if(!confirm('Queue changes toward '+l.name+'? Only one of these swaps will apply per Long Rest.'))return;transact(state=>({...state,spellbook:P.planLoadout(state.spellbook,id)}),'Spell loadout queued across future Long Rests');ui.prepMode=false;render();}catch(e){announce(e.message);}return;
 case 'loadout-delete':if(!confirm('Delete this saved loadout?'))return;transact(state=>({...state,spellbook:{...state.spellbook,loadouts:state.spellbook.loadouts.filter(x=>x.id!==id)}}),'Loadout removed');return;
 case 'spell-view':ui.spellFilter.view=id;render();return;
 case 'spell-fav':transact(state=>{const f=state.spellbook.favorites;return {...state,spellbook:{...state.spellbook,favorites:f.includes(id)?f.filter(x=>x!==id):[...f,id]}}},'Favorites updated');return;
 case 'open-cast':openModal('cast',id);return;
 case 'homebrew-spell-open':openModal('homebrew-spell');return;
 case 'homebrew-equipment-open':openModal('homebrew-equipment');return;
 case 'homebrew-import-spell':try{const option=window.FolioHomebrewBridge.record(library.homebrew,id,'spell');transact(state=>({...state,spellbook:window.FolioHomebrewBridge.addSpell(state.spellbook,option,'custom-'+C.makeId())}),'Saved homebrew spell added');closeModal();}catch(e){announce(e.message);}return;
 case 'homebrew-import-equipment':try{const option=(library.homebrew||[]).find(o=>o.id===id&&['weapon','item'].includes(o.kind));transact(state=>({...state,inventory:window.FolioHomebrewBridge.addEquipment(state.inventory,option,C.makeId())}),'Saved homebrew equipment added');closeModal();}catch(e){announce(e.message);}return;
 case 'open-custom':openModal('custom');return;
 case 'custom-remove':if(!confirm('Remove this custom spell? You can undo afterward.'))return;transact(state=>({...state,spellbook:{...state.spellbook,custom:state.spellbook.custom.filter(x=>x.id!==id),favorites:state.spellbook.favorites.filter(x=>x!==id)}}),'Custom spell removed');return;
 case 'note-edit':openModal('note','',clone(stack.present.notes.find(x=>x.id===id)));return;
 case 'note-pin':transact(state=>({...state,notes:state.notes.map(n=>n.id===id?{...n,pinned:!n.pinned}:n)}),'Play pin changed');return;
 case 'note-delete':transact(state=>({...state,notes:state.notes.filter(n=>n.id!==id)}),'Play deleted · Undo is available');return;
 case 'note-up':case 'note-down':transact(state=>{const sorted=[...state.notes.filter(x=>x.pinned),...state.notes.filter(x=>!x.pinned)];const i=sorted.findIndex(x=>x.id===id),target=i+(name==='note-up'?-1:1);if(target>=0&&target<sorted.length){[sorted[i],sorted[target]]=[sorted[target],sorted[i]];const curr=sorted[i];const other=sorted[target];if(curr.pinned!==other.pinned){curr.pinned=other.pinned;other.pinned=!curr.pinned;}}
 return {...state,notes:sorted};},'Plays reordered');return;
 case 'encounter-start':transact(state=>({...state,encounter:C.beginEncounter(state.encounter,C.derived(state.character,state.inventory).initiative,undefined,state.character.name)}),'Initiative started: add combatants and begin turns');return;
 case 'encounter-end':if(!confirm('End this encounter? Setup notes and resources will remain unchanged.'))return;transact(state=>({...state,encounter:{active:false,round:1,roster:[],currentId:null}}),'Encounter ended · resources and notes preserved');return;
 case 'next-turn':transact(state=>({...state,encounter:C.nextTurn(state.encounter)}),'Initiative advanced');return;
 case 'actor-remove':transact(state=>({...state,encounter:C.removeActor(state.encounter,id)}),'Combatant removed');return;
 case 'tie-up':case 'tie-down':transact(state=>({...state,encounter:C.shiftTie(state.encounter,id,name==='tie-up'?-1:1)}),'Tie order changed');return;
 case 'dice':ui.quickRoll.open=!ui.quickRoll.open;ui.quickRoll.minimized=false;render();return;
 case 'quick-roll-close':ui.quickRoll.rollId=(ui.quickRoll.rollId||0)+1;ui.quickRoll.rolling=false;ui.quickRoll.open=false;ui.quickRoll.minimized=false;render();return;
 case 'quick-roll-minimize':ui.quickRoll.minimized=true;render();return;
 case 'quick-roll-restore':ui.quickRoll.minimized=false;render();return;
 case 'quick-roll-clear':ui.quickRoll.history=[];ui.quickRoll.result=null;render();return;
 case 'quick-roll-die':{const sides=Number(getParam(el,'sides'));if(ui.quickRoll.rolling||!DICE.ALLOWED.includes(sides))return;const q=ui.quickRoll,count=Number(q.count)||1,modifier=Number(q.modifier)||0,mode=q.mode||'normal';try{
 let result;if(sides===20&&count===1&&mode!=='normal'){const r=DICE.rollD20(mode),total=r.chosen+modifier;result={label:`d20 ${mode}`,detail:`${r.rolls.join(' / ')}${modifier?` ${modifier>0?'+':''}${modifier}`:''} = ${total}`,total,rolls:r.rolls,sides};}
 else{const r=DICE.rollExpression({count,sides,modifier});result={label:`${count}d${sides}${modifier?`${modifier>0?'+':''}${modifier}`:''}`,detail:`${r.rolls.join(' + ')}${modifier?` ${modifier>0?'+':''}${modifier}`:''} = ${r.total}`,total:r.total,rolls:r.rolls,sides};}
 q.rolling=true;q.rollingDie=sides;q.pending=result;q.result=null;q.visualSeed=(window.crypto?.getRandomValues?window.crypto.getRandomValues(new Uint32Array(1))[0]:Date.now());q.rollId=(q.rollId||0)+1;const rollId=q.rollId;render();
 const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 window.setTimeout(()=>{if(q.rollId!==rollId)return;q.result=result;q.pending=null;q.history=[{...result,at:Date.now()},...(q.history||[])].slice(0,8);q.rolling=false;if(q.open)render();},reduce?80:1100);
 }catch(e){q.pending=null;q.rolling=false;ui.notice=e.message;render();}return;}
 case 'roll-init':{const modifier=C.derived(stack.present.character,stack.present.inventory).initiative,roll=d20(),total=roll+modifier;transact(state=>({...state,encounter:C.setActorInitiative(state.encounter,'pip',total)}),`Pip rolled ${roll} ${C.signed(modifier)} = ${total} initiative`);ui.roll=`Initiative: d20 ${roll} ${C.signed(modifier)} = ${total}`;render();return;}
 case 'clear-roll':ui.roll='';render();return;
 case 'print':window.print();return;
 default:return;
}}
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(!el||el.disabled)return;if(el.classList.contains('modal-scrim')&&event.target!==el)return;event.preventDefault();act(getParam(el,'action'),el,event);});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&ui.quickRoll.open&&!ui.modalType&&screen!=='library'){ui.quickRoll.rollId=(ui.quickRoll.rollId||0)+1;ui.quickRoll.rolling=false;ui.quickRoll.open=false;render();document.querySelector('.floating-die')?.focus({preventScroll:true});return;}
 if(event.key==='Escape'&&screen==='library'&&libraryUI.libraryModal){libraryUI.libraryModal='';render();return;}
 if(event.key==='Escape'&&ui.modalType){event.preventDefault();closeModal();return;}
 if(event.key==='Tab'&&ui.modalType){
   const dlg=app.querySelector('.modal-scrim .dialog');if(dlg){
     const all=[...dlg.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(el=>!el.disabled&&el.getAttribute('tabindex')!=='-1'&&el.getClientRects().length);
     if(all.length){const first=all[0],last=all.at(-1);if(event.shiftKey&&(document.activeElement===first||!dlg.contains(document.activeElement))){event.preventDefault();last.focus();}else if(!event.shiftKey&&(document.activeElement===last||!dlg.contains(document.activeElement))){event.preventDefault();first.focus();}}
   }
 }
 if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-action="math"][role="button"]')){event.preventDefault();act('math',event.target,event);}
});
document.addEventListener('submit',event=>{const form=event.target;event.preventDefault();if(form.id.startsWith('library-')){const fd=new FormData(form),id=form.getAttribute('data-id');try{if(form.id==='library-character-create'){const build=BU.readBuild(form,library);const fresh=L.startCharacter({name:build.name,className:build.characterClass,species:build.species,background:build.background});fresh.present=B.applyToState(fresh.present,build);const newChar=L.addCharacter(library,fresh,fd.get('campaignId')||null);libraryUI.libraryModal='';libraryChange(newChar.data,'Character created with '+build.characterClass+' progression');return;}if(form.id==='library-homebrew-form'){const raw=Object.fromEntries(fd.entries());const homebrew=id?B.homebrewUpdate(library.homebrew||[],id,raw):B.homebrewAdd(library.homebrew||[],raw);libraryUI.libraryModal='homebrew-library';libraryUI.libraryEditId='';libraryChange({...library,homebrew},'Homebrew option saved for future characters');return;}if(form.id==='library-character-edit'){libraryUI.libraryModal='';libraryChange(L.updateCharacter(library,id,{name:fd.get('name'),campaignId:fd.get('campaignId')}),'Character updated');return;}if(form.id==='library-campaign-create'){const next=L.addCampaign(library,fd.get('name'),fd.get('description'));libraryUI.libraryModal='';libraryUI.filterId=next.id;libraryChange(next.data,'Campaign created');return;}if(form.id==='library-campaign-edit'){libraryUI.libraryModal='';libraryChange(L.editCampaign(library,id,fd.get('name'),fd.get('description')),'Campaign updated');return;}}catch(err){libraryUI.notice=err.message;render();}return;}if(form.id==='appearance-form'){try{const proposed=savedAppearance();ui.appearanceDraft=null;transact(state=>({...state,appearance:proposed}),'Appearance saved · Undo available');ui.tab='sheet';render(false);}catch(error){announce(error.message);}return;}if(form.id==='character-build-edit'){try{const build=BU.readBuild(form,library,stack.present);transact(state=>B.applyToState(state,build),'Build updated · Undo available');ui.tab='sheet';render(false);}catch(error){const panel=document.getElementById('builder-live-preview');if(panel)panel.innerHTML='<p class="preview-warning">'+U.escapeHtml(error.message)+'</p>';}return;}if(form.id==='note-form'){saveNote(form);return;}
 if(form.id==='journal-form'){const fd=new FormData(form),id=form.getAttribute('data-id')||'',newId=id||'j-'+C.makeId();try{const entry={id:newId,type:String(fd.get('type')||'Note'),title:String(fd.get('title')||''),body:String(fd.get('body')||''),date:String(fd.get('date')||''),tags:String(fd.get('tags')||''),links:fd.getAll('links').map(String),pinned:fd.has('pinned'),status:String(fd.get('status')||'Open')};transact(state=>({...state,journal:J.upsert(state.journal,entry,id)}),'Journal entry saved · Undo available');ui.tab='journal';ui.modalType='journal-detail';ui.modalId=newId;ui.journalPreset=null;window.scrollTo(0,0);render(false);}catch(e){const error=form.querySelector('#journal-form-error');if(error)error.textContent=e.message;else announce(e.message);}return;}
 if(form.id==='character-full-editor'){try{const proposed=H.editorData(form,stack.present.character);transact(state=>H.applyCharacterState(state,proposed),'Character changes applied · Undo available');ui.tab='sheet';window.scrollTo(0,0);render(false);}catch(e){const preview=document.getElementById('character-preview');if(preview)preview.innerHTML='<p class="preview-warning">'+U.escapeHtml(e.message)+'</p>';else announce(e.message);}return;}
 if(form.id==='feature-form'){const fd=new FormData(form),id=form.getAttribute('data-id');try{const entry={name:String(fd.get('name')||''),group:String(fd.get('group')||'Custom'),short:String(fd.get('short')||''),detail:String(fd.get('detail')||''),hidden:fd.has('hidden')};transact(state=>({...state,character:H.updateFeature(state.character,id,entry)}),'Feature saved · Undo available');closeModal();}catch(e){announce(e.message);}return;}
 if(form.id==='resource-form'){const fd=new FormData(form),id=form.getAttribute('data-id');try{const raw={name:fd.get('name'),current:Number(fd.get('current')),max:Number(fd.get('max')),reset:fd.get('reset'),note:fd.get('note')};transact(state=>({...state,customResources:H.saveResource(state.customResources,raw,id)}),'Custom resource saved · Undo available');closeModal();}catch(e){announce(e.message);}return;}
if(form.id==='character-form'){saveCharacter(form);return;}if(form.id==='score-form'){const scoreKey=form.getAttribute('data-score'),newScore=Number(new FormData(form).get('score'));
 if(!['str','dex','con','int','wis','cha'].includes(scoreKey)||!Number.isInteger(newScore)||newScore<1||newScore>30){announce('Ability scores must be whole numbers from 1 to 30.');return;}
 ui.editScore='';transact(state=>({...state,character:{...state.character,scores:{...state.character.scores,[scoreKey]:newScore}}}),scoreKey.toUpperCase()+' updated');return;}
 if(form.id==='item-form'){const id=form.getAttribute('data-id'),current=stack.present.inventory.items.find(x=>x.id===id);try{const item=IV.parseItem(form,current,current?.id||C.makeId());const proposed=current?I.update(stack.present.inventory,current.id,item):I.add(stack.present.inventory,item);if(item.category==='weapon'&&item.weapon.mastered&&(!current||!current.weapon?.mastered)){const err=WR.masteryError(stack.present.character,proposed,item.id,true);if(err)throw Error(err);}transact(state=>({...state,inventory:proposed}),'Inventory updated · Undo available');closeModal();}catch(e){announce(e.message);}return;}
 if(form.id==='currency-form'){const fd=new FormData(form);try{const kind=String(fd.get('kind')),coin=String(fd.get('coin')),amount=Number(fd.get('amount')),note=String(fd.get('note')||'');transact(state=>({...state,inventory:I.adjustCurrency(state.inventory,coin,amount,kind,note,C.makeId())}),'Currency recorded · Undo available');}catch(e){announce(e.message);}return;}
 if(form.id==='cast-form'){const id=form.getAttribute('data-id'),cost=String(new FormData(form).get('cost')||'');try{transact(state=>{if(state.character.templateKind==='starter'){const result=FR.cast(state.character,state.spellbook,state.resources,id,cost);return {...state,resources:result.resources,spellbook:result.book};}const result=P.cast(state.spellbook,state.resources,id,cost);return {...state,resources:result.resources,spellbook:result.book}},'Cast recorded · Undo available');closeModal();}catch(e){announce(e.message);}return;}
 if(form.id==='weapon-attack-form'){const fd=new FormData(form),id=form.getAttribute('data-id'),mode=String(fd.get('mode')||'melee'),rollMode=String(fd.get('rollMode')||'normal'),raw=String(fd.get('targetAC')||'').trim(),targetAC=raw?Number(raw):null;if(raw&&(!Number.isInteger(targetAC)||targetAC<1||targetAC>50)){announce('Target AC must be a whole number from 1 to 50, or left blank.');return;}try{const result=WR.attack(stack.present.character,stack.present.inventory,id,mode,rollMode,targetAC);transact(state=>({...state,inventory:result.inventory}),result.result.message+' · Undo available');ui.roll=result.result.message;closeModal();}catch(e){announce(e.message);}return;}
 if(form.id==='custom-form'){const fd=new FormData(form),name=String(fd.get('name')||'').trim(),level=Number(fd.get('level')),short=String(fd.get('short')||'').trim();
 if(!name||!short||!Number.isInteger(level)||level<0||level>(stack.present.character.templateKind==='starter'?9:2)){announce('Enter a name, valid spell level, and summary.');return;}const key='custom-'+C.makeId(),concentration=fd.has('concentration'),duration=String(fd.get('duration')||'Instant');const spell={id:key,name,level,source:'Custom / DM',origin:'custom',school:'Custom',time:String(fd.get('time')||'Action'),range:String(fd.get('range')||'Self'),duration,components:String(fd.get('components')||''),short,detail:String(fd.get('detail')||''),tags:[],resolution:'Table ruling',concentration,ritual:fd.has('ritual'),alwaysPrepared:true};
 transact(state=>({...state,spellbook:{...state.spellbook,custom:[...state.spellbook.custom,spell]}}),'Custom spell added');closeModal();return;}
 if(form.id==='add-actor'){const fd=new FormData(form),name=String(fd.get('name')||'').trim(),score=Number(fd.get('initiative'));if(!name||!Number.isInteger(score)){announce('Enter a combatant name and whole-number initiative total.');return;}
 transact(state=>({...state,encounter:C.addActor(state.encounter,{id:C.makeId(),name,initiative:score,isPip:false})}),`${name} added to initiative`);return;}});
document.addEventListener('change',async event=>{const el=event.target;
if(el.id==='appearance-image'){const file=el.files?.[0];if(!file)return;const status=document.getElementById('appearance-image-status');if(status)status.textContent='Preparing the image locally…';try{const image=await AV.imageFile(file);ui.appearanceDraft={...savedAppearance(),backgroundImage:image};if(status)status.textContent='Image ready in preview. Apply appearance to save.';previewAppearance();}catch(error){if(status)status.textContent=error.message;}return;}
if(el.closest('#appearance-form')){if(el.name==='preset'){const base=A.PRESETS[el.value]||A.PRESETS.classic;for(const k of ['accent','page','header','panel','ink','line']){const input=appearanceForm().elements.namedItem(k);if(input)input.value=base[k];}if(appearanceForm().elements.namedItem('diceStyle').value!=='custom'){const d=A.dicePalette({...appearanceDraft(),preset:el.value,dice:{style:'amethyst'}});for(const [k,v] of [['diceFace',d.face],['diceEdge',d.edge],['diceInk',d.ink]])appearanceForm().elements.namedItem(k).value=v;}}
if(el.name==='diceStyle'){const d=A.dicePalette({...appearanceDraft(),dice:{style:el.value}});for(const [k,v] of [['diceFace',d.face],['diceEdge',d.edge],['diceInk',d.ink]])appearanceForm().elements.namedItem(k).value=v;}
previewAppearance();return;}
if(el.id==='library-import-file'){const file=el.files?.[0];if(!file)return;try{if(file.size>50*1024*1024)throw Error('Backup exceeds 50 MB');const pkg=L.importPackage(await file.text());const description=pkg.kind==='character'?'one character':`${pkg.library.characters.length} characters and ${pkg.library.campaigns.length} campaigns`;if(!confirm('Import '+description+' as new entries? Existing characters and campaigns will not be overwritten.'))return;const merged=L.mergePackage(library,pkg);libraryChange(merged.data,'Imported '+description+'. Existing data preserved.');}catch(err){libraryUI.notice='Import failed: '+err.message;render();}return;}if(el.id==='backup-file'){const file=el.files?.[0];if(!file)return;
 try{
   if(file.size>20*1024*1024)throw Error('Backup file exceeds the 20 MB safety limit');
   const text=await file.text(),candidate=S.importBackup(text),raw=JSON.parse(text);
   const name=candidate.present.character.name||'Pip',level=candidate.present.character.level,stamp=raw.exportedAt?(' (exported '+raw.exportedAt.slice(0,10)+')'):'';
   if(!confirm('Restore '+name+', level '+level+stamp+'? This replaces the current character, notes, resources, and initiative. Export your current backup first.'))return;
   const changed=L.replaceStack(library,activeId,candidate);const oldLibrary=library;library=changed;if(!(await saveLibrary())){library=oldLibrary;throw Error('Could not save the restored character. Your current sheet remains open.');}
   stack=candidate;ui.modalType='';ui.tab='sheet';ui.notice='Character backup restored successfully';render(false);
 }catch(e){ui.notice='Backup import failed: '+e.message;render();}return;}
if(el.closest('#library-character-create')){BU.preview(el.closest('form'),library);return;}if(el.closest('#character-build-edit')){BU.preview(el.closest('form'),library,stack.present);return;}if(el.closest('#character-full-editor')){updateEditorPreview();return;}
const type=getParam(el,'change');
if(el.id==='cast-cost'){updateCastCostPreview();return;}
 if(type==='spell-filter'){ui.spellFilter[getParam(el,'key')]=el.value;render();return;}
if(type==='prepare-level'){ui.prepareLevel=el.value;render();return;}
 if(type==='prepare-purpose'){ui.preparePurpose=el.value;render();return;}
 if(type==='prepare-economy'){ui.prepareEconomy=el.value;render();return;}
 if(type==='prepare-focus'){ui.prepareFocus=el.value;render();return;}
if(type==='journal-status'){ui.journalFilter.status=el.value;render();return;}
if(type==='journal-tag'){ui.journalFilter.tag=el.value;render();return;}
if(el.id==='journal-entry-type'){const quest=document.getElementById('journal-quest-field');if(quest)quest.hidden=el.value!=='Quest';return;}
if(type==='inventory-filter'){ui.inventoryFilter=el.value;render();return;}
if(type==='catalog-level'){ui.catalogLevel=el.value;render();return;}if(type==='catalog-school'){ui.catalogSchool=el.value;render();return;}if(type==='catalog-concentration'){ui.catalogConcentration=el.value;render();return;}if(type==='catalog-ritual'){ui.catalogRitual=el.value;render();return;}
if(type==='weapon-catalog-filter'){ui.weaponCatalogFilter=el.value;render();return;}
if(type==='quick-roll-count'){ui.quickRoll.count=Number(el.value);return;}if(type==='quick-roll-modifier'){ui.quickRoll.modifier=Number(el.value)||0;return;}if(type==='quick-roll-mode'){ui.quickRoll.mode=el.value;return;}
if(el.id==='item-category'){const isWeapon=el.value==='weapon',isArmor=['armor','shield'].includes(el.value);const w=document.getElementById('weapon-fields'),a=document.getElementById('armor-fields');if(w)w.hidden=!isWeapon;if(a)a.hidden=!isArmor;if(el.value==='shield'){const kind=document.querySelector('select[name=armorKind]'),base=document.querySelector('input[name=armorBase]');if(kind)kind.value='shield';if(base)base.value='2';}return;}
if(type==='concentration'){transact(state=>({...state,resources:{...state.resources,concentration:el.value,lastConcentrationDC:null}}),'Concentration recorded');return;}
if(type==='elemental'){transact(state=>({...state,resources:{...state.resources,elementalResistance:el.value}}),'Aura resistance updated');return;}
if(type==='condition'){const x=el.value,checked=el.checked;transact(state=>({...state,resources:{...state.resources,conditions:checked?[...state.resources.conditions.filter(y=>y!==x),x]:state.resources.conditions.filter(y=>y!==x)}}),'Condition updated');return;}
if(type==='actor-score'){const id=getParam(el,'id'),score=Number(el.value);if(!Number.isInteger(score)){announce('Initiative must be a whole number.');return;}transact(state=>({...state,encounter:C.setActorInitiative(state.encounter,id,score)}),'Initiative score updated');return;}});
document.addEventListener('input',event=>{const el=event.target;if(el.closest('#appearance-form')){previewAppearance();return;}if(el.closest('#library-character-create')){BU.preview(el.closest('form'),library);return;}if(el.closest('#character-build-edit')){BU.preview(el.closest('form'),library,stack.present);return;}if(el.id==='library-search'){const pos=el.selectionStart;libraryUI.query=el.value;render();const next=document.getElementById('library-search');next?.focus();if(pos!==null)next?.setSelectionRange(pos,pos);return;}if(el.closest('#character-full-editor')){updateEditorPreview();return;}if(el.id==='weapon-catalog-search'){const pos=el.selectionStart;ui.weaponCatalogSearch=el.value;render();const next=document.getElementById('weapon-catalog-search');next?.focus();if(pos!==null)next?.setSelectionRange(pos,pos);return;}if(!['spell-search','prepare-search','journal-search','catalog-search'].includes(el.id))return;
 const field=el.id,position=el.selectionStart,value=el.value;
 if(field==='spell-search')ui.spellFilter.query=value;else if(field==='prepare-search')ui.prepareQuery=value;else if(field==='catalog-search')ui.catalogSearch=value;else ui.journalFilter.query=value;
 render();const replacement=document.getElementById(field);if(replacement){replacement.focus();if(position!==null)replacement.setSelectionRange(position,position);}
});
boot();
})();
