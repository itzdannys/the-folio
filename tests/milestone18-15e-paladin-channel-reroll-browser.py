"""Fully offline browser regression for Paladin Divine Sense, Abjure Foes and Glory rerolls."""
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
 page=browser.new_page(viewport={'width':1180,'height':850});page.set_default_timeout(14000)
 errors=[];page.on('pageerror',lambda er:errors.append(str(er)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('window.FolioDice.rollDie=side=>side===20?9:4')
 def create(name,subclass,level):
  page.locator('[data-action=library-new-character]').first.click()
  form=page.locator('#library-character-create')
  form.locator('[name=name]').fill(name)
  form.locator('[name=classId]').select_option('class:paladin')
  form.locator('[name=level]').fill(str(level))
  form.locator('[name=subclassId]').select_option('subclass:'+subclass)
  form.locator('button[type=submit]').click()
  assert not form.count(),page.locator('body').inner_text()[-1000:]
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def library():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 # Shared CD: Divine Sense at level 3. Current state survives library navigation.
 create('Sense Guard','oath-of-devotion',3)
 assert page.locator('[data-action=paladin-divine-sense]').is_visible()
 assert page.locator('[data-action=paladin-abjure]').count()==0
 page.locator('[data-action=paladin-divine-sense]').click()
 assert 'Divine Sense activated' in page.locator('body').inner_text()
 assert page.locator('[data-action=paladin-divine-sense-end]').is_enabled()
 library();reopen('Sense Guard')
 assert page.locator('[data-action=paladin-divine-sense-end]').is_enabled()
 page.locator('[data-action=paladin-divine-sense-end]').click()
 assert 'Divine Sense ended' in page.locator('body').inner_text()
 library()
 # Base level 9: resolved enemy saves, one resource used and no duplicate names.
 create('Abjure Guard','oath-of-the-ancients',9)
 assert page.locator('[data-action=paladin-abjure]').is_visible()
 page.locator('#paladin-abjure-targets').fill('Wight: 7')
 page.locator('#paladin-abjure-confirm').check()
 page.locator('[data-action=paladin-abjure]').click()
 assert 'Abjure Foes' in page.locator('body').inner_text()
 assert '1 failed Wisdom saves' in page.locator('body').inner_text()
 library();reopen('Abjure Guard')
 assert 'Abjure Foes' in page.locator('body').inner_text()
 library()
 # Glory level 20 saving throw: reaction roll records result and survives reopen.
 create('Legend Guard','oath-of-glory',20)
 assert page.locator('[data-action=glory-save-reroll]').is_disabled()
 page.locator('[data-action=paladin-capstone]').click()
 assert page.locator('[data-action=glory-save-reroll]').is_enabled()
 page.locator('#glory-reroll-ability').select_option('wis')
 page.locator('#glory-reroll-total').fill('8')
 page.locator('#glory-reroll-dc').fill('18')
 page.locator('[data-action=glory-save-reroll]').click()
 assert 'Living Legend saving throw reroll' in page.locator('body').inner_text()
 assert page.locator('[data-action=glory-save-reroll]').is_disabled()
 library();reopen('Legend Guard')
 assert page.locator('[data-action=glory-save-reroll]').is_disabled()
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'),'Mobile horizontal overflow'
 assert not errors,errors
 browser.close()
print('PASS: Divine Sense, Abjure Foes, Living Legend reroll, save/reopen and mobile')
