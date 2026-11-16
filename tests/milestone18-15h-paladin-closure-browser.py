"""Offline Chromium E2E for Paladin Unarmed, enemy effects, ally speed, persistence."""
from pathlib import Path
import re, base64, shutil
from playwright.sync_api import sync_playwright
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text('utf8').replace('<link rel="stylesheet" href="css/style.css">','<style>'+(BASE/'css/style.css').read_text('utf8')+'</style>')
html=html.replace('</head>', '''<script>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});const DATA={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>DATA[k]||null,setItem:(k,v)=>DATA[k]=String(v),removeItem:k=>delete DATA[k]}});window.confirm=()=>true;</script></head>''')
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(BASE/m.group(1)).read_text('utf8').replace('</script>',r'<\/script>')+'</script>',html)
for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
 html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+base64.b64encode((BASE/'assets'/name).read_bytes()).decode())
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1180,'height':860});page.set_default_timeout(13000)
 errors=[];page.on('pageerror',lambda er:errors.append(str(er)))
 page.set_content(html,wait_until='domcontentloaded')
 def create(name,subclass,level):
  page.locator('[data-action=library-new-character]').first.click()
  form=page.locator('#library-character-create')
  form.locator('[name=name]').fill(name)
  form.locator('[name=classId]').select_option('class:paladin')
  form.locator('[name=level]').fill(str(level))
  form.locator('[name=subclassId]').select_option('subclass:'+subclass)
  form.locator('button[type=submit]').click()
  assert not form.count(), 'Builder failed to submit'
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def library():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 create('Paladin Combat H','oath-of-devotion',11)
 page.locator('[data-action=paladin-start-turn]').click()
 page.locator('[data-action=paladin-unarmed-open]').click()
 assert page.locator('#paladin-unarmed-form').is_visible()
 page.locator('#paladin-unarmed-form [name=targetAC]').fill('1')
 page.locator('#paladin-unarmed-form button[type=submit]').click()
 assert page.locator('#paladin-unarmed-form').count()==0,'Unarmed damage form did not close'
 assert 'Attacks: 1/2' in page.locator('body').inner_text()
 library();reopen('Paladin Combat H')
 assert 'Attacks: 1/2' in page.locator('body').inner_text(),'Attack state not persisted'
 page.locator('[data-action=paladin-unarmed-open]').click()
 page.locator('#paladin-unarmed-form [name=kind]').select_option('grapple')
 page.locator('#paladin-unarmed-form [name=saveTotal]').fill('1')
 page.locator('#paladin-unarmed-form [name=sizeReach]').check()
 page.locator('#paladin-unarmed-form button[type=submit]').click()
 assert page.locator('#paladin-unarmed-form').count()==0,'Unarmed grapple form did not close'
 assert 'Attacks: 2/2' in page.locator('body').inner_text()
 page.locator('[data-action=paladin-unarmed-open]').click()
 page.locator('#paladin-unarmed-form [name=targetAC]').fill('1')
 page.locator('#paladin-unarmed-form button[type=submit]').click()
 assert 'All attacks' in page.locator('body').inner_text(), 'Missing Extra Attack limit warning'
 page.locator('.modal-scrim [data-action=close-modal]').last.click()
 page.locator('[data-action=paladin-start-turn]').click()
 assert 'Attacks: 0/2' in page.locator('body').inner_text()
 library()
 create('Glory Runner H','oath-of-glory',18)
 page.locator('#paladin-aura-kind').select_option('speed')
 page.locator('#paladin-aura-ally').fill('Sorcerer')
 page.locator('#paladin-aura-base').fill('30')
 page.locator('[data-action=paladin-aura-resolve]').click()
 assert '40 ft' in page.locator('body').inner_text(),'Glory speed bonus missing'
 library()
 create('Vengeful Angel H','oath-of-vengeance',20)
 page.locator('[data-action=paladin-capstone]').first.click()
 page.locator('#paladin-event-type').select_option('angel-start')
 page.locator('#paladin-event-target').fill('Frightened Ghoul')
 page.locator('#paladin-event-distance').fill('5')
 page.locator('#paladin-event-save').fill('-1')
 page.locator('[data-action=paladin-event-resolve]').click()
 assert 'Frightened Ghoul' in page.locator('body').inner_text(), 'Frightened enemy not recorded'
 assert 'Active external effects: 1' in page.locator('body').inner_text()
 library();reopen('Vengeful Angel H')
 assert 'Active external effects: 1' in page.locator('body').inner_text(),'External effect lost on save'
 page.locator('#paladin-effect-reason').select_option('damaged')
 page.locator('[data-action=paladin-event-clear]').click()
 assert 'Active external effects: 0' in page.locator('body').inner_text()
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'),'Mobile overflow'
 assert not errors,errors
 browser.close()
print('PASS: Paladin 18.15H unarmed damage/grapple/Extra Attack, Glory speed, Vengeance enemy-effect tracker, persistence, mobile')
