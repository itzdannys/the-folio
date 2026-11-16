"""M17.4 offline Chromium: catalogue, adding, armor effects, editing, persistence, mobile."""
from pathlib import Path
import re,base64,shutil,json
from playwright.sync_api import sync_playwright
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text('utf8').replace('<link rel="stylesheet" href="css/style.css">','<style>'+(BASE/'css/style.css').read_text()+'</style>')
html=html.replace('</head>', '''<script>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});const STORE={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>STORE[k]||null,setItem:(k,v)=>STORE[k]=String(v),removeItem:k=>delete STORE[k]}});window.confirm=()=>true;</script></head>''')
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(BASE/m.group(1)).read_text().replace('</script>',r'<\/script>')+'</script>',html)
for n in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
 html=html.replace('assets/'+n,'data:image/svg+xml;base64,'+base64.b64encode((BASE/'assets'/n).read_bytes()).decode())
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1280,'height':900})
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(html,wait_until='domcontentloaded');page.locator('[data-action=library-open]').first.click()
 page.locator('[data-action=nav][data-tab=inventory]').first.click()
 assert page.locator('[data-action=equipment-catalog-open]').is_visible()
 page.locator('[data-action=equipment-catalog-open]').click()
 assert page.get_by_role('heading',name='Armor, tools & gear').is_visible()
 assert page.locator('.weapon-catalog-entry').count()>120
 page.locator('[data-change=equipment-catalog-filter]').select_option('Heavy Armor')
 assert page.locator('.weapon-catalog-entry').count()==4
 page.locator('#equipment-catalog-search').fill('Chain Mail')
 assert page.locator('.weapon-catalog-entry').count()==1
 page.locator('[data-action=equipment-catalog-detail][data-id="armor:chain-mail"]').click()
 assert 'STR 13' in page.locator('.equipment-detail').inner_text()
 page.locator('[data-action=equipment-catalog-add][data-id="armor:chain-mail"]').click()
 # The page rerenders but keeps the modal open for multi-add.
 page.locator('[data-action=close-modal]').last.click()
 assert page.locator('.ledger-item').filter(has_text='Chain Mail').count()==1
 page.locator('.ledger-item').filter(has_text='Chain Mail').locator('[data-action=item-equip]').click()
 assert 'speed -10 ft' in page.locator('.inventory-ledger').inner_text() or 'speed -10 ft' in page.locator('.ledger-summary').inner_text() or 'speed -10 ft' in page.locator('.queued-banner').inner_text()
 # Edit armor and preserve nonvisual metadata; add a shield and tool.
 page.locator('.ledger-item').filter(has_text='Chain Mail').locator('[data-action=item-edit]').click()
 assert page.locator('[name=armorStrength]').input_value()=='13'
 assert page.locator('[name=armorStealth]').is_checked()
 page.locator('#item-form [type=submit]').click()
 page.locator('[data-action=equipment-catalog-open]').click()
 page.locator('#equipment-catalog-search').fill('Shield')
 page.locator('[data-action=equipment-catalog-add][data-id="armor:shield"]').click()
 page.locator('[data-action=close-modal]').last.click()
 page.locator('.ledger-item').filter(has_text='Shield').locator('[data-action=item-equip]').click()
 assert '18' in page.locator('.ledger-summary').inner_text() or '19' in page.locator('.ledger-summary').inner_text()
 page.locator('[data-action=equipment-catalog-open]').click()
 page.locator('#equipment-catalog-search').fill('Thieves')
 assert page.locator('.weapon-catalog-entry').count()==1
 page.locator('[data-action=equipment-catalog-detail][data-id="tool:thieves-tools"]').click()
 assert 'DC 15' in page.locator('.equipment-detail').inner_text()
 page.locator('[data-action=equipment-catalog-add][data-id="tool:thieves-tools"]').click()
 page.locator('[data-action=close-modal]').last.click()
 assert page.locator('.ledger-item').filter(has_text='Thieves’ Tools').count()>=1
 # Check narrow layout while the catalogue is open.
 page.locator('[data-action=equipment-catalog-open]').click()
 page.set_viewport_size({'width':390,'height':844})
 assert page.locator('.weapon-catalog-dialog').is_visible()
 assert page.locator('.weapon-catalog-dialog').evaluate('el=>el.scrollWidth<=el.clientWidth+6')
 (BASE/'test-output').mkdir(exist_ok=True)
 page.screenshot(path=str(BASE/'test-output'/'milestone17-4-equipment-mobile.png'))
 assert not errors,errors
 browser.close()
print('PASS: M17.4 armour, equipment catalogue, source data, armour edit, tool DC, mobile')
