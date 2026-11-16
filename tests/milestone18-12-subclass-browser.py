"""Browser checks for Life, Fiend and Draconic subclass controls on desktop/mobile."""
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
 page=browser.new_page(viewport={'width':1280,'height':900});page.set_default_timeout(11000)
 errors=[];page.on('pageerror',lambda err: errors.append(str(err)))
 page.set_content(html,wait_until='domcontentloaded')
 def new(name,cl,sub,n):
  page.locator('[data-action=library-new-character]').first.click()
  f=page.locator('#library-character-create')
  f.locator('[name=name]').fill(name)
  f.locator('[name=classId]').select_option(cl)
  f.locator('[name=level]').fill(str(n))
  f.locator('[name=subclassId]').select_option(sub)
  f.locator('button[type=submit]').click()
  assert f.count()==0, 'create failed: '+page.locator('body').inner_text()[-1500:]
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def back():page.locator('[data-action=go-library]').first.click()
 new('Life Test','class:cleric','subclass:life-domain',8)
 assert page.locator('[data-action=life-preserve]').count()==1
 page.locator('#life-preserve-others').fill('10')
 page.locator('[data-action=life-preserve]').click()
 assert 'Preserve Life' in page.locator('body').inner_text()
 assert '2 / 3' in page.locator('body').inner_text(),'Channel Divinity was not spent'
 back()
 page.locator('.library-character').filter(has_text='Life Test').locator('[data-action=library-open]').first.click()
 assert 'Preserve Life' in page.locator('body').inner_text()
 back()
 new('Fiend Test','class:warlock','subclass:fiend-patron',10)
 assert page.locator('[data-action=fiend-blessing]').count()==1
 page.locator('[data-action=fiend-blessing]').click()
 assert 'Dark One' in page.locator('body').inner_text()
 page.locator('#fiend-luck-total').fill('10')
 page.locator('#fiend-luck-dc').fill('15')
 page.evaluate('window.FolioDice.rollDie=()=>7')
 page.locator('[data-action=fiend-luck]').click()
 assert 'Dark One' in page.locator('body').inner_text()
 page.locator('#fiend-resistance-type').select_option('Fire')
 page.locator('#fiend-rest-confirm').check()
 page.locator('[data-action=fiend-resilience]').click()
 assert 'Active choice: Fire' in page.locator('body').inner_text()
 back()
 page.locator('.library-character').filter(has_text='Fiend Test').locator('[data-action=library-open]').first.click()
 assert 'Active choice: Fire' in page.locator('body').inner_text()
 back()
 new('Dragon Test','class:sorcerer','subclass:draconic-sorcery',14)
 assert page.locator('[data-action=dragon-wings]').count()==1
 assert 'Draconic Resilience' in page.locator('body').inner_text()
 page.locator('[data-action=dragon-wings]').click()
 assert 'Dismiss Dragon Wings' in page.locator('[data-action=dragon-wings]').inner_text()
 page.locator('[data-action=dragon-wings]').click()
 assert '3 Sorcery Points' in page.locator('[data-action=dragon-wings]').inner_text()
 back()
 page.locator('.library-character').filter(has_text='Dragon Test').locator('[data-action=library-open]').first.click()
 assert '3 Sorcery Points' in page.locator('[data-action=dragon-wings]').inner_text()
 page.set_viewport_size({'width':390,'height':844})
 assert page.locator('[data-action=dragon-wings]').is_visible()
 assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'),'mobile overflow'
 (BASE/'test-output').mkdir(exist_ok=True)
 page.screenshot(path=str(BASE/'test-output/milestone18-12-subclass-mobile.png'),full_page=True)
 assert not errors,errors
 browser.close()
print('PASS: Life, Fiend, Draconic controls, persistence and mobile')
