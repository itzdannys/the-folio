"""M15.2: portrait/emblem removal persists across a fresh page runtime without Save artwork."""
from pathlib import Path
import shutil, re, json, base64, tempfile
from playwright.sync_api import sync_playwright
from PIL import Image

base=Path(__file__).resolve().parents[1]
fixture=Path(tempfile.gettempdir())/'folio_m15_2_test_portrait.png'
Image.new('RGB',(160,220),'#b4799b').save(fixture)

def page_html(saved=None):
    html=(base/'index.html').read_text()
    html=html.replace('<link rel="stylesheet" href="css/style.css">','<style>'+(base/'css/style.css').read_text()+'</style>')
    setup='<script>Object.defineProperty(window,"indexedDB",{configurable:true,value:undefined});' + \
          'const STORE='+json.dumps(saved or {})+';' + \
          'Object.defineProperty(window,"localStorage",{configurable:true,value:{getItem:k=>STORE[k]||null,setItem:(k,v)=>STORE[k]=String(v),removeItem:k=>delete STORE[k]}});window.confirm=()=>true;</script>'
    html=html.replace('</head>',setup+'</head>')
    html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(base/m.group(1)).read_text().replace('</script>',r'<\/script>')+'</script>',html)
    for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
       data=base64.b64encode((base/'assets'/name).read_bytes()).decode()
       html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+data)
    return html

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    context=browser.new_context()
    errors=[]
    def boot(saved=None):
        page=context.new_page()
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(page_html(saved),wait_until='domcontentloaded')
        page.locator('[data-action=library-open]').first.wait_for(timeout=15000)
        return page
    def studio(page):
        page.locator('[data-action=library-open]').first.click()
        page.locator('.folio-options-menu summary').click()
        page.locator('[data-action=open-artwork]').click()
        page.locator('#artwork-portrait-file').wait_for()
    def snapshot(page):return page.evaluate('JSON.parse(JSON.stringify(STORE))')

    page=boot();studio(page)
    page.locator('#artwork-portrait-file').set_input_files(str(fixture))
    page.locator('.artwork-portrait img[src^="data:"]').wait_for(timeout=15000)
    page.locator('#artwork-emblem-file').set_input_files(str(fixture))
    page.locator('[data-action=artwork-save]').click()
    page.locator('.artwork-studio').wait_for(state='detached',timeout=15000)
    saved=snapshot(page);page.close()
    page=boot(saved)
    assert page.locator('.library-card-portrait').count()==1,'Uploaded portrait should persist'
    studio(page)
    assert page.locator('.artwork-portrait img').count()==1
    page.locator('[data-action=artwork-remove-portrait]').click()
    page.get_by_text('Portrait removed and saved',exact=False).wait_for(timeout=15000)
    saved=snapshot(page);page.close()
    # Without clicking Save artwork, create a brand-new page/runtime with same stored library
    page=boot(saved)
    assert page.locator('.library-card-portrait').count()==0, 'Portrait returned after removal and fresh load'
    studio(page)
    assert page.locator('.artwork-portrait img').count()==0
    page.locator('[data-action=artwork-remove-emblem]').click()
    page.get_by_text('Custom emblem removed and saved',exact=False).wait_for(timeout=15000)
    saved=snapshot(page);page.close()
    page=boot(saved);studio(page)
    assert page.locator('.artwork-emblem img').get_attribute('src').startswith('data:image/svg+xml;base64,')
    assert not errors,errors
    print('PASS: portrait and custom emblem removals persist across fresh app loads without Save artwork')
    browser.close()
fixture.unlink(missing_ok=True)
