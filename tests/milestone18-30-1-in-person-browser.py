"""Character management in physical-dice play; digital dice are optional."""
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
 page=browser.new_page(viewport={'width':1140,'height':910});page.set_default_timeout(12000)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 assert page.locator('.library-character h3').all_inner_texts()==['Pip']
 page.locator('.library-character').filter(has_text='Pip').locator('[data-action=library-open]').click()
 page.locator('[data-action=nav][data-tab=combat]').first.click()
 assert page.locator('#encounter-initiative-total').count()==1
 assert page.locator('[data-action=encounter-start]').inner_text().startswith('Record initiative')
 page.locator('#encounter-initiative-total').fill('23')
 page.locator('[data-action=encounter-start]').click()
 assert page.locator('.combatant').count()==1
 assert page.locator('.initiative-input').input_value()=='23'
 assert page.locator('[data-action=roll-init]').count()==1
 page.locator('[data-action=nav][data-tab=inventory]').first.click()
 weapon=page.locator('[data-item-id=shortsword]')
 assert weapon.locator('[data-action=reference]').count()==1
 assert weapon.locator('[data-action=weapon-attack]').count()==0
 weapon.locator('[data-action=reference]').click()
 form=page.locator('#manual-weapon-use-form');assert form.is_visible()
 assert page.locator('.reference-dialog [data-action=weapon-attack]').count()==1
 form.locator('button[type=submit]').click()
 assert page.locator('#manual-weapon-use-form').count()==0
 weapon=page.locator('[data-item-id=shortsword]');weapon.locator('[data-action=reference]').click()
 page.locator('.reference-dialog [data-action=weapon-attack]').click()
 assert page.locator('#weapon-attack-form').is_visible()
 page.locator('.weapon-attack-dialog [data-action=close-modal]').first.click()
 assert page.locator('[data-action=dice]').count()>=1
 page.set_viewport_size({'width':390,'height':844})
 page.locator('[data-action=nav][data-tab=combat]').last.click()
 assert page.locator('.initiative-input').input_value()=='23'
 assert not errors,errors
 browser.close()
print('PASS: physical initiative, weapon records, optional rolls, mobile and no runtime exceptions')
