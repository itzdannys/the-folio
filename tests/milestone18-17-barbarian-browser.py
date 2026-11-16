"""2024 Barbarian: all four PHB subclasses, actual UI actions, save/reopen, mobile."""
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
 b=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':1180,'height':850});page.set_default_timeout(9000)
 errors=[];page.on('pageerror',lambda x:errors.append(str(x)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('window.FolioDice.rollDie=side=>side===20?15:side===12?7:4')
 def create(name,slug,level):
  page.locator('[data-action=library-new-character]').first.click()
  form=page.locator('#library-character-create');form.locator('[name=name]').fill(name)
  form.locator('[name=classId]').select_option('class:barbarian');form.locator('[name=level]').fill(str(level));form.locator('[name=subclassId]').select_option('subclass:'+slug)
  form.locator('button[type=submit]').click();assert not form.count(),name+' creation failed'
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def lib():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 create('Barbarian World Tree','path-of-the-world-tree',14)
 assert page.locator('#barb-travel-on-rage').count()==1
 page.locator('[data-action=barb-turn]').first.click()
 page.locator('#barb-travel-on-rage').check();page.locator('#barb-travel-on-distance').fill('120');page.locator('#barb-travel-on-allies').fill('2');page.locator('#barb-travel-on-long').check();page.locator('#barb-travel-on-confirm').check()
 page.locator('[data-action=rage-toggle]').first.click()
 assert 'Rage active' in page.locator('body').inner_text()
 assert '120' in page.locator('body').inner_text()
 lib();reopen('Barbarian World Tree');assert 'Rage active' in page.locator('body').inner_text()
 lib()
 create('Barbarian Zealot','path-of-the-zealot',14)
 assert page.locator('#barb-gods-form').count()==1
 page.locator('#barb-gods-form').check();page.locator('[data-action=rage-toggle]').first.click()
 assert 'Rage of the Gods' in page.locator('body').inner_text()
 page.locator('#barb-unarmed-kind').select_option('damage');page.locator('#barb-unarmed-target').fill('10')
 page.locator('[data-action=barb-unarmed]').first.click()
 assert 'Unarmed Strike' in page.locator('body').inner_text()
 page.locator('#barb-heal-dice').fill('1');page.locator('[data-action=barb-heal]').first.click()
 lib();reopen('Barbarian Zealot');assert page.locator('#barb-heal-dice').count()==1
 lib()
 create('Barbarian Wild Heart','path-of-the-wild-heart',14)
 page.locator('#barb-rage-animal').select_option('Eagle');page.locator('#barb-rage-power').select_option('Falcon')
 page.locator('[data-action=rage-toggle]').first.click()
 assert 'Eagle' in page.locator('body').inner_text()
 assert page.locator('[data-action=barb-eagle]').count()==1
 page.locator('#barb-aspect').select_option('Panther');page.locator('[data-action=barb-aspect]').first.click()
 assert 'Climb Speed equals Speed' in page.locator('body').inner_text()
 lib()
 create('Barbarian Berserker','berserker',14)
 assert page.locator('[data-action=barbarian-intimidate]').count()>=1
 page.locator('[data-action=barb-turn]').first.click()
 page.locator('[data-action=barbarian-intimidate]').first.click()
 assert 'Intimidating Presence' in page.locator('body').inner_text()
 page.set_viewport_size({'width':390,'height':844})
 assert page.locator('[data-action=barb-unarmed]').is_visible()
 assert not errors,errors
 (BASE/'test-output').mkdir(exist_ok=True)
 page.screenshot(path=str(BASE/'test-output/milestone18-17-barbarian-mobile.png'),full_page=True)
 b.close()
print('PASS: 4 Barbarian paths, Rage, teleport, unarmed, skills, resource flows, persistence and mobile')
