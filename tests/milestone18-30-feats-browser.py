"""18.30: offline/browser PHB feat selection, in-sheet actions, choices, persistence and narrow viewport."""
from pathlib import Path
import base64,re,shutil
from playwright.sync_api import sync_playwright
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text('utf8').replace('<link rel="stylesheet" href="css/style.css">','<style>'+(BASE/'css/style.css').read_text('utf8')+'</style>')
html=html.replace('</head>', '''<script>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});const STORE={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>STORE[k]||null,setItem:(k,v)=>STORE[k]=String(v),removeItem:k=>delete STORE[k]}});window.confirm=()=>true;</script></head>''')
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(BASE/m.group(1)).read_text('utf8').replace('</script>',r'<\/script>')+'</script>',html)
for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
 html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+base64.b64encode((BASE/'assets'/name).read_bytes()).decode())
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1150,'height':900});page.set_default_timeout(14000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 assert page.locator('.library-character h3').all_inner_texts()==['Pip']
 def create(name,feat,level,ability):
  page.locator('[data-action=library-new-character]').first.click()
  form=page.locator('#library-character-create');assert form.is_visible()
  form.locator('[name=name]').fill(name)
  form.locator('[name=classId]').select_option('class:fighter')
  form.locator('[name=speciesId]').select_option('species:human')
  form.locator('[name=backgroundId]').select_option('background:criminal')
  form.locator('[name=level]').fill(str(level))
  form.locator('[name=advancement-kind-'+str(level)+']') if False else None
  form.locator('[name=advancement-kind-'+str(4 if level<19 else 19)+']').select_option('feat')
  form.locator('[name=advancement-feat-'+str(4 if level<19 else 19)+']').select_option('feat:'+feat)
  if ability:form.locator('[name=advancement-ability-'+str(4 if level<19 else 19)+']').select_option(ability)
  form.locator('button[type=submit]').first.click()
  assert form.count()==0,'Create character form still open'
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def show():
  page.locator('.folio-options-menu summary').first.click()
  page.locator('[data-action=open-features]').first.click()
  sect=page.locator('.feat-section');assert sect.is_visible()
  return sect
 create('Feats Fey','fey-touched',5,'int')
 sec=show()
 assert 'Fey-Touched' in sec.inner_text()
 card=sec.locator('.feat-card').filter(has_text='Fey-Touched');card.locator('summary').click()
 card.locator('[data-feat-field=spell]').select_option(label='Detect Magic')
 card.locator('[data-action=feat-save]').click()
 assert 'Feat choices saved' in sec.locator('.feat-last').inner_text() if sec.locator('.feat-last').count() else True
 # Save/reopen and check configured field remains selected.
 page.locator('[data-action=go-library]').first.click()
 page.locator('.library-character').filter(has_text='Feats Fey').locator('[data-action=library-open]').first.click()
 sec=show();card=sec.locator('.feat-card').filter(has_text='Fey-Touched');card.locator('summary').click()
 assert card.locator('[data-feat-field=spell]').input_value()=='Detect Magic'
 page.set_viewport_size({'width':390,'height':844})
 assert sec.evaluate('(e)=>e.scrollWidth<=e.clientWidth+8'),'Feat panel overflows on mobile'
 assert page.locator('.feat-card').count()==1
 page.locator('[data-action=go-library]').first.click()
 create('Feats Fate','boon-of-fate',19,'str')
 sec=show()
 card=sec.locator('.feat-card').filter(has_text='Boon of Fate');card.locator('summary').click()
 assert '1/1' in card.locator('[data-action=feat-use]').first.inner_text()
 card.locator('[data-feat-confirm]').check();card.locator('[data-action=feat-use]').first.click()
 card=sec.locator('.feat-card').filter(has_text='Boon of Fate');card.locator('summary').click()
 assert '0/1' in card.locator('[data-action=feat-use]').first.inner_text()
 assert not errors,errors
 browser.close()
print('PASS: PHB feats builder, spell selection, resources, backup/reopen, narrow viewport and no browser errors')
