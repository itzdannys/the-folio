"""M17.6 end-to-end browser: supplementary spell source, reference detail and manual cast."""
from pathlib import Path
import re, base64, shutil
from playwright.sync_api import sync_playwright
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
 form.locator('input[name=name]').fill('Supplement Test')
 form.locator('select[name=classId]').select_option('class:wizard')
 form.locator('input[name=level]').fill('5')
 form.locator('button[type=submit]').click()
 page.locator('.library-character').filter(has_text='Supplement Test').locator('[data-action=library-open]').click()
 page.locator('[data-action=nav][data-tab=spellbook]').first.click()
 page.locator('[data-action=open-prep]').first.click()
 assert '430 indexed spells' in page.locator('.prepare-heading').inner_text()
 opts=page.locator('[data-change=catalog-source]')
 assert set(['srd-2024','phb-2024','strixhaven','tashas','fizbans']).issubset(set(opts.locator('option').evaluate_all('(es)=>es.map(e=>e.value)')))
 opts.select_option('strixhaven')
 page.locator('#catalog-search').fill('Vortex Warp')
 assert page.locator('.catalog-spell-row').count()==1
 assert 'reference only' in page.locator('.catalog-spell-row').inner_text().lower()
 page.locator('.catalog-spell-row [data-action=reference]').click()
 assert 'Strixhaven' in page.locator('.spell-reference-only').inner_text()
 assert 'compatibility' in page.locator('.spell-reference-only').inner_text().lower()
 page.locator('.modal-scrim [data-action=close-modal]').last.click()
 page.locator('.catalog-spell-row [data-action=catalog-draft-toggle]').click()
 # Verify a regular wizard cannot select restricted Wildemount spells.
 assert 'wildemount' not in opts.locator('option').evaluate_all('(es)=>es.map(e=>e.value)')
 page.set_viewport_size({'width':390,'height':844})
 (BASE/'test-output').mkdir(exist_ok=True)
 page.screenshot(path=str(BASE/'test-output'/'milestone17-6-supplements-mobile.png'))
 page.locator('[data-action=catalog-save-list]').click()
 assert page.locator('.spell-book-row').filter(has_text='Vortex Warp').count()==1
 page.locator('.spell-book-row').filter(has_text='Vortex Warp').locator('[data-action=open-cast]').click()
 assert 'Manual rules' in page.locator('.spell-manual-warning').inner_text()
 page.locator('.modal-scrim [data-action=close-modal]').last.click()
 assert not errors,errors
 browser.close()
print('PASS: M17.6 supplement source index, class gating, manual casting, mobile')
