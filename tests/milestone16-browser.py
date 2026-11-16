"""M16 offline Chromium regression: grouping, file, tags, sets, persistence and mobile."""
from pathlib import Path
import base64,json,re,shutil
from playwright.sync_api import sync_playwright
base=Path(__file__).resolve().parents[1]

def html_for(saved=None):
    html=(base/'index.html').read_text()
    html=html.replace('<link rel="stylesheet" href="css/style.css">','<style>'+(base/'css/style.css').read_text()+'</style>')
    setup='<script>Object.defineProperty(window,"indexedDB",{configurable:true,value:undefined});const STORE='+json.dumps(saved or {})+';Object.defineProperty(window,"localStorage",{configurable:true,value:{getItem:k=>STORE[k]||null,setItem:(k,v)=>STORE[k]=String(v),removeItem:k=>delete STORE[k]}});window.confirm=()=>true;</script>'
    html=html.replace('</head>',setup+'</head>')
    html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(base/m.group(1)).read_text().replace('</script>',r'<\/script>')+'</script>',html)
    for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
        src=base64.b64encode((base/'assets'/name).read_bytes()).decode()
        html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+src)
    return html

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    context=browser.new_context(viewport={'width':1280,'height':900})
    errors=[]
    def open_page(saved=None):
        page=context.new_page();page.set_default_timeout(14000)
        page.on('pageerror',lambda err:errors.append(str(err)))
        page.set_content(html_for(saved),wait_until='domcontentloaded')
        page.locator('[data-action=library-open]').first.wait_for()
        page.locator('[data-action=library-open]').first.click()
        page.locator('[data-action=nav][data-tab=spellbook]').first.click()
        return page
    page=open_page()
    assert page.get_by_role('heading',name='Spellbook').is_visible()
    assert 'Prepared Paladin' in page.locator('main').inner_text()
    assert page.locator('.spell-group').count()>=4
    # M13 panel collapse still wraps all dynamically rendered M16 groups.
    group=page.locator('.spell-group').first
    toggle=group.locator('.panel-collapse-toggle')
    toggle.click()
    assert 'is-collapsed' in group.get_attribute('class')
    assert not group.locator('.spell-book-row').first.is_visible()
    toggle.click()
    assert 'is-collapsed' not in group.get_attribute('class')
    # Create folder and custom label, then file Bless in both.
    page.locator('[data-action=spell-collections]').first.click()
    page.locator('#spell-folder-name').fill('Battle')
    page.locator('[data-action=spell-collection-add][data-kind=folders]').click()
    page.locator('#spell-category-name').fill('Boss-fight')
    page.locator('[data-action=spell-collection-add][data-kind=categories]').click()
    page.locator('.spell-collection-manage').get_by_text('Battle').wait_for()
    page.locator('[data-action=close-modal]').last.click()
    page.locator('[data-action=spell-organize][data-id=bless]').click()
    folder_id=page.locator('form#spell-organize-form select[name=folder] option').last.get_attribute('value')
    page.locator('form#spell-organize-form select[name=folder]').select_option(folder_id)
    page.locator('form#spell-organize-form [name=purposes][value=Social]').check()
    page.locator('form#spell-organize-form [name=categories]').first.check()
    page.locator('form#spell-organize-form [type=submit]').click()
    assert not page.locator('form#spell-organize-form').count()
    page.locator('[data-action=spell-filters-toggle]').click()
    page.locator('[data-action=spell-grouping][data-id=purpose]').click()
    social=page.locator('.spell-group').filter(has=page.locator('.panel-title',has_text='Social'))
    assert social.get_by_text('Bless').count()>0
    tagged=page.locator('.spell-group').filter(has=page.locator('.panel-title',has_text='Boss-fight'))
    assert tagged.get_by_text('Bless').count()>0
    page.locator('[data-action=spell-grouping][data-id=folders]').click()
    battle=page.locator('.spell-group').filter(has=page.locator('.panel-title',has_text='Battle'))
    assert battle.get_by_text('Bless').count()>0
    # Filters do not affect preparation.
    initial=page.evaluate('JSON.parse(JSON.stringify(STORE))')
    page.locator('[data-change=spell-filter][data-key=level]').select_option('1')
    assert page.locator('.spell-book-row').count()>0
    page.locator('[data-change=spell-filter][data-key=level]').select_option('')
    page.locator('[data-action=spell-grouping][data-id=sets]').click()
    page.locator('#spell-set-name').fill('Travel spells')
    page.locator('[data-action=spell-set-save]').click()
    assert page.locator('.spell-group').count()>0
    # Elementalism reference contains all five modes.
    page.locator('[data-action=spell-grouping][data-id=source]').click()
    page.locator('[data-action=reference][data-id=elementalism]').click()
    for label in ('Beckon Air','Beckon Earth','Beckon Fire','Beckon Water','Sculpt Element'):
        assert page.locator('.elementalism-modes').get_by_text(label).count()>0,label
    page.locator('[data-action=close-modal]').last.click()
    saved=page.evaluate('JSON.parse(JSON.stringify(STORE))')
    assert saved!=initial
    page.close()
    page=open_page(saved)
    page.locator('[data-action=spell-filters-toggle]').click()
    page.locator('[data-action=spell-grouping][data-id=purpose]').click()
    assert page.locator('.spell-group').filter(has=page.locator('.panel-title',has_text='Boss-fight')).get_by_text('Bless').count()>0
    page.locator('[data-action=spell-grouping][data-id=sets]').click()
    assert page.get_by_text('Travel spells').count()>0
    page.set_viewport_size({'width':390,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'),'390px horizontal overflow in spellbook'
    assert not errors,errors
    (base/'test-output').mkdir(exist_ok=True)
    page.screenshot(path=str(base/'test-output/milestone16-spellbook-mobile.png'),full_page=True)
    print('PASS: M16 source/purpose/folders/sets; tags, saved collections, collapse, Elementalism, reload and 390px')
    browser.close()
