"""M16.1 browser acceptance: catalogue reference pages, formatting and mobile layout."""
from pathlib import Path
import base64, json, re, shutil
from playwright.sync_api import sync_playwright
base=Path(__file__).resolve().parents[1]

def html_for():
    html=(base/'index.html').read_text()
    html=html.replace('<link rel="stylesheet" href="css/style.css">','<style>'+(base/'css/style.css').read_text()+'</style>')
    setup='<script>Object.defineProperty(window,"indexedDB",{configurable:true,value:undefined});const STORE={};Object.defineProperty(window,"localStorage",{configurable:true,value:{getItem:k=>STORE[k]||null,setItem:(k,v)=>STORE[k]=String(v),removeItem:k=>delete STORE[k]}});window.confirm=()=>true;</script>'
    html=html.replace('</head>',setup+'</head>')
    html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(base/m.group(1)).read_text().replace('</script>',r'<\/script>')+'</script>',html)
    for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
        src=base64.b64encode((base/'assets'/name).read_bytes()).decode()
        html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+src)
    return html

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    context=browser.new_context(viewport={'width':1250,'height':900})
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda exc:errors.append(str(exc)))
    page.set_content(html_for(),wait_until='domcontentloaded')
    page.locator('[data-action=library-open]').first.wait_for()
    page.locator('[data-action=library-open]').first.click()
    page.locator('[data-action=nav][data-tab=spellbook]').first.click()
    # A real legacy Pip spell still opens through its old reference path.
    page.locator('[data-action=reference][data-id=bless]').first.click()
    assert page.get_by_role('heading',name='Bless').is_visible()
    assert 'At the table' in page.locator('.reference-dialog').inner_text()
    page.locator('.reference-dialog [data-action=close-modal]').first.click()

    def show_catalogue(name):
        page.evaluate('''name=>{
            document.querySelector('#catalogue-audit-test')?.remove();
            const sp=FolioSpellCatalog.spells.find(x=>x.name===name);
            const st=PipData.newState();
            const d=PipCore.derived(st.character,st.inventory);
            const host=document.createElement('div');host.id='catalogue-audit-test';
            host.innerHTML=PipUI.referenceModal(sp.key,st,d);document.body.appendChild(host);
        }''',name)
    for spell,expected in [('Fireball','Dexterity saving throw'),('Spiritual Weapon','Concentration'),('Prayer of Healing','1 minute'),('Counterspell','Constitution saving throw'),('Wish','Wish')]:
        show_catalogue(spell)
        dialog=page.locator('#catalogue-audit-test .reference-dialog')
        assert dialog.is_visible(),spell
        assert dialog.get_by_text('When to use',exact=True).is_visible(),spell
        assert dialog.get_by_text('Watch out',exact=True).is_visible(),spell
        assert dialog.locator('.spell-source-details[open]').count()==1,spell
        assert expected in dialog.inner_text(),(spell,expected)
        assert len(dialog.locator('.spell-source-body').inner_text())>60,spell
    page.set_viewport_size({'width':390,'height':844})
    show_catalogue('Prismatic Wall')
    dialog=page.locator('#catalogue-audit-test .reference-dialog')
    assert dialog.is_visible()
    assert dialog.evaluate('e=>e.scrollWidth<=e.clientWidth+4')
    dialog.locator('.spell-source-details summary').click()
    assert not dialog.locator('.spell-source-details').evaluate('e=>e.open')
    dialog.locator('.spell-source-details summary').click()
    assert dialog.locator('.spell-source-details').evaluate('e=>e.open')
    assert not errors,errors
    browser.close()
print('PASS: M16.1 all-spell-reference UI, 2024 distinctions, source expansion, 390px layout')
