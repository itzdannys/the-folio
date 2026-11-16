"""Offline browser regression for Paladin 2024 ally-aura calculations and persistence."""
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
 page=browser.new_page(viewport={'width':1180,'height':820});page.set_default_timeout(14000)
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
  assert not form.count()
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def library():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def calc(kind,raw=12,dc=15,ability='wis',damage='Necrotic',condition=None):
  page.locator('#paladin-aura-kind').select_option(kind)
  page.locator('#paladin-aura-base').fill(str(raw))
  page.locator('#paladin-aura-dc').fill(str(dc))
  page.locator('#paladin-aura-ability').select_option(ability)
  page.locator('#paladin-aura-damage-type').select_option(damage)
  if condition: page.locator('#paladin-aura-condition').select_option(condition)
  page.locator('[data-action=paladin-aura-resolve]').click()
  return page.locator('[role=status]').all_inner_texts()
 create('Guard Devotion','oath-of-devotion',18)
 assert page.locator('#paladin-aura-kind').is_visible()
 assert page.locator('#paladin-aura-distance').get_attribute('max')=='30'
 page.locator('#paladin-aura-ally').fill('Fighter Ally')
 rows=calc('save',12,16)
 assert any('Total 13 vs DC 16' in x for x in rows),rows
 library();reopen('Guard Devotion')
 assert 'Fighter Ally' in page.locator('body').inner_text()
 assert page.locator('#paladin-aura-condition option[value=Charmed]').count()==1
 rows=calc('condition',condition='Charmed')
 assert any('Charmed suppressed' in x for x in rows),rows
 library()
 create('Guard Ancients','oath-of-the-ancients',7)
 assert page.locator('#paladin-aura-distance').get_attribute('max')=='10'
 assert page.locator('#paladin-aura-kind option[value=damage]').count()==1
 rows=calc('damage',17,15,damage='Psychic')
 assert any('8 Psychic damage' in x for x in rows),rows
 library()
 create('Guard Courage','oath-of-vengeance',10)
 rows=calc('condition',condition='Frightened')
 assert any('Frightened suppressed' in x for x in rows),rows
 page.locator('[data-change=condition][value=Frightened]').click()
 assert not page.locator('[data-change=condition][value=Frightened]').is_checked()
 assert 'Aura of Courage prevents Frightened' in page.locator('body').inner_text()
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'),'Mobile horizontal overflow'
 assert not errors,errors
 browser.close()
print('PASS: Paladin ally auras, conditions, resistance, save/reopen, mobile')
