"""M17.1 revised: one current ruleset, source preferences, migration and responsive controls."""
from pathlib import Path
import base64,re,shutil
from playwright.sync_api import sync_playwright
BASE=Path(__file__).resolve().parents[1]
def html_for():
    html=(BASE/'index.html').read_text()
    html=html.replace('<link rel="stylesheet" href="css/style.css">','<style>'+(BASE/'css/style.css').read_text()+'</style>')
    setup='<script>Object.defineProperty(window,"indexedDB",{configurable:true,value:undefined});const STORE={};Object.defineProperty(window,"localStorage",{configurable:true,value:{getItem:k=>STORE[k]||null,setItem:(k,v)=>STORE[k]=String(v),removeItem:k=>delete STORE[k]}});window.confirm=()=>true;</script>'
    html=html.replace('</head>',setup+'</head>')
    html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(BASE/m.group(1)).read_text().replace('</script>',r'<\/script>')+'</script>',html)
    for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
        src=base64.b64encode((BASE/'assets'/name).read_bytes()).decode()
        html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+src)
    return html
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1280,'height':900});errors=[];page.on('pageerror',lambda exc:errors.append(str(exc)))
    page.set_content(html_for(),wait_until='domcontentloaded')
    page.locator('[data-action=library-rules]').wait_for()
    page.locator('[data-action=library-rules]').click()
    dialog=page.locator('.library-dialog')
    assert dialog.get_by_role('heading',name='Rules & Sources').is_visible()
    assert dialog.get_by_text('One modern ruleset:',exact=False).count()>0
    assert page.locator('#library-rules-global select[name=edition]').count()==0
    assert page.locator('#library-rules-global input[value=srd-2024]').count()==0 # bundled PHB24 core is shown as a single included note
    assert dialog.get_by_text('PHB 24 · Core rules included',exact=False).count()>0
    assert dialog.get_by_text('PHB 24 · Core rules included',exact=False).count()>0
    assert dialog.get_by_text('Reference only',exact=False).count()>0
    assert page.locator('#library-rules-global input[value=srd-2014]').count()==0
    page.locator('#library-rules-global input[value=phb-2024]').check()
    page.locator('#library-rules-global button[type=submit]').click()
    assert page.locator('.library-dialog').count()==0
    page.locator('[data-action=library-rules]').click()
    assert page.locator('#library-rules-global input[value=phb-2024]').is_checked()
    page.locator('.library-dialog .close-modal').click()
    page.locator('[data-action=library-edit]').first.click()
    page.locator('[data-action=library-rules-character]').click()
    assert page.locator('#library-rules-character select[name=mode]').input_value()=='custom' # legacy Pip pinned
    assert page.locator('#library-rules-character select[name=edition]').count()==0
    page.locator('#library-rules-character input[value=tashas]').check()
    page.locator('#library-rules-character button[type=submit]').click()
    assert page.locator('.library-dialog').count()==0
    page.locator('[data-action=library-open]').first.click()
    assert page.locator('.rules-engine-warning').count()==0
    page.locator('[data-action=damage]').first.click()
    page.locator('[data-action=damage-apply]').first.click()
    page.locator('[data-action=undo]').first.click()
    assert page.locator('.rules-engine-warning').count()==0
    page.locator('[data-action=go-library]').first.click()
    page.locator('[data-action=library-rules]').click()
    pack='{"format":"folio-source-pack","version":1,"id":"user-seelie","name":"Seelie Court Notes","description":"Personal notes","license":"User-created","published":"2026-11","entries":[{"id":"pact","name":"Pact Token","category":"item"}]}'
    page.locator('#library-source-import-file').set_input_files({'name':'seelie.json','mimeType':'application/json','buffer':pack.encode()})
    page.get_by_text('Seelie Court Notes').wait_for(state='visible')
    assert page.get_by_text('Current rules reference',exact=False).count()>0
    page.set_viewport_size({'width':390,'height':844})
    dialog=page.locator('.library-dialog');assert dialog.is_visible()
    assert dialog.evaluate('e=>e.scrollWidth<=e.clientWidth+4')
    page.screenshot(path=str(BASE/'test-output'/'milestone17-current-rules-mobile.png'))
    assert not errors,errors
    browser.close()
print('PASS: M17.1 revised single modern ruleset, source preferences, packs, Undo, responsive manager')
