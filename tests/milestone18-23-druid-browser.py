"""2024 Druid four circles: live builder, resources, saved characters and mobile UI."""
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
  f.locator('[name=name]').fill(name);f.locator('[name=classId]').select_option('class:druid');f.locator('[name=level]').fill(str(level));f.locator('[name=subclassId]').select_option('subclass:'+subclass)
  f.locator('button[type=submit]').click();assert not f.count(),name+' failed to create'
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def lib():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def click(kind):page.locator(f'[data-action=druid-2024][data-kind="{kind}"]').first.click()
 def effect(text):
  output=page.locator('#druid-2024-panel').inner_text()
  assert text in output, f'Missing effect {text}: {output[-600:]}'
 # Circle of Land: preserve earlier Land mechanics and new Primal Order.
 create('Druid Land Browser','circle-of-the-land',10)
 assert page.locator('#druid-2024-panel').count()==1
 page.locator('#druid-23-order').select_option('Magician');click('order');effect('Primal Order')
 lib();reopen('Druid Land Browser');effect('Primal Order')
 # Circle of Moon: add verified beast form, Wild Shape, attack, save/reopen
 lib();create('Druid Moon Browser','circle-of-the-moon',14)
 details=page.locator('#druid-2024-panel details').filter(has_text='Add or replace known form')
 details.locator('summary').click()
 details.locator('#druid-23-form-name').fill('Verified Wolf')
 details.locator('#druid-23-form-cr').select_option('1')
 details.locator('#druid-23-form-confirm').check()
 click('add-form');effect('Known Wild Shape form')
 click('turn');page.locator('#druid-23-known').select_option('Verified Wolf');click('shape');effect('Wild Shape')
 page.locator('#druid-23-confirm').first.check();click('beast-attack');effect('Beast form attack')
 lib();reopen('Druid Moon Browser');effect('Beast form attack')
 # Sea: start Emanation, resolve initial pulse on same Bonus Action, persistent save/reopen.
 lib();create('Druid Sea Browser','circle-of-the-sea',14)
 click('turn');page.locator('#druid-23-confirm').first.check();click('sea-start');effect('Wrath of the Sea')
 page.locator('#druid-23-confirm').first.check();click('sea-pulse');effect('Wrath of the Sea pulse')
 lib();reopen('Druid Sea Browser');effect('Wrath of the Sea pulse')
 # Stars: form and free Archer shot, map spell, cosmic omen on separate tracked turns.
 lib();create('Druid Stars Browser','circle-of-the-stars',14)
 click('turn');click('star-form');effect('Starry Form')
 page.locator('#druid-23-confirm').first.check();click('star-arrow');effect('Starry Archer')
 click('turn');page.locator('#druid-23-confirm').first.check();click('star-bolt');effect('Star Map')
 click('omen-roll');effect('Cosmic Omen')
 lib();reopen('Druid Stars Browser');effect('Cosmic Omen')
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+2'),'Mobile horizontal overflow'
 assert not errors,errors
 browser.close()
print('PASS: Druid Land/Moon/Sea/Stars, resources, save/reopen and mobile')
