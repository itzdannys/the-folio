"""M18.9 Fighter and Champion: rule effects, builder, persistence, mobile."""
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
 page=browser.new_page(viewport={'width':1200,'height':850});page.set_default_timeout(8000);errors=[]
 page.on('pageerror',lambda er:errors.append(str(er)))
 page.set_content(html,wait_until='domcontentloaded')
 page.locator('[data-action=library-new-character]').first.click()
 f=page.locator('#library-character-create')
 f.locator('[name=name]').fill('Champion Test')
 f.locator('[name=classId]').select_option('class:fighter')
 f.locator('[name=level]').fill('18')
 f.locator('[name=subclassId]').select_option('subclass:champion')
 assert f.locator('[name=championStyleId]').count()==1, 'Champion bonus style not shown'
 f.locator('[name=fightingStyleId]').select_option('feat:fighting-style-defense')
 f.locator('[name=championStyleId]').select_option('feat:archery')
 assert 'Champion bonus Fighting Style: Fighting Style: Archery' in f.locator('#builder-live-preview').inner_text()
 f.locator('button[type=submit]').click()
 assert page.locator('#library-character-create').count()==0,'Could not create Champion'
 page.locator('.library-character').filter(has_text='Champion Test').locator('[data-action=library-open]').click()
 assert page.locator('[data-action=fighter-action-surge]').count()==1
 assert page.locator('[data-action=fighter-indomitable]').count()==1
 assert '18–20' in page.locator('body').inner_text()
 page.locator('[data-action=open-builder]').first.click()
 edit=page.locator('#character-build-edit')
 assert edit.locator('[name=championStyleId]').input_value()=='feat:archery'
 assert edit.locator('[name=fightingStyleId]').input_value()=='feat:fighting-style-defense'
 edit.locator('button[type=submit]').click()
 page.locator('[data-action=fighter-action-surge]').click()
 assert page.locator('[data-action=fighter-action-surge]').is_disabled()
 # Deterministic Indomitable: d20=11, select WIS, DC 25, first result 8
 page.evaluate('window.FolioDice.rollDie=()=>11')
 page.locator('#fighter-save-ability').select_option('wis')
 page.locator('#fighter-save-total').fill('8')
 page.locator('#fighter-save-dc').fill('25')
 page.locator('[data-action=fighter-indomitable]').click()
 assert 'reroll 11' in page.locator('body').inner_text()
 # Save then reopen and make sure class resource spends persist.
 page.locator('[data-action=go-library]').first.click()
 page.locator('.library-character').filter(has_text='Champion Test').locator('[data-action=library-open]').click()
 assert page.locator('[data-action=fighter-action-surge]').is_disabled()
 # Attack with a longsword, natural 18 = critical (Champion 15+).
 page.locator('[data-action=nav][data-tab=inventory]:visible').first.click()
 page.locator('[data-action=weapon-catalog-open]').click()
 page.locator('[data-action=weapon-catalog-add][data-id=longsword]').first.click()
 page.locator('[data-action=close-modal]').last.click()
 page.locator('.ledger-item').filter(has_text='Longsword').locator('[data-action=item-equip]').first.click()
 page.locator('.ledger-item').filter(has_text='Longsword').locator('[data-action=weapon-attack]').first.click()
 f=page.locator('#weapon-attack-form')
 f.locator('[name=targetAC]').fill('40')
 page.evaluate('window.FolioDice.rollDie=sides=>sides===20?18:4')
 f.locator('button[type=submit]').click()
 assert 'CRITICAL' in page.locator('body').inner_text()
 # Back to sheet; verify no overflow at narrow width.
 page.locator('[data-action=nav][data-tab=sheet]:visible').first.click()
 page.set_viewport_size({'width':390,'height':844})
 assert page.locator('[data-action=fighter-indomitable]').is_visible()
 assert page.locator('.builder-slot-card').first.evaluate('(e)=>e.scrollWidth<=e.clientWidth+14')
 (BASE/'test-output').mkdir(exist_ok=True)
 page.screenshot(path=str(BASE/'test-output/milestone18-9-fighter-mobile.png'),full_page=True)
 assert not errors,errors
 browser.close()
print('PASS: Champion Fighter creation, resources, Indomitable, 18 critical, reopen, mobile')
