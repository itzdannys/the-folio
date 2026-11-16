"""Milestone 18.28: species creation, sheet actions, source labelling, popup and mobile."""
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
 b=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage']);page=b.new_page(viewport={'width':1150,'height':900});page.set_default_timeout(10000)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 f=None
 def create(name,kind,level=7,variant=None,size=None):
  page.locator('[data-action=library-new-character]').first.click();f=page.locator('#library-character-create')
  f.locator('[name=name]').fill(name);f.locator('[name=classId]').select_option('class:fighter');f.locator('[name=level]').fill(str(level));f.locator('[name=speciesId]').select_option('species:'+kind)
  if size:f.locator('[name=speciesSize]').select_option(size)
  if variant:f.locator('[name=speciesVariant]').select_option(label=variant)
  f.locator('button[type=submit]').click();assert f.count()==0,name+' create failed'
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
  page.locator('.folio-options-menu summary').first.click();page.locator('[data-action=open-features]').first.click()
  box=page.locator('.species-section');assert box.count()==1 and box.is_visible(),name+' species panel missing'
  return box
 box=create('Iris','aasimar',5)
 assert 'Healing Hands' in box.inner_text();assert 'Celestial Revelation' in box.inner_text()
 box.locator('#species-confirm').check();box.locator('[data-kind=heal]').click();assert 'Healing Hands' in box.locator('.species-last').inner_text()
 page.locator('[data-action=go-library]').first.click();page.locator('.library-character').filter(has_text='Iris').locator('[data-action=library-open]').first.click();page.locator('.folio-options-menu summary').first.click();page.locator('[data-action=open-features]').first.click();assert '0 / 1 uses' in page.locator('.species-section').inner_text()
 page.locator('[data-action=go-library]').first.click();box=create('Ember','dragonborn',5,'Red');assert 'Breath Weapon' in box.inner_text();box.locator('#species-confirm').check();box.locator('[data-kind=breath]').click();assert '2 / 3 uses' in box.inner_text();
 page.locator('[data-action=nav][data-tab=sheet]').first.click();page.locator('[data-action=damage]').first.click();modal=page.locator('.damage-dialog');assert modal.is_visible();assert 'Adjust for this hit' in modal.inner_text();assert modal.locator('.damage-tile').count()==3;assert 'Resistance' in modal.inner_text();page.locator('.damage-dialog [data-action=close-modal]').first.click()
 page.locator('[data-action=go-library]').first.click();box=create('Rowan','elf',5,'High Elf');assert 'Detect Magic' in box.inner_text() and 'Misty Step' in box.inner_text()
 page.locator('[data-action=go-library]').first.click();box=create('Oren','orc',5);assert 'Adrenaline Rush' in box.inner_text();box.locator('#species-confirm').check();box.locator('[data-kind=rush]').click();assert '2 / 3 uses' in box.inner_text()
 page.locator('[data-action=go-library]').first.click();page.locator('[data-action=library-new-character]').first.click();f=page.locator('#library-character-create')
 assert f.locator('[name=speciesId] option').count()==27,'Other-book species metadata removed'
 f.locator('[name=classId]').select_option('class:paladin');f.locator('[name=subclassId]').select_option('subclass:oath-of-devotion')
 assert 'PHB 24' in f.locator('[name=subclassId]').inner_text()
 page.set_viewport_size({'width':390,'height':844});assert f.is_visible();assert f.evaluate('(e)=>e.scrollWidth<=e.clientWidth+5')
 assert not errors,errors
 b.close()
print('PASS: PHB species creation and resources, save/reopen, damage dialog, source labels, other species retained, mobile')
