"""Fighter 18.16B: actual attack dialog linking maneuver and Psi Warrior strike; local persistence and mobile."""
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
 page=browser.new_page(viewport={'width':1180,'height':850});page.set_default_timeout(10000)
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('window.FolioDice.rollDie=side=>side===20?16:4')
 def create(name,subclass,lv):
  page.locator('[data-action=library-new-character]').first.click()
  f=page.locator('#library-character-create');f.locator('[name=name]').fill(name)
  f.locator('[name=classId]').select_option('class:fighter');f.locator('[name=level]').fill(str(lv))
  f.locator('[name=subclassId]').select_option('subclass:'+subclass);f.locator('button[type=submit]').click()
  assert not f.count();page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def lib():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def sword():
  page.locator('[data-action=nav][data-tab=inventory]:visible').first.click()
  page.locator('[data-action=weapon-catalog-open]').click()
  page.locator('[data-action=weapon-catalog-add][data-id=longsword]').first.click()
  page.locator('[data-action=close-modal]').last.click()
  page.locator('.ledger-item').filter(has_text='Longsword').locator('[data-action=item-equip]').first.click()
 def roll():page.locator('.ledger-item').filter(has_text='Longsword').locator('[data-action=weapon-attack]').first.click()
 create('Battle Link Test','battle-master',15)
 page.locator('details summary').filter(has_text='Choose known maneuvers').click()
 page.locator('[data-action=fighter-maneuver-add][data-name="Trip Attack"]').click()
 sword();roll()
 form=page.locator('#weapon-attack-form')
 assert form.locator('[name=fighterHitManeuver] option[value="Trip Attack"]').count()==1
 form.locator('[name=fighterTarget]').fill('Ogre');form.locator('[name=targetAC]').fill('12')
 form.locator('[name=fighterHitManeuver]').select_option('Trip Attack')
 form.locator('[name=fighterHitRelentless]').check();form.locator('button[type=submit]').click()
 assert not form.count(),'Battle Master hit dialog did not close'
 assert 'Battle Master Trip Attack' in page.locator('body').inner_text()
 lib();reopen('Battle Link Test')
 assert page.evaluate("STORE['masquerade-folio:library:v1'].includes('Fighter attack-linked power')"), 'Battle Master effect was not saved'
 lib()
 create('Psi Link Test','psi-warrior',7)
 sword();roll()
 form=page.locator('#weapon-attack-form')
 assert form.locator('[name=fighterPsiStrike]').count()==1
 form.locator('[name=fighterTarget]').fill('Ogre');form.locator('[name=targetAC]').fill('12')
 form.locator('[name=fighterPsiStrike]').check();form.locator('[name=fighterPsiWithin30]').check()
 form.locator('button[type=submit]').click()
 assert not form.count(),'Psi Warrior strike dialog did not close'
 assert 'Psionic Strike +' in page.locator('body').inner_text()
 lib();reopen('Psi Link Test')
 assert page.evaluate("STORE['masquerade-folio:library:v1'].includes('Fighter attack-linked power')"), 'Psionic strike was not persisted'
 page.set_viewport_size({'width':390,'height':844})
 page.locator('[data-action=nav][data-tab=inventory]:visible').first.click();roll()
 assert page.locator('[name=fighterPsiStrike]').is_visible()
 assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 2'),'Mobile horizontal overflow'
 assert not errors,errors
 browser.close()
print('PASS: Fighter Maneuver and Psi Strike weapon UI, confirmed attack, saves, reopen, mobile')
