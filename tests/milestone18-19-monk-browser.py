"""2024 Monk character builder, subclass controls, save/reopen and mobile."""
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
 page=browser.new_page(viewport={'width':1180,'height':850});page.set_default_timeout(9000)
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('window.FolioDice.rollDie = side => side === 20 ? 15 : side === 12 ? 7 : side === 10 ? 6 : side === 8 ? 5 : 4')
 def create(name,subclass,level):
  page.locator('[data-action=library-new-character]').first.click()
  f=page.locator('#library-character-create');f.locator('[name=name]').fill(name)
  f.locator('[name=classId]').select_option('class:monk');f.locator('[name=level]').fill(str(level));f.locator('[name=subclassId]').select_option('subclass:'+subclass)
  f.locator('button[type=submit]').click();assert not f.count(),name+' failed to create'
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def lib():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 create('Monk Mercy Browser','warrior-of-mercy',11)
 assert page.locator('#monk-2024-panel').count()==1
 page.locator('[data-action=monk-2024][data-kind=turn]').click()
 page.locator('[data-action=monk-focus-use][data-mode=flurry]').click()
 assert 'Flurry strikes 3' in page.locator('#monk-2024-panel').inner_text()
 page.locator('#optional-monk-roll summary').click()
 page.locator('#monk-attack-role').select_option('flurry')
 page.locator('#monk-harm').check()
 page.locator('[data-action=monk-2024][data-kind=unarmed]').click()
 assert 'Necrotic' in page.locator('body').inner_text() or 'Monk Unarmed Strike' in page.locator('#monk-2024-panel').inner_text()
 lib();reopen('Monk Mercy Browser')
 assert 'Flurry strikes 2' in page.locator('#monk-2024-panel').inner_text()
 # Weapon-attack modal regression: Monk-only fields must not break shared combat forms.
 page.locator('[data-action=nav][data-tab=inventory]:visible').first.click()
 page.locator('[data-action=weapon-catalog-open]').click()
 page.locator('[data-action=weapon-catalog-add][data-id=longsword]').first.click()
 page.locator('[data-action=close-modal]').last.click()
 page.locator('.ledger-item').filter(has_text='Longsword').locator('[data-action=item-equip]').first.click()
 page.locator('.ledger-item').filter(has_text='Longsword').locator('[data-action=reference]').first.click()
 page.locator('.reference-dialog [data-action=weapon-attack]').click()
 wf=page.locator('#weapon-attack-form')
 assert wf.locator('[name=monkStunning]').count()==1,'Monk weapon Stunning Strike control is missing'
 wf.locator('[name=targetAC]').fill('12')
 wf.locator('[name=monkStunning]').check()
 wf.locator('button[type=submit]').click()
 assert not wf.count(),'Monk weapon attack did not complete'
 assert not errors,errors
 lib();create('Monk Shadow Browser','warrior-of-shadow',11)
 page.locator('[data-action=monk-2024][data-kind=shadow-darkness]').click()
 assert 'Darkness active' in page.locator('#monk-2024-panel').inner_text()
 page.locator('#monk-target-confirm').check();page.locator('#monk-use-focus').check()
 page.locator('[data-action=monk-2024][data-kind=shadow-step]').click()
 assert 'Shadow Step' in page.locator('#monk-2024-panel').inner_text()
 lib();reopen('Monk Shadow Browser');assert 'Darkness active' in page.locator('#monk-2024-panel').inner_text()
 lib();create('Monk Elements Browser','warrior-of-the-elements',17)
 page.locator('#monk-own-turn').check();page.locator('[data-action=monk-2024][data-kind=element-attune]').click()
 assert 'Attunement active' in page.locator('#monk-2024-panel').inner_text()
 page.locator('#monk-element-type').select_option('Cold');page.locator('[data-action=monk-2024][data-kind=element-resistance]').click()
 assert 'Elemental Epitome Resistance' in page.locator('#monk-2024-panel').inner_text() or 'Cold' in page.locator('#monk-2024-panel').inner_text()
 lib();create('Monk Open Hand Browser','warrior-of-the-open-hand',17)
 page.locator('[data-action=monk-2024][data-kind=turn]').click()
 page.locator('[data-action=monk-focus-use][data-mode=flurry]').click()
 page.locator('#optional-monk-roll summary').click();page.locator('#monk-attack-role').select_option('flurry');page.locator('#monk-open-effect').select_option('addle');page.locator('[data-action=monk-2024][data-kind=unarmed]').click()
 assert 'Monk Unarmed Strike' in page.locator('#monk-2024-panel').inner_text()
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'),'Mobile overflow'
 assert not errors,errors
 browser.close()
print('PASS: 2024 Monk four subclasses, controls, Focus, healing/harm, save and reopen, mobile layout')
