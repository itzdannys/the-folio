"""2024 Sorcerer: all four origins, interactive Metamagic, casting, persistence and mobile layout."""
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
 page=browser.new_page(viewport={'width':1180,'height':850});page.set_default_timeout(18000)
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('window.FolioDice.rollDie = sides => sides === 20 ? 17 : sides === 100 ? 85 : sides >= 8 ? 6 : 3')
 def create(name,subclass,level):
  page.locator('[data-action=library-new-character]').first.click();f=page.locator('#library-character-create')
  f.locator('[name=name]').fill(name);f.locator('[name=classId]').select_option('class:sorcerer');f.locator('[name=level]').fill(str(level));f.locator('[name=subclassId]').select_option('subclass:'+subclass)
  f.locator('button[type=submit]').click();assert not f.count(),name+' failed to create'
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def library():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def click(kind):page.locator(f'[data-action=sorcerer-2024][data-kind="{kind}"]').first.click()
 def effect(fragment):
  output=page.locator('#sorcerer-2024-panel').inner_text()
  assert fragment in output,f'Missing {fragment}: {output[-700:]}'
 def confirm():page.locator('#sorc-24-confirm').check()
 # Aberrant: telepathy, Revelation adaptations, Warping Implosion and persistence
 create('Aberrant Sorcerer QA','aberrant-sorcery',18)
 assert page.locator('#sorcerer-2024-panel').count()==1
 # Real spellbook modal: alternate Aberrant Psionic Sorcery cost must spend points without a slot.
 page.locator('[data-action=nav][data-tab=spellbook]:visible').first.click()
 page.locator('.spell-book-row').filter(has_text='Detect Thoughts').first.locator('[data-action=open-cast]').click()
 cast=page.locator('#cast-form');assert cast.is_visible()
 assert cast.locator('[name=cost] option[value=sorcerer-psionic]').count()==1
 cast.locator('[name=cost]').select_option('sorcerer-psionic')
 cast.locator('button[type=submit]').click();assert cast.count()==0,'Psionic casting modal failed'
 page.locator('[data-action=nav][data-tab=sheet]:visible').first.click()
 click('turn');confirm();page.locator('#sorc-24-target').fill('DM-confirmed ally');click('telepathy');effect('Telepathic Speech')
 click('turn');page.locator('input[name="sorc-revelation-option"][value="Glistening Flight"]').check();click('revelation');effect('Revelation in Flesh')
 click('turn');confirm();click('warp');effect('Warping Implosion')
 library();reopen('Aberrant Sorcerer QA');effect('Warping Implosion')
 # Clockwork: Restore Balance, Bastion ward and its roll
 library();create('Clockwork Sorcerer QA','clockwork-sorcery',18)
 click('turn');confirm();click('balance');effect('Restore Balance')
 click('turn');confirm();page.locator('#sorc-24-dice-count').select_option('2');click('bastion');effect('Bastion of Law')
 page.locator('#sorc-24-dice-count').select_option('1');page.locator('#sorc-24-damage').fill('12');confirm();click('ward-hit');effect('Bastion ward')
 library();reopen('Clockwork Sorcerer QA');effect('Bastion ward')
 # Draconic: affinity, resistance, wings, and summon controls
 library();create('Draconic Sorcerer QA','draconic-sorcery',18)
 page.locator('#sorc-24-element').select_option('Lightning');click('element');effect('Elemental Affinity')
 click('turn');click('wings');effect('Dragon Wings')
 click('turn');confirm();page.locator('#sorc-24-no-conc').check();click('companion');effect('Dragon Companion')
 library();reopen('Draconic Sorcerer QA');effect('Dragon Companion')
 # Wild Magic: Tides of Chaos, Surges triggered on slot spells, Bend Luck
 library();create('Wild Sorcerer QA','wild-magic-sorcery',18)
 click('turn');confirm();click('tides');effect('Tides of Chaos')
 click('turn');confirm();click('luck');effect('Bend Luck')
 library();reopen('Wild Sorcerer QA');effect('Bend Luck')
 # Shared: Sorcerer Metamagic builder and Innate spell attack with Advantage
 click('turn')
 page.locator('#sorc-24-meta-0').select_option('Seeking Spell');page.locator('#sorc-24-meta-1').select_option('Subtle Spell');page.locator('#sorc-24-meta-2').select_option('Empowered Spell');page.locator('#sorc-24-meta-3').select_option('Quickened Spell');page.locator('#sorc-24-meta-4').select_option('Distant Spell');page.locator('#sorc-24-meta-5').select_option('Heightened Spell')
 click('meta-save');effect('Metamagic')
 click('innate');effect('Innate Sorcery')
 click('turn');confirm();click('spell-attack');effect('Spell attack')
 library();reopen('Wild Sorcerer QA');effect('Spell attack')
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+2'),'Sorcerer mobile horizontal overflow'
 assert not errors,errors
 browser.close()
print('PASS: Sorcerer Aberrant/Clockwork/Draconic/Wild, Metamagic, cast controls, save/reopen, mobile')
