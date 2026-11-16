"""Integration: real browser class Rage, typed damage, manual modifiers, Undo, mobile controls."""
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
 page=browser.new_page(viewport={'width':1280,'height':900});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 page.locator('[data-action=library-new-character]').first.click()
 form=page.locator('#library-character-create')
 form.locator('input[name=name]').fill('Rage Tester')
 form.locator('select[name=classId]').select_option('class:barbarian')
 form.locator('input[name=level]').fill('5')
 form.locator('button[type=submit]').click()
 page.locator('.library-character').filter(has_text='Rage Tester').locator('[data-action=library-open]').click()
 hp=lambda:int(page.locator('.hp-current').inner_text())
 start=hp()
 page.locator('[data-action=rage-toggle]').first.click()
 page.locator('#hp-amount').fill('19')
 page.locator('[data-action=damage]').first.click()
 page.locator('#damage-type').select_option('Slashing')
 page.locator('[data-action=damage-apply]').click()
 assert hp()==start-9,('rage',start,hp())
 assert '19 Slashing → 9 taken' in page.locator('#hp-help').inner_text()
 page.locator('[data-action=undo]').first.click()
 assert hp()==start,('undo',start,hp())
 page.locator('[data-action=rage-toggle]').first.click() # end rage
 page.locator('[data-action=damage]').first.click()
 page.locator('#damage-type').select_option('Fire')
 page.locator('#damage-resistant').check()
 page.locator('#damage-vulnerable').check()
 page.locator('[data-action=damage-apply]').click()
 assert hp()==start-18,('manual both',start,hp())
 page.locator('[data-action=damage]').first.click()
 assert not page.locator('#damage-resistant').is_checked(),'Manual flags should reset after a hit'
 page.set_viewport_size({'width':390,'height':844})
 assert page.locator('#damage-type').is_visible()
 assert page.locator('#damage-immune').is_visible()
 (BASE/'test-output').mkdir(exist_ok=True)
 page.screenshot(path=str(BASE/'test-output'/'milestone18-1-typed-damage-mobile.png'),full_page=True)
 assert not errors,errors
 browser.close()
print('PASS: damage types, Rage, manual resistance/vulnerability, Undo, mobile viewport')
