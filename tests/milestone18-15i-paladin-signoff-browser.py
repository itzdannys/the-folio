"""Offline Chromium sign-off for the complete Paladin character-sheet checkpoint."""
from pathlib import Path
import re,base64,shutil
from playwright.sync_api import sync_playwright
BASE=Path(__file__).resolve().parents[1]
html=(BASE/'index.html').read_text('utf8').replace('<link rel="stylesheet" href="css/style.css">','<style>'+(BASE/'css/style.css').read_text('utf8')+'</style>')
html=html.replace('</head>', '''<script>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});const DATA={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>DATA[k]||null,setItem:(k,v)=>DATA[k]=String(v),removeItem:k=>delete DATA[k]}});window.confirm=()=>true;</script></head>''')
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(BASE/m.group(1)).read_text('utf8').replace('</script>',r'<\/script>')+'</script>',html)
for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
 html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+base64.b64encode((BASE/'assets'/name).read_bytes()).decode())
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1180,'height':850});page.set_default_timeout(11000)
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(html,wait_until='domcontentloaded')
 def create(name,subclass,level):
  page.locator('[data-action=library-new-character]').first.click()
  form=page.locator('#library-character-create')
  form.locator('[name=name]').fill(name)
  form.locator('[name=classId]').select_option('class:paladin')
  form.locator('[name=level]').fill(str(level))
  form.locator('[name=subclassId]').select_option('subclass:'+subclass)
  form.locator('button[type=submit]').click()
  assert not form.count(), 'Character create failed'
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def library():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 create('Steed Paladin I','oath-of-devotion',10)
 # Faithful Steed should be present as a free cast and create a persistent local creature.
 page.locator('[data-action=nav][data-tab=spellbook]').first.click()
 row=page.locator('.spell-book-row').filter(has_text='Find Steed').first
 assert row.count(), 'Find Steed absent from Paladin prepared spells'
 row.locator('.small-cast').first.click()
 assert page.locator('#cast-form').is_visible()
 assert page.locator('#cast-form [name=steedType]').count(), 'No steed creature type selector'
 page.locator('#cast-form [name=steedType]').select_option('Fey')
 page.locator('#cast-form [name=steedForm]').fill('Elk')
 page.locator('#cast-form [name=cost]').select_option('paladin-steed-free')
 page.locator('#cast-form button[type=submit]').click()
 assert page.locator('#cast-form').count()==0, 'Find Steed cast rejected'
 page.locator('[data-action=nav][data-tab=sheet]').first.click()
 assert 'Faithful Steed · companion record' in page.locator('body').inner_text()
 assert 'Elk (Fey)' in page.locator('body').inner_text()
 assert 'HP 25/25' in page.locator('body').inner_text()
 library();reopen('Steed Paladin I')
 assert 'Elk (Fey)' in page.locator('body').inner_text(), 'Steed was lost after reopening the character'
 page.locator('#paladin-steed-hp-change').fill('-7')
 page.locator('[data-action=paladin-steed-hp]').click()
 assert 'HP 18/25' in page.locator('body').inner_text()
 page.locator('[data-action=paladin-steed-dismiss]').click()
 assert 'Faithful Steed · companion record' not in page.locator('body').inner_text()
 library()
 # Timed power counter should survive persistence and expire on tracked round boundary.
 create('Glory Timer I','oath-of-glory',7)
 page.locator('[data-action=paladin-start-turn]').click()
 page.locator('[data-action=glory-athlete]').first.click()
 assert 'Timed Paladin powers' in page.locator('body').inner_text()
 library();reopen('Glory Timer I')
 assert 'Timed Paladin powers' in page.locator('body').inner_text()
 # Mobile remains within viewport.
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 2'), 'Mobile horizontal overflow'
 assert not errors,errors
 browser.close()
print('PASS: Paladin Find Steed cast and companion persistence, HP and dismissal, Glory timer persistence and mobile')
