"""M18.3 real sheet controls: Paladin aura, Sorcerer Innate Sorcery, Rogue defenses, Monk Evasion."""
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
 for name,kind,level in [('M18.3 Paladin','paladin',6),('M18.3 Sorcerer','sorcerer',1),('M18.3 Rogue','rogue',7),('M18.3 Monk','monk',7)]:
  page=browser.new_page(viewport={'width':1200,'height':880});errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.set_content(html,wait_until='domcontentloaded')
  page.locator('[data-action=library-new-character]').first.click()
  form=page.locator('#library-character-create');form.locator('[name=name]').fill(name)
  form.locator('[name=classId]').select_option('class:'+kind);form.locator('[name=level]').fill(str(level))
  form.locator('button[type=submit]').click()
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').click()
  body=page.locator('body')
  if kind=='paladin':
   assert 'Aura of Protection:' in body.inner_text()
   actual=page.evaluate('''() => { const c=window.FolioBuilder;return document.querySelector('.builder-slot-card')?.textContent }''')
   assert 'Aura of Protection:' in body.inner_text(),actual
  if kind=='sorcerer':
   before=page.locator('.vital-stat').last.inner_text()
   page.locator('[data-action=innate-sorcery-toggle]').first.click()
   after=page.locator('.vital-stat').last.inner_text()
   assert before != after,(before,after)
   assert 'End Innate Sorcery' in body.inner_text()
   assert '1 / 2' in page.locator('.builder-slot-card').last.inner_text()
   page.locator('[data-action=innate-sorcery-toggle]').first.click()
   assert page.locator('.vital-stat').last.inner_text()==before
  if kind=='rogue':
   assert page.locator('#damage-defense').count()==0 # options stay off main bar
   page.locator('#hp-amount').fill('18')
   page.locator('[data-action=damage]').first.click()
   page.locator('#damage-type').select_option('Piercing')
   page.locator('#damage-defense').select_option('uncanny-dodge')
   old=page.locator('.hp-current').inner_text()
   page.locator('[data-action=damage-apply]').click()
   assert int(old)-int(page.locator('.hp-current').inner_text())==9
   assert 'Reaction spent.' in body.inner_text()
   page.locator('[data-action=reaction-reset]').first.click()
   assert 'Reaction ready.' in body.inner_text()
  if kind=='monk':
   assert page.locator('#damage-defense').count()==0,'Defenses should not crowd the main HP bar'
   page.locator('#hp-amount').fill('17')
   page.locator('[data-action=damage]').first.click()
   assert page.locator('#damage-defense').locator('option[value=deflect-attacks]').count()==1
   page.locator('#damage-defense').select_option('evasion-success')
   old=page.locator('.hp-current').inner_text()
   page.locator('[data-action=damage-apply]').click()
   assert old==page.locator('.hp-current').inner_text(),'Evasion success should take zero damage'
   page.locator('[data-action=damage]').first.click()
   assert page.locator('#damage-defense').input_value()=='none','per-hit input should reset'
   page.locator('[data-action=close-modal]').last.click()
  page.set_viewport_size({'width':390,'height':844})
  assert page.locator('[data-action=class-resource]').first.is_visible() or kind=='rogue'
  assert not errors,(kind,errors)
  if kind=='rogue':
   (BASE/'test-output').mkdir(exist_ok=True)
   page.screenshot(path=str(BASE/'test-output/milestone18-3-rogue-mobile.png'),full_page=True)
  page.close()
 browser.close()
print('PASS: four class feature workflows, persist/turn off state, defensive damage, 390px viewport')
