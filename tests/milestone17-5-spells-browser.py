"""M17.5 browser regression: SRD & PHB refs, search & source filters, detail, selection, mobile."""
from pathlib import Path
import re,base64,shutil
from playwright.sync_api import sync_playwright
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text('utf8').replace('<link rel="stylesheet" href="css/style.css">','<style>'+(BASE/'css/style.css').read_text()+'</style>')
html=html.replace('</head>', '''<script>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});const STORE={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>STORE[k]||null,setItem:(k,v)=>STORE[k]=String(v),removeItem:k=>delete STORE[k]}});window.confirm=()=>true;</script></head>''')
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(BASE/m.group(1)).read_text().replace('</script>',r'<\/script>')+'</script>',html)
for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
 html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+base64.b64encode((BASE/'assets'/name).read_bytes()).decode())
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1280,'height':900}); errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 page.locator('[data-action=library-new-character]').first.click()
 form=page.locator('#library-character-create');assert form.is_visible()
 form.locator('input[name=name]').fill('Starling')
 form.locator('select[name=classId]').select_option('class:wizard')
 form.locator('input[name=level]').fill('5')
 form.locator('button[type=submit]').click()
 assert page.locator('.library-character').filter(has_text='Starling').count()==1
 page.locator('.library-character').filter(has_text='Starling').locator('[data-action=library-open]').click()
 page.locator('[data-action=nav][data-tab=spellbook]').first.click()
 page.locator('[data-action=open-prep]').first.click()
 assert '430 indexed spells' in page.locator('.prepare-heading').inner_text()
 assert page.locator('[data-change=catalog-source] option').count()>=3
 page.locator('[data-change=catalog-source]').select_option('phb-2024')
 page.locator('#catalog-search').fill('Arcane Vigor')
 assert page.locator('.catalog-spell-row').count()==1
 assert 'Reference only' in page.locator('.catalog-spell-row').first.inner_text()
 page.locator('.catalog-spell-row [data-action=reference]').click()
 assert page.locator('.spell-reference-only').is_visible()
 assert 'manual rules' in page.locator('.spell-reference-only').inner_text().lower()
 assert 'Check sourcebook' in page.locator('.modal-scrim').last.inner_text()
 assert 'Full 2024 SRD spell description' not in page.locator('.modal-scrim').last.inner_text()
 page.locator('.modal-scrim [data-action=close-modal]').last.click()
 page.locator('[data-action=catalog-draft-toggle]').first.click()
 assert 'Selected' in page.locator('.catalog-spell-row').first.inner_text()
 page.locator('[data-change=catalog-source]').select_option('srd-2024')
 page.locator('#catalog-search').fill('Mage Armor')
 assert page.locator('.catalog-spell-row').count()==1
 assert 'Full SRD rules' in page.locator('.catalog-spell-row').first.inner_text()
 page.locator('.catalog-spell-row [data-action=reference]').click()
 assert page.locator('.spell-source-details').is_visible()
 page.locator('.modal-scrim [data-action=close-modal]').last.click()
 page.locator('[data-change=catalog-source]').select_option('phb-2024')
 page.locator('#catalog-search').fill('Arcane Vigor')
 page.set_viewport_size({'width':390,'height':844})
 assert page.locator('.catalog-spell-row').count()==1
 assert page.locator('.preparation-workspace').is_visible()
 (BASE/'test-output').mkdir(exist_ok=True)
 page.screenshot(path=str(BASE/'test-output'/'milestone17-5-spells-mobile.png'))
 # Commit a spell list and verify reference entries display, persist and cast manually.
 page.locator('[data-action=catalog-save-list]').click()
 assert page.get_by_role('heading',name='Spellbook').is_visible()
 assert page.locator('.spell-book-row').filter(has_text='Arcane Vigor').count()==1
 page.locator('.spell-book-row').filter(has_text='Arcane Vigor').locator('[data-action=open-cast]').click()
 assert 'Manual rules' in page.locator('.spell-manual-warning').inner_text()
 assert 'Check your sourcebook' in page.locator('.spell-manual-warning').inner_text()
 page.locator('.modal-scrim [data-action=close-modal]').last.click()
 assert not errors,errors
 browser.close()
print('PASS: M17.5 PHB references, manual detail, source filters, selection, SRD rules, mobile')
