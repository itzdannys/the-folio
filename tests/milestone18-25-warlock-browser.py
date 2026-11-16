"""2024 Warlock: four patrons, in-app Invocation/Spellbook controls, persistence, mobile layout."""
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
 page=browser.new_page(viewport={'width':1180,'height':850});page.set_default_timeout(14000)
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('window.FolioDice.rollDie = sides => sides === 20 ? 17 : sides === 100 ? 85 : sides >= 8 ? 6 : 3')
 def create(name,subclass,level):
  page.locator('[data-action=library-new-character]').first.click();f=page.locator('#library-character-create')
  f.locator('[name=name]').fill(name);f.locator('[name=classId]').select_option('class:warlock');f.locator('[name=level]').fill(str(level));f.locator('[name=subclassId]').select_option('subclass:'+subclass)
  f.locator('button[type=submit]').click();assert not f.count(),name+' failed to create'
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def library():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def click(kind):page.locator(f'[data-action=warlock-2024][data-kind="{kind}"]').first.click()
 def effect(fragment):
  output=page.locator('#warlock-2024-panel').inner_text();assert fragment in output,f'Missing {fragment}: {output[-700:]}'
 def confirm():page.locator('#war-25-confirmed').check()
 def target(who='Confirmed target'):page.locator('#war-25-target').fill(who)
 # All four patrons real in builder and character sheet.
 create('Fey Warlock QA','archfey-patron',14)
 assert page.locator('#warlock-2024-panel').count()==1
 effect('Archfey Patron');click('turn');click('fey-step');effect('Steps of the Fey')
 library();reopen('Fey Warlock QA');effect('Steps of the Fey')
 page.locator('[data-action=long-rest]').first.click()
 # Spellbook: always-prepared Misty Step with free casting.
 page.locator('[data-action=nav][data-tab=spellbook]:visible').first.click()
 page.locator('.spell-book-row').filter(has_text='Misty Step').first.locator('[data-action=open-cast]').click()
 cast=page.locator('#cast-form');assert cast.is_visible()
 assert cast.locator('[name=cost] option[value=warlock-fey-step]').count()==1
 cast.locator('[name=cost]').select_option('warlock-fey-step');cast.locator('button[type=submit]').click()
 assert not cast.count(),'Archfey free casting failed'
 library();create('Celestial Warlock QA','celestial-patron',14)
 click('turn');confirm();target('Self');page.locator('#war-25-value').fill('2');click('heal');effect('Healing Light')
 library();reopen('Celestial Warlock QA');effect('Healing Light')
 library();create('Fiend Warlock QA','fiend-patron',14)
 click('turn');confirm();target('DM-confirmed enemy');click('hurl');effect('Hurl through Hell')
 library();reopen('Fiend Warlock QA');effect('Hurl through Hell')
 library();create('Great Old One Warlock QA','great-old-one-patron',14)
 click('turn');confirm();target('Friendly witness');click('mind');effect('Awakened Mind')
 click('clairvoyant');effect('Clairvoyant Combat')
 library();reopen('Great Old One Warlock QA');effect('Clairvoyant Combat')
 # Save genuine Invocation choices (level 14 has 8) in active sheet controls.
 options=['Pact of the Blade','Pact of the Tome','Eldritch Mind','Armor of Shadows','Fiendish Vigor','Devil’s Sight','Otherworldly Leap','Misty Visions']
 for i,name in enumerate(options):page.locator('#war-25-inv-'+str(i)).select_option(name)
 click('invocations-save');effect('Eldritch Invocations')
 assert page.locator('[data-action=warlock-2024][data-kind=pact]').count()==1
 click('turn');page.locator('#war-25-weapon').fill('Longsword');click('pact');effect('Pact of the Blade')
 click('turn');target('Known AC dummy');confirm();click('attack');effect('Pact weapon attack')
 library();reopen('Great Old One Warlock QA');effect('Pact weapon attack')
 # Selected Invocation persists; no rewrite of existing class data.
 assert page.locator('#war-25-inv-0').input_value()=='Pact of the Blade'
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+2'),'Warlock mobile horizontal overflow'
 assert not errors,errors
 browser.close()
print('PASS: Warlock all 4 patrons, Spellbook free cast, Invocation selection, Pact attack, persistence, mobile')
