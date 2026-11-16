"""Milestone 18.6: integrated Rogue weapon damage and persistent once-per-turn state."""
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
 page=browser.new_page(viewport={'width':1280,'height':900});page.set_default_timeout(6500);errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 page.locator('[data-action=library-new-character]').first.click()
 form=page.locator('#library-character-create')
 form.locator('[name=name]').fill('Rogue Milestone Tester')
 form.locator('[name=classId]').select_option('class:rogue')
 form.locator('[name=level]').fill('5');form.locator('[type=submit]').click()
 page.locator('.library-character').filter(has_text='Rogue Milestone Tester').locator('[data-action=library-open]').click()
 page.locator('[data-action=nav][data-tab=inventory]:visible').first.click()
 page.locator('[data-action=weapon-catalog-open]').click()
 page.locator('[data-action=weapon-catalog-add][data-id=dagger]').first.click()
 page.locator('[data-action=close-modal]').last.click()
 page.locator('.ledger-item').filter(has_text='Dagger').locator('[data-action=item-equip]').first.click()
 page.locator('.ledger-item').filter(has_text='Dagger').locator('[data-action=weapon-attack]').first.click()
 modal=page.locator('#weapon-attack-form')
 assert modal.locator('[name=sneakEnabled]').is_visible()
 modal.locator('[name=rollMode]').select_option('advantage')
 modal.locator('[name=targetAC]').fill('10')
 modal.locator('[name=sneakEnabled]').check()
 modal.locator('[name=sneakStrike1]').select_option('withdraw')
 page.evaluate('window.FolioDice.rollDie = sides => sides===20?15:2')
 modal.locator('button[type=submit]').click()
 assert 'Sneak Attack +4' in page.locator('body').inner_text(),page.locator('body').inner_text()[-2000:]
 page.locator('[data-action=nav][data-tab=sheet]').first.click()
 assert page.locator('[data-action=rogue-new-turn]').is_enabled()
 page.locator('[data-action=go-library]').first.click()
 page.locator('.library-character').filter(has_text='Rogue Milestone Tester').locator('[data-action=library-open]').click()
 assert page.locator('[data-action=rogue-new-turn]').is_enabled(),'once-per-turn state must survive save/reopen'
 page.locator('[data-action=rogue-new-turn]').click()
 assert page.locator('[data-action=rogue-new-turn]').is_enabled()
 page.set_viewport_size({'width':390,'height':844})
 assert page.locator('[data-action=rogue-new-turn]').is_visible()
 page.locator('[data-action=nav][data-tab=inventory]:visible').first.click()
 page.locator('.ledger-item').filter(has_text='Dagger').locator('[data-action=weapon-attack]').first.click()
 assert page.locator('[name=sneakStrike1]').is_visible()
 assert page.locator('.weapon-attack-dialog').evaluate('(x)=>x.scrollWidth<=x.clientWidth+8')
 (BASE/'test-output').mkdir(exist_ok=True)
 page.screenshot(path=str(BASE/'test-output/milestone18-6-rogue-mobile.png'),full_page=True)
 assert not errors,errors
 browser.close()
print('PASS: Rogue Sneak Attack and Cunning Strike weapon UI, save/reopen, new-turn reset, mobile')
