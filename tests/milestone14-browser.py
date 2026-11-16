"""M14 real-browser check of portrait, emblem, token editing, saving, exports and character switching."""
from pathlib import Path
import shutil, re, base64
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
base=Path(__file__).resolve().parents[1]
(base/'test-output').mkdir(exist_ok=True)
fixture=base/'test-output'/'_artwork_fixture.png'
im=Image.new('RGB',(560,760),'#344b66');d=ImageDraw.Draw(im)
d.ellipse((80,135,480,550),fill='#e4a77b');d.ellipse((150,235,205,283),fill='#273244');d.ellipse((335,235,390,283),fill='#273244')
d.arc((180,320,370,440),0,180,fill='#5e3140',width=14)
d.polygon([(85,210),(280,15),(475,210)],fill='#d8c497');im.save(fixture)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    context=browser.new_context(viewport={'width':1380,'height':900},accept_downloads=True)
    page=context.new_page();errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    html=(base/'index.html').read_text()
    html=html.replace('<link rel="stylesheet" href="css/style.css">','<style>'+(base/'css/style.css').read_text()+'</style>')
    setup="""<script>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});
const STORE={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>STORE[k]||null,setItem:(k,v)=>STORE[k]=String(v),removeItem:k=>delete STORE[k]}});window.confirm=()=>true;</script>"""
    html=html.replace('</head>',setup+'</head>')
    def inject(m): return '<script>'+ (base/m.group(1)).read_text().replace('</script>',r'<\/script>') + '</script>'
    html=re.sub(r'<script src="([^"]+)"></script>',inject,html)
    for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
       data=base64.b64encode((base/'assets'/name).read_bytes()).decode()
       html=html.replace('assets/'+name, 'data:image/svg+xml;base64,'+data)
    page.set_content(html,wait_until='domcontentloaded')
    page.locator('[data-action="library-open"]').first.wait_for(timeout=12000)
    page.locator('[data-action="library-open"]').first.click()
    assert page.locator('.bookplate').get_attribute('src').startswith('data:image/svg+xml;base64,')
    page.locator('.folio-options-menu summary').click();page.locator('[data-action=open-artwork]').click()
    assert page.locator('#artwork-token-canvas').is_visible()
    assert page.locator('.artwork-emblem img').get_attribute('src').startswith('data:image/svg+xml;base64,')
    page.locator('#artwork-portrait-file').set_input_files(str(fixture))
    page.locator('.artwork-portrait img').wait_for(timeout=10000)
    assert page.locator('.artwork-portrait img').get_attribute('src').startswith('data:image/webp;base64,')
    page.locator('#artwork-emblem-file').set_input_files(str(fixture))
    page.locator('.artwork-emblem img[src^="data:image/"]').wait_for(timeout=10000)
    page.locator('#artwork-ring-color').fill('#6688aa')
    page.locator('#artwork-zoom').fill('1.45')
    page.locator('#artwork-token-source').select_option('portrait')
    page.locator('#artwork-token-shape').select_option('rounded')
    page.locator('#artwork-x').fill('28')
    page.locator('#artwork-y').fill('-20')
    assert '145%' in page.locator('#artwork-zoom-value').inner_text()
    page.screenshot(path=str(base/'test-output'/'m14-studio.png'),full_page=True)
    with page.expect_download() as download_info:
       page.locator('[data-action=artwork-download-token]').click()
    download=download_info.value
    assert download.suggested_filename.endswith('-token.png')
    page.locator('[data-action=artwork-save]').click()
    page.locator('.artwork-studio').wait_for(state='detached',timeout=15000)
    assert page.locator('.bookplate').get_attribute('src').startswith('data:image/webp;base64,')
    page.locator('[data-action=go-library]').click()
    page.locator('.library-card-portrait').wait_for()
    page.screenshot(path=str(base/'test-output'/'m14-library.png'),full_page=True)
    with page.expect_download() as export_info:
       page.locator('[data-action=library-export-all]').click()
    export_file=export_info.value.path()
    import json
    exported=json.loads(Path(export_file).read_text())
    art=exported['characters'][0]['artwork'];assert art['portrait'].startswith('data:image/webp;base64,')
    assert art['emblem'].startswith('data:image/webp;base64,')
    assert art['tokenImage'].startswith('data:image/webp;base64,')
    assert art['token']['ringColor']=='#6688aa'
    assert art['token']['shape']=='rounded'
    assert len(exported['characters'][0]['stack']['past'])<51
    # Duplicating a character preserves its artwork, with a separate library record.
    page.locator('[data-action=library-edit]').first.click()
    page.locator('[data-action=library-duplicate]').click()
    assert page.locator('.library-character').count()==2
    assert page.locator('.library-card-portrait').count()==2
    page.locator('.library-character').filter(has=page.get_by_role('heading',name='Pip (copy)',exact=True)).locator('[data-action=library-open]').click()
    assert page.locator('.bookplate').get_attribute('src').startswith('data:image/webp;base64,')
    page.locator('.folio-options-menu summary').click();page.locator('[data-action=open-artwork]').click()
    page.locator('[data-action=artwork-remove-emblem]').click()
    page.locator('[data-action=artwork-save]').click()
    page.locator('.artwork-studio').wait_for(state='detached',timeout=15000)
    assert page.locator('.bookplate').get_attribute('src').startswith('data:image/svg+xml;base64,')
    page.locator('[data-action=go-library]').click()
    page.locator('.library-character').filter(has=page.get_by_role('heading',name='Pip',exact=True)).locator('[data-action=library-open]').click()
    # the original retains its custom icon
    assert page.locator('.bookplate').get_attribute('src').startswith('data:image/webp;base64,')
    page.set_viewport_size({'width':390,'height':844})
    page.locator('.folio-options-menu summary').click();page.locator('[data-action=open-artwork]').click()
    assert page.locator('#artwork-token-canvas').is_visible()
    page.wait_for_timeout(150)
    overflow=page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
    assert overflow <= 2, f'Artwork studio causes horizontal overflow at mobile width: {overflow}px'
    print('M14 browser PASS: portrait + emblem upload, token settings, PNG download, local save, library preview, backup export, switch characters')
    assert not errors,errors
    browser.close()
fixture.unlink(missing_ok=True)
