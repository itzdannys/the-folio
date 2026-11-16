"""Offline Chromium check for opt-in Paladin Action/Bonus Action and spell tracking."""
from pathlib import Path
import re, base64, shutil
from playwright.sync_api import sync_playwright
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text('utf8').replace('<link rel="stylesheet" href="css/style.css">','<style>'+(BASE/'css/style.css').read_text('utf8')+'</style>')
html=html.replace('</head>', '''<script>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});const DATA={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>DATA[k]||null,setItem:(k,v)=>DATA[k]=String(v),removeItem:k=>delete DATA[k]}});window.confirm=()=>true;</script></head>''')
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(BASE/m.group(1)).read_text('utf8').replace('</script>',r'<\/script>')+'</script>',html)
for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
 html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+base64.b64encode((BASE/'assets'/name).read_bytes()).decode())
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1170,'height':850});page.set_default_timeout(13000)
 errors=[];page.on('pageerror',lambda er:errors.append(str(er)))
 page.set_content(html,wait_until='domcontentloaded')
 page.locator('[data-action=library-new-character]').first.click()
 form=page.locator('#library-character-create')
 form.locator('[name=name]').fill('Turn Tracker Guard')
 form.locator('[name=classId]').select_option('class:paladin')
 form.locator('[name=level]').fill('11')
 form.locator('[name=subclassId]').select_option('subclass:oath-of-devotion')
 form.locator('button[type=submit]').click()
 page.locator('.library-character').filter(has_text='Turn Tracker Guard').locator('[data-action=library-open]').first.click()
 assert 'Paladin turn tracker · not started' in page.locator('body').inner_text()
 page.locator('[data-action=paladin-start-turn]').click()
 assert 'Paladin turn tracker · active' in page.locator('body').inner_text()
 page.locator('[data-action=paladin-divine-sense]').click()
 assert 'Bonus Action: spent' in page.locator('body').inner_text()
 page.locator('#paladin-touch-healing').fill('5')
 page.locator('[data-action=paladin-touch-self]').click()
 assert 'Bonus Action has already been used' in page.locator('body').inner_text()
 # Still able to take Magic action on the same turn.
 page.locator('#paladin-abjure-targets').fill('Wight: 9')
 page.locator('#paladin-abjure-confirm').check()
 page.locator('[data-action=paladin-abjure]').click()
 assert 'Action: spent' in page.locator('body').inner_text()
 # Save/reopen retains budget in local snapshot.
 page.locator('[data-action=go-library]').first.click()
 page.locator('.library-character').filter(has_text='Turn Tracker Guard').locator('[data-action=library-open]').first.click()
 assert 'Bonus Action: spent' in page.locator('body').inner_text()
 assert 'Action: spent' in page.locator('body').inner_text()
 page.locator('[data-action=paladin-start-turn]').click()
 assert 'Bonus Action: ready' in page.locator('body').inner_text()
 page.locator('#paladin-touch-healing').fill('5')
 page.locator('[data-action=paladin-touch-self]').click()
 assert 'Lay On Hands / Restoring Touch applied' in page.locator('body').inner_text()
 # Verify actual spellbook cast-form path obeys the same tracked turn budget.
 page.locator('[data-action=paladin-start-turn]').click()
 page.locator('[data-action=nav][data-tab=spellbook]').first.click()
 page.locator('.spell-book-row').filter(has_text='Aid').locator('.small-cast').first.click()
 page.locator('#cast-cost').select_option('slot2')
 page.locator('#cast-form button[type=submit]').click()
 assert page.locator('#cast-form').count()==0
 page.locator('[data-action=nav][data-tab=sheet]').first.click()
 assert 'Action: spent' in page.locator('body').inner_text()
 assert 'Spell slot cast this turn: yes' in page.locator('body').inner_text()
 page.locator('[data-action=nav][data-tab=spellbook]').first.click()
 page.locator('.spell-book-row').filter(has_text='Shield of Faith').locator('.small-cast').first.click()
 page.locator('#cast-cost').select_option('slot1')
 page.locator('#cast-form button[type=submit]').click()
 assert 'one spell slot' in page.locator('body').inner_text()
 assert page.locator('#cast-form').count()==1 # rejected without silently spending another spell slot
 page.locator('.modal-scrim [data-action=close-modal]').last.click()
 page.locator('[data-action=nav][data-tab=sheet]').first.click()
 page.locator('[data-action=paladin-start-turn]').click()
 assert 'Action: ready' in page.locator('body').inner_text()
 assert 'Spell slot cast this turn: no' in page.locator('body').inner_text()
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'), 'Mobile horizontal overflow'
 assert not errors,errors
 browser.close()
print('PASS: Paladin action/bonus tracking UI, blocked duplicate, save/reopen, mobile')
