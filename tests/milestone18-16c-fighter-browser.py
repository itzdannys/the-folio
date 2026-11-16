"""Fighter 18.16C: hands-on browser sign-off for new controls, persistence, and layout."""
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
 page=browser.new_page(viewport={'width':1180,'height':850});page.set_default_timeout(8000)
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('window.FolioDice.rollDie=side=>side===20?16:5')
 def create(name,subclass,level):
  page.locator('[data-action=library-new-character]').first.click()
  f=page.locator('#library-character-create');f.locator('[name=name]').fill(name)
  f.locator('[name=classId]').select_option('class:fighter');f.locator('[name=level]').fill(str(level));f.locator('[name=subclassId]').select_option('subclass:'+subclass)
  f.locator('button[type=submit]').click();assert not f.count(),name+' create failed'
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def lib():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def sword():
  page.locator('[data-action=nav][data-tab=inventory]:visible').first.click()
  page.locator('[data-action=weapon-catalog-open]').click()
  page.locator('[data-action=weapon-catalog-add][data-id=longsword]').first.click()
  page.locator('[data-action=close-modal]').last.click()
  page.locator('.ledger-item').filter(has_text='Longsword').locator('[data-action=item-equip]').first.click()
 def attack():
  page.locator('.ledger-item').filter(has_text='Longsword').locator('[data-action=reference]').first.click()
  page.locator('.reference-dialog [data-action=weapon-attack]').click()
 create('Fighter C Battle','battle-master',15)
 page.locator('#fighter-student-skill').select_option('Perception')
 page.locator('#fighter-student-tool').select_option("Smith's Tools")
 page.locator('[data-action=fighter-student-war]').click()
 assert page.locator('#fighter-student-skill').input_value()=='Perception'
 page.locator('details summary').filter(has_text='Choose known maneuvers').click()
 page.locator('[data-action=fighter-maneuver-add][data-name="Commander\'s Strike"]').click()
 page.locator('details summary').filter(has_text='Choose known maneuvers').click()
 page.locator('[data-action=fighter-maneuver-add][data-name="Precision Attack"]').click()
 page.locator('details summary').filter(has_text='Choose known maneuvers').click()
 page.locator('[data-action=fighter-maneuver-add][data-name="Riposte"]').click()
 page.locator('[data-action=fighter-start-turn]').click()
 page.locator('#fighter-commander-ally').fill('Ally Test')
 page.locator('#fighter-commander-react').check()
 page.locator('#fighter-commander-hit').check()
 page.locator('[data-action=fighter-commanders-strike]').click()
 assert 'Commander' in page.locator('body').inner_text()
 lib();reopen('Fighter C Battle')
 assert page.locator('#fighter-student-skill').input_value()=='Perception'
 assert page.locator('#fighter-student-tool').input_value()=="Smith's Tools"
 sword();attack();f=page.locator('#weapon-attack-form')
 assert f.locator('[name=fighterPrecision]').count()==1
 assert f.locator('option[value="riposte"]').count()==1
 f.locator('button[type=button][data-action=close-modal]').first.click() if f.locator('button[type=button][data-action=close-modal]').count() else page.locator('[data-action=close-modal]').last.click()
 lib()
 create('Fighter C Psi','psi-warrior',7)
 sword();attack();form=page.locator('#weapon-attack-form')
 form.locator('[name=fighterTarget]').fill('Ogre')
 form.locator('[name=targetAC]').fill('12')
 form.locator('[name=fighterPsiStrike]').check();form.locator('[name=fighterPsiWithin30]').check()
 form.locator('button[type=submit]').click()
 assert not form.count()
 page.locator('[data-action=nav][data-tab=sheet]:visible').first.click()
 page.locator('#fighter-thrust-target').fill('Ogre')
 page.locator('#fighter-thrust-save').fill('4')
 page.locator('#fighter-thrust-confirm').check()
 page.locator('[data-action=fighter-psi-thrust]').click()
 assert 'Telekinetic Thrust' in page.locator('body').inner_text()
 lib();reopen('Fighter C Psi')
 assert page.evaluate("STORE['masquerade-folio:library:v1'].includes('Telekinetic Thrust')")
 lib()
 create('Fighter C Knight','eldritch-knight',7)
 page.locator('[data-action=fighter-war-magic]').click()
 assert page.locator('[data-action=nav][data-tab=spellbook].active').count() or 'Spellbook' in page.locator('body').inner_text()
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'),'Mobile overflow'
 assert not errors,errors
 browser.close()
print('PASS: Fighter 18.16C Student of War, Commander Strike, Precision/Riposte, Psi Thrust, Spellbook shortcut, persistence, mobile')
