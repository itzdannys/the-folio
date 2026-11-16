"""Paladin M18.8 integration: Divine Smite, Radiant Strikes, resource persistence and mobile."""
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
 page=browser.new_page(viewport={'width':1180,'height':850});page.set_default_timeout(7000);errors=[]
 page.on('pageerror',lambda er:errors.append(str(er)))
 page.set_content(html,wait_until='domcontentloaded')
 page.locator('[data-action=library-new-character]').first.click()
 f=page.locator('#library-character-create');f.locator('[name=name]').fill('Paladin Rule Tester');f.locator('[name=classId]').select_option('class:paladin');f.locator('[name=level]').fill('11');f.locator('button[type=submit]').click()
 page.locator('.library-character').filter(has_text='Paladin Rule Tester').locator('[data-action=library-open]').click()
 assert page.locator('#paladin-touch-healing').is_visible()
 assert 'Radiant Strikes' in page.locator('body').inner_text()
 page.locator('[data-action=nav][data-tab=inventory]:visible').first.click()
 page.locator('[data-action=weapon-catalog-open]').click()
 page.locator('[data-action=weapon-catalog-add][data-id=longsword]').first.click()
 page.locator('[data-action=close-modal]').last.click()
 page.locator('.ledger-item').filter(has_text='Longsword').locator('[data-action=item-equip]').first.click()
 page.locator('.ledger-item').filter(has_text='Longsword').locator('[data-action=weapon-attack]').first.click()
 m=page.locator('#weapon-attack-form')
 assert m.locator('[name=smiteCost]').is_visible()
 m.locator('[name=targetAC]').fill('10')
 m.locator('[name=smiteCost]').select_option('free')
 page.evaluate('window.FolioDice.rollDie=sides=>sides===20?15:sides===8?4:2')
 m.locator('button[type=submit]').click()
 assert 'Divine Smite +8 Radiant' in page.locator('body').inner_text(),page.locator('body').inner_text()[-1600:]
 assert 'Radiant Strikes +4 Radiant' in page.locator('body').inner_text()
 page.locator('[data-action=nav][data-tab=sheet]:visible').first.click()
 assert '0 free cast remaining' in page.locator('body').inner_text(),page.locator('body').inner_text()[-2000:]
 page.locator('[data-action=go-library]').first.click()
 page.locator('.library-character').filter(has_text='Paladin Rule Tester').locator('[data-action=library-open]').click()
 assert '0 free cast remaining' in page.locator('body').inner_text()
 page.locator('#paladin-touch-healing').fill('1')
 page.locator('[data-action=paladin-touch-self]').click()
 assert 'Lay On Hands' in page.locator('body').inner_text()
 page.locator('[data-action=nav][data-tab=spellbook]:visible').first.click()
 assert page.locator('.spell-book-row').filter(has_text='Divine Smite').count()>0
 assert page.locator('.spell-book-row').filter(has_text='Find Steed').count()>0
 assert page.locator('.spell-book-row').filter(has_text='Divine Smite').first.locator('[data-action=open-cast]').is_disabled(), 'Smite must use attack confirmation'
 page.locator('.spell-book-row').filter(has_text='Find Steed').first.locator('[data-action=open-cast]').click()
 cast=page.locator('#cast-form')
 cast.locator('[name=cost]').select_option('paladin-steed-free')
 cast.locator('button[type=submit]').click()
 page.locator('[data-action=nav][data-tab=sheet]:visible').first.click()
 assert 'Faithful Steed (free)' in page.locator('body').inner_text()
 assert '0 / 1' in page.locator('body').inner_text()
 page.set_viewport_size({'width':390,'height':844})
 assert page.locator('#paladin-touch-healing').is_visible()
 assert not page.locator('.builder-slot-card').first.evaluate('(x)=>x.scrollWidth>x.clientWidth+14')
 (BASE/'test-output').mkdir(exist_ok=True)
 page.screenshot(path=str(BASE/'test-output/milestone18-8-paladin-mobile.png'),full_page=True)
 assert not errors,errors
 browser.close()
print('PASS: Paladin Smite, Radiant Strikes, persistence, Touch, 390px mobile')
