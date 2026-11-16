"""M18.27: Source labels, scoped builder, progressive filters, custom-spell menu, damage dialog and mobile."""
from pathlib import Path
import base64,re,shutil
from playwright.sync_api import sync_playwright
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text('utf8').replace('<link rel="stylesheet" href="css/style.css">','<style>'+(BASE/'css/style.css').read_text('utf8')+'</style>')
html=html.replace('</head>', '''<script>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});const STORE={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>STORE[k]||null,setItem:(k,v)=>STORE[k]=String(v),removeItem:k=>delete STORE[k]}});window.confirm=()=>true;</script></head>''')
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(BASE/m.group(1)).read_text('utf8').replace('</script>',r'<\/script>')+'</script>',html)
for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
 html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+base64.b64encode((BASE/'assets'/name).read_bytes()).decode())
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1180,'height':850});page.set_default_timeout(15000)
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(html,wait_until='domcontentloaded')
 assert page.evaluate("window.FolioSources.displayName('srd-2024','SRD 5.2.1')")=='PHB 24'
 assert page.evaluate("window.FolioSources.displayName('phb-2024','Player’s Handbook (2024)')")=='PHB 24'
 assert page.evaluate("window.FolioSources.SOURCE_PACKS.filter(s=>['srd-2024','phb-2024'].includes(s.id)).every(s=>s.name==='PHB 24')")
 # Included SRD and optional handbook reference are distinct internally but presented as one source title.
 page.locator('[data-action=library-rules]').first.click()
 assert page.locator('#library-rules-global input[value=srd-2024]').count()==0 # bundled rule data is summarized, not duplicated as a source row
 assert page.locator('#library-rules-global input[value=phb-2024]').count()==1
 assert 'Pip’s personal list' not in page.locator('.library-dialog').inner_text()
 page.locator('.library-dialog .close-modal').click()
 # The initial class selection must not leak subclass choices from other classes.
 page.locator('[data-action=library-new-character]').first.click()
 form=page.locator('#library-character-create');sc=form.locator('select[name=subclassId]')
 assert sc.locator('option').count()==1,sc.all_inner_texts()
 form.locator('select[name=classId]').select_option('class:fighter')
 fighter=sc.locator('option').all_inner_texts();assert any('Champion' in x for x in fighter),fighter
 assert not any('Abjurer' in x for x in fighter),fighter
 form.locator('select[name=classId]').select_option('class:wizard')
 wizard=sc.locator('option').all_inner_texts();assert any('Abjurer' in x for x in wizard),wizard
 assert not any('Champion' in x for x in wizard),wizard
 form.locator('input[name=name]').fill('Polish QA')
 form.locator('input[name=level]').fill('5')
 sc.select_option('subclass:abjurer')
 form.locator('button[type=submit]').click()
 page.locator('.library-character').filter(has_text='Polish QA').locator('[data-action=library-open]').first.click()
 assert page.locator('#damage-type').count()==0
 starting=int(page.locator('.hp-current').inner_text())
 page.locator('#hp-amount').fill('6')
 page.locator('[data-action=damage]').first.click()
 assert page.locator('#damage-type').is_visible()
 assert page.locator('#damage-resistant').is_visible()
 page.locator('#damage-type').select_option('Fire')
 page.locator('#damage-resistant').check()
 page.locator('[data-action=damage-apply]').click()
 assert int(page.locator('.hp-current').inner_text())==starting-3
 assert page.locator('#damage-type').count()==0
 page.locator('[data-action=nav][data-tab=spellbook]').first.click()
 assert page.locator('.spell-filters').count()==0
 toggle=page.locator('[data-action=spell-filters-toggle]')
 assert toggle.get_attribute('aria-expanded')=='false'
 toggle.click();assert page.locator('#spell-search').is_visible()
 assert page.locator('[data-action=spell-grouping][data-id=purpose]').count()==1
 toggle.click();assert page.locator('#spell-search').count()==0
 menu=page.locator('details.custom-spell-menu')
 assert menu.count()==1
 assert not page.locator('[data-action=homebrew-spell-open]').is_visible()
 menu.locator('summary').click()
 assert page.locator('[data-action=homebrew-spell-open]').is_visible()
 assert page.locator('[data-action=open-custom]').is_visible()
 page.locator('[data-action=open-custom]').click()
 assert page.locator('.modal-scrim').count()>0
 page.locator('[data-action=close-modal]').last.click()
 # Return to default character; 'Pip's personal list' should not be a book/source filter.
 page.locator('[data-action=go-library]').first.click()
 page.locator('.library-character').filter(has_text='Pip').locator('[data-action=library-open]').first.click()
 page.locator('[data-action=nav][data-tab=spellbook]').first.click()
 page.locator('[data-action=spell-filters-toggle]').first.click()
 src_opts=page.locator('[data-change=spell-filter][data-key=source] option').all_inner_texts()
 assert 'Pip’s personal list' not in ' '.join(src_opts),src_opts
 assert 'Prepared Paladin' in src_opts,src_opts # preparation groups are not publication sources
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+2'),'Spellbook mobile overflow'
 page.locator('[data-action=nav][data-tab=sheet]').first.evaluate('(el)=>el.click()')
 page.locator('[data-action=damage]').first.click()
 assert page.locator('#damage-type').is_visible()
 assert page.locator('.damage-dialog').evaluate('el=>el.scrollWidth<=el.clientWidth+4'),'Damage popup mobile overflow'
 assert not errors,errors
 browser.close()
print('PASS: M18.27 source alias/Pip provenance, scoped builder, damage popup, progressive filters, custom-spell menu, mobile')
