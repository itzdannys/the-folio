"""Real Folio UI check: Wizard Arcane Recovery, Druid Wild Resurgence, Cleric Divine Spark."""
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
 for name,kind,level in [('18.4 Wizard','wizard',5),('18.4 Druid','druid',5),('18.4 Cleric','cleric',7)]:
  page=browser.new_page(viewport={'width':1200,'height':870});page.set_default_timeout(5000)
  errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(html,wait_until='domcontentloaded')
  page.locator('[data-action=library-new-character]').first.click()
  form=page.locator('#library-character-create');form.locator('[name=name]').fill(name)
  form.locator('[name=classId]').select_option('class:'+kind)
  form.locator('[name=level]').fill(str(level))
  form.locator('[type=submit]').click()
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').click()
  if kind=='wizard':
   first=page.locator('[data-action=generic-slot][data-index="0"][data-delta="-1"]').first
   first.click();first.click()
   assert page.locator('.builder-slot-card').first.inner_text().find('2 / 4')!=-1
   page.locator('.wizard-recovery-count[data-level="1"]').fill('2')
   page.locator('[data-action=wizard-recovery-apply]').click()
   assert '4 / 4' in page.locator('.builder-slot-card').first.inner_text()
   assert page.locator('[data-action=wizard-recovery-apply]').is_disabled()
   assert 'Arcane Recovery · restored slots 1, 1' in page.locator('body').inner_text()
  if kind=='druid':
   btn=page.locator('[data-action=class-resource][data-id=wild-shape][data-delta="-1"]')
   btn.first.click();btn.first.click()
   assert not page.locator('[data-action=druid-slot-to-shape]').is_disabled()
   page.locator('#druid-resurgence-level').select_option('1')
   page.locator('[data-action=druid-slot-to-shape]').click()
   assert '1 / 2' in page.locator('.builder-slot-card').last.inner_text()
   page.locator('[data-action=druid-shape-to-slot]').click()
   assert page.locator('[data-action=druid-shape-to-slot]').is_disabled()
   assert '0 / 1' in page.locator('.builder-slot-card').last.inner_text()
  if kind=='cleric':
   original=page.locator('.hp-current').inner_text()
   page.locator('#cleric-spark-kind').select_option('radiant')
   page.locator('[data-action=cleric-divine-spark]').click()
   assert page.locator('.hp-current').inner_text()==original
   assert 'Constitution save DC' in page.locator('body').inner_text()
   assert '2 / 3' in page.locator('.builder-slot-card').last.inner_text()
  page.set_viewport_size({'width':390,'height':844})
  assert page.locator('[data-action=class-resource]').first.is_visible()
  assert not errors,(kind,errors)
  if kind=='druid':
   (BASE/'test-output').mkdir(exist_ok=True)
   page.screenshot(path=str(BASE/'test-output/milestone18-4-druid-mobile.png'),full_page=True)
  page.close()
 browser.close()
print('PASS: three new class abilities, resource updates, mobile view, no JavaScript errors')
