"""2024 Bard: four colleges, character controls, save/reopen, spell dialogue and mobile."""
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
 page=browser.new_page(viewport={'width':1180,'height':850});page.set_default_timeout(16000)
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('window.FolioDice.rollDie = side => side === 20 ? 15 : side >= 8 ? 5 : 4')
 def create(name,subclass,level):
  page.locator('[data-action=library-new-character]').first.click();f=page.locator('#library-character-create')
  f.locator('[name=name]').fill(name);f.locator('[name=classId]').select_option('class:bard');f.locator('[name=level]').fill(str(level));f.locator('[name=subclassId]').select_option('subclass:'+subclass)
  f.locator('button[type=submit]').click();assert not f.count(),name+' failed to create'
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def lib():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def click(kind):page.locator(f'[data-action=bard-2024][data-kind="{kind}"]').first.click()
 def effect(text):assert text in page.locator('#bard-2024-panel').inner_text(),f'Missing effect {text} in {page.locator("#bard-2024-panel").inner_text()[-850:]}'
 # Dance: inspiration, agility, companion and initiative mechanics.
 create('Bard Dance Browser','college-of-dance',14)
 assert page.locator('#bard-2024-panel').count()==1
 click('turn');page.locator('#bard-22-recipient').fill('Ally');page.locator('#bard-22-confirm').check();click('grant');effect('Bardic Inspiration')
 page.locator('#optional-bard-agile summary').click();click('agile');effect('Agile Strikes')
 page.locator('#bard-22-eligible').check();click('tandem');effect('Tandem Footwork')
 lib();reopen('Bard Dance Browser');effect('Tandem Footwork')
 # Glamour: inspiration & stateful ability on different turns, DM-confirmed defensive save.
 lib();create('Bard Glamour Browser','college-of-glamour',14)
 click('turn');page.locator('#bard-22-eligible').check();click('mantle');effect('Mantle of Inspiration')
 click('turn');page.locator('#bard-22-eligible').check();click('majesty-start');effect('Mantle of Majesty')
 click('turn');page.locator('#bard-22-eligible').check();click('unbreakable-start');effect('Unbreakable Majesty')
 page.locator('#bard-22-attacker').fill('Dragon');page.locator('#bard-22-charisma-save').fill('1');click('unbreakable-save');effect('Unbreakable Majesty')
 lib();reopen('Bard Glamour Browser');effect('Unbreakable Majesty')
 # Lore: select 3 skills and 2 Magical Discoveries, survive reopening.
 lib();create('Bard Lore Browser','college-of-lore',14)
 details=page.locator('#bard-2024-panel details').filter(has_text='Three additional skill proficiencies');details.locator('summary').first.click()
 choices=details.locator('input[name="bard-skill-lore"]')
 for i in range(3):choices.nth(i).check()
 click('lore-skills');effect('Lore Bonus Proficiencies')
 d=page.locator('#bard-2024-panel details').filter(has_text='Magical Discoveries');d.locator('summary').first.click()
 one=page.locator('#bard-lore-spell-0');two=page.locator('#bard-lore-spell-1')
 assert one.locator('option').count()>2
 first=one.locator('option').nth(0).get_attribute('value');second=two.locator('option').nth(1).get_attribute('value')
 one.select_option(first);two.select_option(second);click('discoveries');effect('Magical Discoveries')
 lib();reopen('Bard Lore Browser');effect('Magical Discoveries')
 # Valor: recipient-owned Combat Inspiration and explicit cantrip-replacement cast option.
 lib();create('Bard Valor Browser','college-of-valor',14)
 click('turn');click('combat');effect('Combat Inspiration')
 dialogue=page.evaluate('''() => {const s=window.PipStorage?null:null; const cur=window.FolioRulesUI; return typeof cur.catalogCastModal === 'function';}''')
 assert dialogue,'Bard spell UI unavailable'
 assert page.evaluate('''() => window.FolioBard2024.valor({templateKind:'starter',build:{characterClass:'Bard',subclass:'College of Valor'},level:14})''')
 lib();reopen('Bard Valor Browser');effect('Combat Inspiration')
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+2'),'Mobile horizontal overflow'
 assert not errors,errors
 browser.close()
print('PASS: Bard Dance/Glamour/Lore/Valor, controls, save/reopen and mobile')
