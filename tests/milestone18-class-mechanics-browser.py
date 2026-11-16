"""Chromium smoke checks for real M18 class controls; in-memory storage only."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re,base64,shutil
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text('utf8').replace('<link rel="stylesheet" href="css/style.css">','<style>'+(BASE/'css/style.css').read_text()+'</style>')
html=html.replace('</head>', '''<script>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});const STORE={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>STORE[k]||null,setItem:(k,v)=>STORE[k]=String(v),removeItem:k=>delete STORE[k]}});window.confirm=()=>true;</script></head>''')
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(BASE/m.group(1)).read_text().replace('</script>',r'<\/script>')+'</script>',html)
for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
 html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+base64.b64encode((BASE/'assets'/name).read_bytes()).decode())
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,klass in [('M18 Fighter','fighter'),('M18 Barbarian','barbarian'),('M18 Paladin','paladin'),('M18 Sorcerer','sorcerer')]:
  page=browser.new_page(viewport={'width':1250,'height':900});errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded')
  page.locator('[data-action=library-new-character]').first.click()
  form=page.locator('#library-character-create')
  form.locator('input[name=name]').fill(name)
  form.locator('select[name=classId]').select_option('class:'+klass)
  form.locator('input[name=level]').fill('5')
  form.locator('button[type=submit]').click()
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').click()
  assert 'CLASS RESOURCES' in page.locator('.builder-slot-card').all_inner_texts()[-1],name
  if klass=='fighter':
   assert 'Second Wind' in page.locator('.builder-slot-card').all_inner_texts()[-1]
   page.locator('[data-action=second-wind-heal]').first.click()
   assert '2 / 3' in page.locator('.builder-slot-card').all_inner_texts()[-1]
   page.locator('[data-action=short-rest]').first.click()
   assert '3 / 3' in page.locator('.builder-slot-card').all_inner_texts()[-1]
  if klass=='barbarian':
   page.locator('[data-action=rage-toggle]').first.click()
   assert 'End Rage' in page.locator('[data-action=rage-toggle]').first.inner_text()
   assert '2 / 3' in page.locator('.builder-slot-card').all_inner_texts()[-1]
  if klass=='paladin':
   page.locator('#class-heal-amount').first.fill('5')
   page.locator('[data-action=lay-on-hands-self]').first.click()
   assert '20 / 25' in page.locator('.builder-slot-card').all_inner_texts()[-1]
  if klass=='sorcerer':
   page.locator('[data-action=class-resource][data-id=sorcery-points][data-delta="-1"]').first.click()
   page.locator('[data-action=sorcery-convert][data-direction=to-points]').first.click()
   assert '5 / 5' in page.locator('.builder-slot-card').all_inner_texts()[-1]
  page.set_viewport_size({'width':390,'height':844})
  assert page.locator('[data-action=class-resource]').first.is_visible()
  if klass=='fighter':
   (BASE/'test-output').mkdir(exist_ok=True)
   page.screenshot(path=str(BASE/'test-output'/'milestone18-fighter-mobile.png'))
  assert not errors,(name,errors)
  page.close()
 browser.close()
print('PASS: Fighter, Barbarian, Paladin, Sorcerer class controls in Chromium and mobile viewport')
