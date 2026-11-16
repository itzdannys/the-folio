"""Chromium smoke for 2024 Fighter multi-subclass integration and local save."""
from pathlib import Path
import re,base64,shutil
from playwright.sync_api import sync_playwright
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text('utf8').replace('<link rel="stylesheet" href="css/style.css">','<style>'+(BASE/'css/style.css').read_text('utf8')+'</style>')
html=html.replace('</head>', '''<script>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});const DATA={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>DATA[k]||null,setItem:(k,v)=>DATA[k]=String(v),removeItem:k=>delete DATA[k]}});window.confirm=()=>true;</script></head>''')
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(BASE/m.group(1)).read_text('utf8').replace('</script>',r'<\/script>')+'</script>',html)
for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
 html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+base64.b64encode((BASE/'assets'/name).read_bytes()).decode())
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1180,'height':850});page.set_default_timeout(10000)
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(html,wait_until='domcontentloaded')
 def create(name,subclass,level):
  page.locator('[data-action=library-new-character]').first.click()
  form=page.locator('#library-character-create');form.locator('[name=name]').fill(name)
  form.locator('[name=classId]').select_option('class:fighter')
  form.locator('[name=level]').fill(str(level))
  form.locator('[name=subclassId]').select_option('subclass:'+subclass)
  form.locator('button[type=submit]').click()
  assert form.count()==0,'Create failed: '+name
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def lib():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 create('Fighter Battle A','battle-master',15)
 assert page.locator('[data-action=fighter-start-turn]').count()==1
 page.locator('[data-action=fighter-start-turn]').click()
 page.locator('details summary').filter(has_text='Choose known maneuvers').click()
 page.locator('[data-action=fighter-maneuver-add][data-name="Trip Attack"]').click()
 assert page.locator('#fighter-maneuver option').count()==1
 page.locator('#fighter-maneuver-target').fill('Ogre')
 page.locator('#fighter-maneuver-confirm').check()
 page.locator('#fighter-relentless').check()
 page.locator('[data-action=fighter-use-maneuver]').click()
 assert 'Battle Master maneuver' in page.locator('body').inner_text()
 lib();reopen('Fighter Battle A')
 assert page.locator('#fighter-maneuver option[value="Trip Attack"]').count()==1,'Battle Master known choice not persisted'
 lib()
 create('Fighter Psi A','psi-warrior',10)
 page.locator('#fighter-psi-action').select_option('protective')
 page.locator('#fighter-psi-target').fill('Ally')
 page.locator('#fighter-psi-range').check()
 page.locator('#fighter-psi-confirm').check()
 page.locator('[data-action=fighter-psi-use]').click()
 assert 'Psi Warrior' in page.locator('body').inner_text()
 lib();reopen('Fighter Psi A')
 assert 'Psi Warrior' in page.locator('body').inner_text()
 lib()
 create('Fighter Eldritch A','eldritch-knight',7)
 assert page.locator('[data-action=fighter-weapon-bond]').count()==1
 assert page.locator('[data-action=fighter-war-magic]').count()==1
 lib()
 create('Fighter Champion A','champion',18)
 assert 'Champion · Fighter subclass' in page.locator('body').inner_text()
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 2'),'Mobile horizontal overflow'
 assert not errors, errors
 browser.close()
print('PASS: Fighter creation, Battle Master selection and Relentless, Psi power, Eldritch Knight controls, Champion compatibility, persistence, mobile')
