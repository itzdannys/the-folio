"""M15 browser acceptance: default emblem, layout editing, save/cancel, drag, reload, backup, mobile."""
from pathlib import Path
import re,base64,shutil,json
from playwright.sync_api import sync_playwright
base=Path(__file__).resolve().parents[1]
out=base/'test-output';out.mkdir(exist_ok=True)
html=(base/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="css/style.css">','<style>'+(base/'css/style.css').read_text()+'</style>')
setup="""<script>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});
const STORE={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>STORE[k]||null,setItem:(k,v)=>STORE[k]=String(v),removeItem:k=>delete STORE[k]}});window.confirm=()=>true;</script>"""
html=html.replace('</head>',setup+'</head>')
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(base/m.group(1)).read_text().replace('</script>',r'<\/script>')+'</script>',html)
for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
    b64=base64.b64encode((base/'assets'/name).read_bytes()).decode()
    html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+b64)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    context=browser.new_context(viewport={'width':1440,'height':940},accept_downloads=True)
    page=context.new_page();errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
    page.set_content(html,wait_until='domcontentloaded')
    page.locator('[data-action=library-open]').first.wait_for()
    assert page.locator('.library-default-emblem').first.get_attribute('src').startswith('data:image/svg+xml;base64,')
    page.locator('[data-action=library-open]').first.click()
    assert page.locator('.bookplate').get_attribute('src').startswith('data:image/svg+xml;base64,')
    assert page.locator('.sheet-left > .folio-panel').count()==2
    assert page.locator('.sheet-middle > .folio-panel').count()==2
    assert page.locator('.sheet-right > .folio-panel').count()==3
    # artwork studio default is the universal book, not the butterfly
    page.locator('.folio-options-menu summary').click();page.locator('[data-action=open-artwork]').click()
    assert page.locator('.artwork-emblem img').get_attribute('src').startswith('data:image/svg+xml;base64,')
    assert page.locator('[data-action=artwork-preset][data-preset=book]').count()==1
    page.locator('[data-action=artwork-preset][data-preset=butterfly]').click()
    assert page.locator('.artwork-emblem img').get_attribute('src').startswith('data:image/svg+xml;base64,')
    page.locator('[data-action=artwork-remove-emblem]').click()
    assert page.locator('[data-action=artwork-preset][data-preset=book]').get_attribute('aria-pressed')=='true'
    page.locator('[data-action=artwork-cancel]').first.click()
    page.locator('[data-action=layout-edit]').click()
    assert page.locator('.layout-panel-tools').count()==7
    assert page.locator('.sheet-grid.layout-editing').count()==1
    assert page.locator('.panel-collapse-toggle:disabled').count()==7
    # Keyboard/arrow controls move ability scores from left to middle to right.
    page.locator('.folio-panel[data-layout-id="ability-scores"] [data-direction="right"]').click()
    assert 'ability-scores' in page.locator('.sheet-middle > .folio-panel').evaluate_all('(elements)=>elements.map(el=>el.dataset.layoutId).join(",")')
    page.locator('.folio-panel[data-layout-id="ability-scores"] [data-direction="right"]').click()
    assert 'ability-scores' in page.locator('.sheet-right > .folio-panel').evaluate_all('(elements)=>elements.map(el=>el.dataset.layoutId).join(",")')
    page.screenshot(path=str(out/'m15-edit-layout.png'),full_page=True)
    # Cancel must discard, returning the actual default columns.
    page.locator('[data-action=layout-cancel]').click()
    assert page.locator('.sheet-left > .folio-panel[data-layout-id="ability-scores"]').count()==1
    assert page.locator('.layout-panel-tools').count()==0
    # Persist from edit mode and verify after changing tabs.
    page.locator('[data-action=layout-edit]').click()
    page.locator('.folio-panel[data-layout-id="ability-scores"] [data-direction="right"]').click()
    page.locator('.folio-panel[data-layout-id="ability-scores"] [data-direction="right"]').click()
    page.locator('[data-action=layout-save]').click()
    assert page.locator('.sheet-right > .folio-panel[data-layout-id="ability-scores"]').count()==1
    page.locator('[data-action=nav][data-tab=combat]').first.click()
    page.locator('[data-action=nav][data-tab=sheet]').first.click()
    assert page.locator('.sheet-right > .folio-panel[data-layout-id="ability-scores"]').count()==1
    with page.expect_download() as exp:
        page.locator('[data-action=go-library]').click()
        page.locator('[data-action=library-export-all]').click()
    exported=json.loads(Path(exp.value.path()).read_text())
    cols=exported['characters'][0]['stack']['present']['layout']['sheetColumns']
    assert 'ability-scores' in cols[2]
    # A duplicate inherits the layout but becomes independent; restoring default on it shouldn't affect original.
    page.locator('[data-action=library-edit]').first.click()
    page.locator('[data-action=library-duplicate]').click()
    assert page.locator('.library-character').count()==2
    page.locator('.library-character').filter(has=page.get_by_role('heading',name='Pip (copy)',exact=True)).locator('[data-action=library-open]').click()
    assert page.locator('.sheet-right > .folio-panel[data-layout-id="ability-scores"]').count()==1
    page.locator('[data-action=layout-edit]').click()
    page.locator('[data-action=layout-reset]').click()
    assert page.locator('.sheet-left > .folio-panel[data-layout-id="ability-scores"]').count()==1
    page.locator('[data-action=layout-save]').click()
    assert page.locator('.sheet-left > .folio-panel[data-layout-id="ability-scores"]').count()==1
    page.locator('[data-action=go-library]').click()
    page.locator('.library-character').filter(has=page.get_by_role('heading',name='Pip',exact=True)).locator('[data-action=library-open]').click()
    assert page.locator('.sheet-right > .folio-panel[data-layout-id="ability-scores"]').count()==1
    # Pointer drag: drag the Skills card across columns, to the first slot of the left column.
    page.locator('[data-action=layout-edit]').click()
    handle=page.locator('.folio-panel[data-layout-id="skills"] .layout-drag-handle')
    target=page.locator('.sheet-left > .folio-panel').first
    a=handle.bounding_box();b=target.bounding_box()
    page.mouse.move(a['x']+a['width']/2,a['y']+a['height']/2)
    page.mouse.down();page.mouse.move(b['x']+b['width']/2,b['y']+min(40,b['height']*.1),steps=10);page.mouse.up()
    assert page.locator('.sheet-left > .folio-panel[data-layout-id="skills"]').count()==1, 'pointer-drag did not move Skills'
    page.locator('[data-action=layout-save]').click()
    assert page.locator('.sheet-left > .folio-panel[data-layout-id="skills"]').count()==1
    page.set_viewport_size({'width':390,'height':844})
    page.locator('[data-action=layout-edit]').click()
    page.wait_for_timeout(200)
    overflow=page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
    assert overflow<=2,f'mobile overflow {overflow}'
    assert page.locator('.layout-panel-tools').count()==7
    page.screenshot(path=str(out/'m15-mobile.png'),full_page=True)
    assert not errors,errors
    print('M15 browser PASS: fallback emblem, edit arrows, cancel, save, reload, duplicate isolation, reset, pointer drag, mobile')
    browser.close()
