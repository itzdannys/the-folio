"""M15.3: a framed token replaces Pip's butterfly bookplate and persists across a fresh load.
Uses an in-memory offline page (browser sandbox blocks file:// navigation).
"""
from pathlib import Path
import base64, json, re, shutil, tempfile
from PIL import Image
from playwright.sync_api import sync_playwright
base=Path(__file__).resolve().parents[1]
fixture=Path(tempfile.gettempdir())/'folio_m15_3_portrait.png'
Image.new('RGB',(240,300),(47,139,181)).save(fixture)

def html_for(saved=None):
    html=(base/'index.html').read_text()
    html=html.replace('<link rel="stylesheet" href="css/style.css">','<style>'+(base/'css/style.css').read_text()+'</style>')
    setup='<script>Object.defineProperty(window,"indexedDB",{configurable:true,value:undefined});const STORE='+json.dumps(saved or {})+';Object.defineProperty(window,"localStorage",{configurable:true,value:{getItem:k=>STORE[k]||null,setItem:(k,v)=>STORE[k]=String(v),removeItem:k=>delete STORE[k]}});window.confirm=()=>true;</script>'
    html=html.replace('</head>',setup+'</head>')
    html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(base/m.group(1)).read_text().replace('</script>',r'<\/script>')+'</script>',html)
    for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
        data=base64.b64encode((base/'assets'/name).read_bytes()).decode()
        html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+data)
    return html

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    ctx=browser.new_context(viewport={'width':1280,'height':900})
    errors=[]
    def open_page(saved=None):
        page=ctx.new_page();page.set_default_timeout(12000)
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.set_content(html_for(saved),wait_until='domcontentloaded')
        page.locator('[data-action=library-open]').first.wait_for()
        page.locator('[data-action=library-open]').first.click()
        return page
    page=open_page()
    assert page.locator('[data-action="layout-reset-saved"]').count()==0,'Redundant reset button still present'
    assert page.locator('[data-action="layout-edit"]').is_visible()
    page.locator('[data-action="layout-edit"]').click()
    assert page.locator('[data-action="layout-reset"]').is_visible(),'Keep Restore Default inside editing'
    page.locator('[data-action="layout-cancel"]').click()
    page.locator('.folio-options-menu summary').click()
    page.locator('[data-action=open-artwork]').click()
    page.locator('#artwork-portrait-file').set_input_files(str(fixture))
    page.locator('.artwork-portrait img').wait_for()
    # Deliberately use the butterfly as source to prove the framed output is replacing it.
    page.locator('[data-action=artwork-preset][data-preset=butterfly]').click()
    page.locator('#artwork-token-source').select_option('portrait')
    page.locator('#artwork-ring-color').fill('#c5a475')
    assert page.locator('[data-action="artwork-use-token-as-sheet"]').is_visible()
    page.locator('[data-action="artwork-use-token-as-sheet"]').click()
    page.locator('.artwork-studio').wait_for(state='detached',timeout=16000)
    assert 'Framed token saved' in page.locator('.toast').inner_text()
    src=page.locator('.bookplate').get_attribute('src')
    assert src.startswith('data:image/webp;base64,'),src[:100]
    result=page.evaluate('JSON.parse(JSON.stringify(STORE))')
    page.close()
    page=open_page(result)
    src=page.locator('.bookplate').get_attribute('src')
    assert src.startswith('data:image/webp;base64,'),'Token did not persist as sheet icon'
    page.locator('.folio-options-menu summary').click()
    page.locator('[data-action=open-artwork]').click()
    assert page.locator('#artwork-sheet-icon').input_value()=='token'
    assert page.locator('[data-action="artwork-use-token-as-sheet"]').count()==1
    (base/'test-output').mkdir(exist_ok=True)
    page.screenshot(path=str(base/'test-output'/'m15-3-artwork-button.png'))
    assert not errors,errors
    print('PASS: remove duplicate reset, use framed token as sheet icon, persisted after fresh load')
    browser.close()
fixture.unlink(missing_ok=True)
