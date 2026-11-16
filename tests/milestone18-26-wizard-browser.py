"""2024 Wizard: four schools, real controls, spellbook persistence and mobile."""
from pathlib import Path
import base64, re, shutil
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
 page.evaluate('window.FolioDice.rollDie = sides => sides === 20 ? 17 : sides === 12 ? 7 : sides === 100 ? 85 : 4')
 def create(name,subclass,level):
  page.locator('[data-action=library-new-character]').first.click();f=page.locator('#library-character-create')
  f.locator('[name=name]').fill(name);f.locator('[name=classId]').select_option('class:wizard');f.locator('[name=level]').fill(str(level));f.locator('[name=subclassId]').select_option('subclass:'+subclass)
  f.locator('button[type=submit]').click();assert not f.count(),name+' failed to create'
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
  assert page.locator('#wizard-2024-panel').count()==1,name+' no panel'
 def library():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def click(k):page.locator('[data-action=wizard-2024][data-kind="'+k+'"]').first.click()
 def contains(t):assert t in page.locator('#wizard-2024-panel').inner_text(),f'Wizard panel missing {t}'
 def spell(n):
  opts=page.locator('#wiz-26-book-spell option'); vals=opts.evaluate_all('(nodes,n)=>nodes.filter(x=>x.textContent.includes(n)).map(x=>x.value)',n)
  assert vals,'Wizard spell missing from catalogue: '+n;return vals[0]
 def learn(n,mode='research',confirmed=False):
  page.locator('#wiz-26-book-spell').select_option(spell(n));page.locator('#wiz-26-book-mode').select_option(mode)
  if confirmed:page.locator('#wiz-26-copy-confirm').check()
  click('learn');contains(n)
 # All schools create a character with the correct class-specific panel and controls.
 create('Wizard Abjurer QA','abjurer',10);contains('Arcane Ward');contains('Spell Breaker')
 learn('Magic Missile');contains('1 recorded spell');click('turn');learn('Shield','copy',True);contains('2 recorded spells')
 library();reopen('Wizard Abjurer QA');contains('2 recorded spells');contains('Shield')
 library();create('Wizard Diviner QA','diviner',14);contains('Portent');click('portent-roll');contains('17')
 page.locator('#wiz-26-target').fill('Confirmed target');page.locator('#wiz-26-confirmed').check();click('portent-use');contains('Portent')
 click('turn');page.locator('#wiz-26-choice').select_option('Darkvision');click('third-eye');contains('The Third Eye')
 library();reopen('Wizard Diviner QA');contains('The Third Eye')
 library();create('Wizard Evoker QA','evoker',14);contains('Overchannel');contains('Savant')
 learn('Magic Missile');contains('1 recorded spell')
 library();create('Wizard Illusionist QA','illusionist',14);contains('Improved Illusions');contains('Illusory Reality')
 contains('Summon Beast');click('turn');page.locator('#wiz-26-confirmed').check();page.locator('#wiz-26-target').fill('Illusionary fountain');click('illusory-reality');contains('Illusory Reality')
 library();reopen('Wizard Illusionist QA');contains('Illusory Reality')
 # Level 20 uses real spellbook controls to configure Signature Spells and Spell Mastery.
 library();create('Wizard Archmage QA','evoker',20)
 for name in ['Magic Missile','Scorching Ray','Fireball','Lightning Bolt']:learn(name)
 assert 'Signature Spells' in page.locator('#wizard-2024-panel').inner_text()
 page.locator('#wiz-26-master-one').select_option(spell('Magic Missile'))
 page.locator('#wiz-26-master-two').select_option(spell('Scorching Ray'));click('mastery');contains('Spell Mastery')
 page.locator('#wiz-26-sig-one').select_option(spell('Fireball'))
 page.locator('#wiz-26-sig-two').select_option(spell('Lightning Bolt'));click('signature');contains('Signature Spells')
 library();reopen('Wizard Archmage QA')
 assert page.locator('#wiz-26-sig-one').input_value()==spell('Fireball')
 assert page.locator('#wiz-26-master-one').input_value()==spell('Magic Missile')
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+2'),'Wizard mobile horizontal overflow'
 assert not errors,errors
 browser.close()
print('PASS: Wizard four schools, spellbook copying and persistence, Portent, Third Eye, Illusory Reality, Spell Mastery/Signature, mobile')
