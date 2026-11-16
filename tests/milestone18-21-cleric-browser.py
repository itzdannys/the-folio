"""2024 Cleric four domains, action/Channel controls, save/reopen, and mobile checks."""
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
 page=browser.new_page(viewport={'width':1180,'height':850});page.set_default_timeout(12000)
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('window.FolioDice.rollDie = side => side === 20 ? 15 : side === 12 ? 7 : side === 10 ? 6 : side === 8 ? 5 : 4')
 def create(name,subclass,level):
  page.locator('[data-action=library-new-character]').first.click();f=page.locator('#library-character-create')
  f.locator('[name=name]').fill(name);f.locator('[name=classId]').select_option('class:cleric');f.locator('[name=level]').fill(str(level));f.locator('[name=subclassId]').select_option('subclass:'+subclass)
  f.locator('button[type=submit]').click();assert not f.count(),name+' failed to create'
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def lib():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def click(kind):page.locator(f'[data-action=cleric-2024][data-kind="{kind}"]').first.click()
 def confirm():page.locator('#cleric-confirm').check()
 def effect(text):assert text in page.locator('#cleric-2024-panel').inner_text(),f'Missing effect: {text}'
 create('Cleric Life Browser','life-domain',17)
 assert page.locator('#cleric-2024-panel').count()==1,'Cleric panel missing'
 click('order');effect('Divine Order')
 click('turn');confirm();page.locator('#cleric-preserve-self').fill('3');click('preserve');effect('Preserve Life')
 lib();reopen('Cleric Life Browser');effect('Preserve Life')
 lib();create('Cleric Light Browser','light-domain',17)
 click('turn');confirm();click('radiance');effect('Radiance of the Dawn')
 click('turn');confirm();click('warding');effect('Warding Flare')
 lib();reopen('Cleric Light Browser');effect('Warding Flare')
 lib();create('Cleric Trickery Browser','trickery-domain',17)
 click('turn');confirm();click('duplicate');effect('Invoke Duplicity')
 lib();reopen('Cleric Trickery Browser');effect('active')
 lib();create('Cleric War Browser','war-domain',17)
 click('turn');confirm();click('guided');effect('Guided Strike')
 click('turn');confirm();click('war-blessing');effect('War God')
 lib();reopen('Cleric War Browser');effect('War God')
 page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+2'),'Mobile horizontal overflow'
 assert not errors,errors
 browser.close()
print('PASS: 2024 Cleric four domains, Channel effects, save/reopen, mobile')
