"""Milestone 18.29: PHB background builder and Origin feat browser interactions."""
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
 b=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage']);page=b.new_page(viewport={'width':1120,'height':900});page.set_default_timeout(13000)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.set_content(html,wait_until='domcontentloaded')
 def features():
  page.locator('.folio-options-menu summary').first.click()
  page.locator('[data-action=open-features]').first.click()
  pane=page.locator('.origin-section');assert pane.is_visible(),'Origin section should render';return pane
 def creation(name,bg,equip='',tool=''):
  page.locator('[data-action=library-new-character]').first.click()
  f=page.locator('#library-character-create');assert f.is_visible()
  f.locator('[name=name]').fill(name);f.locator('[name=classId]').select_option('class:fighter');f.locator('[name=level]').fill('5');f.locator('[name=speciesId]').select_option('species:human')
  f.locator('[name=backgroundId]').select_option('background:'+bg.lower())
  assert f.locator('#builder-origin-fields').is_visible()
  if equip:f.locator('[name=backgroundEquipmentChoice]').select_option(equip)
  if tool:f.locator('[name=backgroundToolChoice]').select_option(label=tool)
  assert bg.capitalize() in f.locator('#builder-origin-fields').inner_text()
  f.locator('button[type=submit]').first.click()
  assert f.count()==0,'character creation did not close'
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
  return features()
 pane=creation('Asha Initiate','sage','A')
 assert 'Magic Initiate (Wizard)' in pane.inner_text()
 pane.locator('.origin-config summary').click()
 pane.locator('#origin-magic-wizard-0').select_option(label='Fire Bolt')
 pane.locator('#origin-magic-wizard-1').select_option(label='Mage Hand')
 pane.locator('#origin-magic-wizard-spell').select_option(label='Shield')
 pane.locator('#origin-magic-wizard-ability').select_option('int')
 pane.locator('[data-action=origin-save]').click()
 assert 'Origin feat selections saved' in pane.locator('.origin-last').inner_text()
 pane.locator('.origin-config summary').click();assert pane.locator('#origin-magic-wizard-spell').input_value()=='Shield'
 page.locator('[data-action=go-library]').first.click()
 page.locator('.library-character').filter(has_text='Asha Initiate').locator('[data-action=library-open]').first.click()
 pane=features();pane.locator('.origin-config summary').click();assert pane.locator('#origin-magic-wizard-spell').input_value()=='Shield'
 page.locator('[data-action=go-library]').first.click()
 pane=creation('Milo Luck','merchant','B');assert '50 GP' in pane.inner_text()
 pane.locator('#origin-confirm').check();pane.locator('[data-kind=lucky-self]').click();assert '2 / 3 points' in pane.inner_text()
 page.locator('[data-action=go-library]').first.click()
 page.locator('.library-character').filter(has_text='Milo Luck').locator('[data-action=library-open]').first.click();pane=features();assert '2 / 3 points' in pane.inner_text()
 page.set_viewport_size({'width':390,'height':844});assert pane.is_visible();assert pane.evaluate('(e)=>e.scrollWidth<=e.clientWidth+8'), 'Origin mobile section overflowed'
 page.locator('[data-action=go-library]').first.click()
 page.locator('[data-action=library-new-character]').first.click();f=page.locator('#library-character-create');f.locator('[name=backgroundId]').select_option('background:entertainer');assert f.locator('[name=backgroundToolChoice] option').count()>4
 assert f.evaluate('(e)=>e.scrollWidth<=e.clientWidth+8'),'Builder mobile layout overflowed'
 assert not errors,errors
 b.close()
print('PASS: 2024 background equipment, tool choices, Origin spell selections, Lucky use, save/reopen and mobile')
