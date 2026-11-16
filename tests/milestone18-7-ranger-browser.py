"""Integrated Ranger 18.7: character creation, Hunter's Mark, attacks, recovery and persistence."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re,base64,shutil
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text('utf8').replace('<link rel="stylesheet" href="css/style.css">','<style>'+(BASE/'css/style.css').read_text()+'</style>')
html=html.replace('</head>', '''<script>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});const STORE={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>STORE[k]||null,setItem:(k,v)=>STORE[k]=String(v),removeItem:k=>delete STORE[k]}});window.confirm=()=>true;</script></head>''')
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(BASE/m.group(1)).read_text().replace('</script>',r'<\/script>')+'</script>',html)
for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
 html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+base64.b64encode((BASE/'assets'/name).read_bytes()).decode())
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1180,'height':850});page.set_default_timeout(7000);errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 page.locator('[data-action=library-new-character]').first.click()
 form=page.locator('#library-character-create')
 form.locator('[name=name]').fill('Ranger Rules Tester')
 form.locator('[name=classId]').select_option('class:ranger')
 form.locator('[name=level]').fill('20')
 form.locator('[type=submit]').click()
 page.locator('.library-character').filter(has_text='Ranger Rules Tester').locator('[data-action=library-open]').click()
 assert page.locator('#ranger-mark-target').is_visible()
 page.locator('#ranger-mark-target').fill('Troll King')
 page.locator('[data-action=ranger-cast-mark][data-mode=free]').click()
 assert 'Troll King' in page.locator('body').inner_text()
 assert page.locator('[data-action=ranger-end-mark]').is_visible()
 # Add a weapon and hit a marked target to exercise critical integration.
 page.locator('[data-action=nav][data-tab=inventory]:visible').first.click()
 page.locator('[data-action=weapon-catalog-open]').click()
 page.locator('[data-action=weapon-catalog-add][data-id=shortsword]').first.click()
 page.locator('[data-action=close-modal]').last.click()
 page.locator('.ledger-item').filter(has_text='Shortsword').locator('[data-action=item-equip]').first.click()
 page.locator('.ledger-item').filter(has_text='Shortsword').locator('[data-action=weapon-attack]').first.click()
 m=page.locator('#weapon-attack-form');assert m.locator('[name=markedTarget]').is_visible()
 m.locator('[name=markedTarget]').check();m.locator('[name=targetAC]').fill('10')
 page.evaluate('window.FolioDice.rollDie=sides=>sides===20?15:sides===10?7:3')
 m.locator('button[type=submit]').click()
 assert 'Hunter’s Mark +7 Force' in page.locator('body').inner_text(),page.locator('body').inner_text()[-1500:]
 # Save/reopen must preserve marked target and free casts remaining.
 page.locator('[data-action=go-library]').first.click()
 page.locator('.library-character').filter(has_text='Ranger Rules Tester').locator('[data-action=library-open]').click()
 assert page.locator('[data-action=ranger-end-mark]').is_visible()
 assert 'Troll King' in page.locator('body').inner_text()
 page.locator('[data-action=ranger-tireless]').click()
 page.locator('[data-action=ranger-veil]').click()
 assert page.locator('[data-action=ranger-veil]').inner_text()=='End Nature’s Veil'
 page.locator('[data-action=ranger-end-mark]').click()
 assert page.locator('#ranger-mark-target').is_visible()
 page.set_viewport_size({'width':390,'height':844})
 assert page.locator('[data-action=ranger-cast-mark][data-mode=free]').is_visible()
 assert not page.locator('.builder-slot-card').first.evaluate('(x)=>x.scrollWidth>x.clientWidth+14')
 (BASE/'test-output').mkdir(exist_ok=True)
 page.screenshot(path=str(BASE/'test-output/milestone18-7-ranger-mobile.png'),full_page=True)
 assert not errors,errors
 # Separate newly-created Ranger uses Spellbook for a free cast without selecting the spell.
 new=browser.new_page(viewport={'width':1180,'height':850});new.set_default_timeout(7000);err=[]
 new.on('pageerror',lambda e:err.append(str(e)));new.set_content(html,wait_until='domcontentloaded')
 new.locator('[data-action=library-new-character]').first.click()
 f=new.locator('#library-character-create');f.locator('[name=name]').fill('Spellbook Ranger');f.locator('[name=classId]').select_option('class:ranger');f.locator('[name=level]').fill('5');f.locator('[type=submit]').click()
 new.locator('.library-character').filter(has_text='Spellbook Ranger').locator('[data-action=library-open]').click()
 new.locator('[data-action=nav][data-tab=spellbook]:visible').first.click()
 assert 'Hunter' in new.locator('body').inner_text()
 marked=new.locator('.spell-book-row').filter(has_text="Hunter's Mark");assert marked.count()>0
 marked.first.locator('[data-action=open-cast]').click()
 cast=new.locator('#cast-form');cast.locator('[name=cost]').select_option('ranger-free');cast.locator('[name=markTarget]').fill('Dire Wolf')
 cast.locator('button[type=submit]').click()
 new.locator('[data-action=nav][data-tab=sheet]:visible').first.click()
 assert new.locator('[data-action=ranger-end-mark]').is_visible()
 assert 'Dire Wolf' in new.locator('body').inner_text()
 assert not err,err
 new.close();browser.close()
print('PASS: Ranger class controls, marked-target weapon damage, save/reopen, mobile, Spellbook free cast')
