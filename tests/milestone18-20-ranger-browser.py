"""2024 Ranger four subclasses, character sheet, confirmed rolls, save/reopen, and mobile checks."""
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
 page=browser.new_page(viewport={'width':1180,'height':850});page.set_default_timeout(10000)
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('window.FolioDice.rollDie = side => side === 20 ? 15 : side === 12 ? 7 : side === 10 ? 6 : side === 8 ? 5 : 4')
 def create(name,subclass,level):
  page.locator('[data-action=library-new-character]').first.click();f=page.locator('#library-character-create')
  f.locator('[name=name]').fill(name);f.locator('[name=classId]').select_option('class:ranger');f.locator('[name=level]').fill(str(level));f.locator('[name=subclassId]').select_option('subclass:'+subclass)
  f.locator('button[type=submit]').click();assert not f.count(),name+' failed to create'
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def lib():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def click(kind):page.locator(f'[data-action=ranger-2024][data-kind="{kind}"]').first.click()
 def confirm():page.locator('#ranger-20-confirm').check()
 create('Ranger Beast Browser','beast-master',11)
 assert page.locator('#ranger-2024-panel').count()==1,'Ranger controls missing'
 page.locator('#ranger-20-rest').check();click('beast-summon')
 assert 'Land beast' in page.locator('#ranger-2024-panel').inner_text()
 click('turn');confirm();page.locator('#ranger-20-beast-role').select_option('replace');click('beast-attack')
 assert 'Beast’s Strike' in page.locator('#ranger-2024-panel').inner_text(),'Beast strike not shown'
 lib();reopen('Ranger Beast Browser');assert 'Land beast' in page.locator('#ranger-2024-panel').inner_text()
 lib();create('Ranger Gloom Browser','gloom-stalker',11)
 click('turn')
 page.locator('[data-action=nav][data-tab=inventory]:visible').first.click()
 page.locator('[data-action=weapon-catalog-open]').click();page.locator('[data-action=weapon-catalog-add][data-id=longsword]').first.click()
 page.locator('[data-action=close-modal]').last.click()
 page.locator('.ledger-item').filter(has_text='Longsword').locator('[data-action=item-equip]').first.click()
 page.locator('.ledger-item').filter(has_text='Longsword').locator('[data-action=reference]').first.click()
 page.locator('.reference-dialog [data-action=weapon-attack]').click()
 wf=page.locator('#weapon-attack-form');assert wf.locator('[name=rangerGloomDread]').count()==1
 wf.locator('[name=rangerTarget]').fill('Goblin');wf.locator('[name=rangerConfirmed]').check();wf.locator('[name=rangerGloomDread]').check();wf.locator('[name=targetAC]').fill('10');wf.locator('button[type=submit]').click()
 assert not wf.count(),'Gloom attack did not resolve'
 assert 'Dread Ambusher' in page.locator('body').inner_text() or 'Dread Ambusher' in page.locator('#ranger-2024-panel').inner_text()
 page.locator('[data-action=nav][data-tab=sheet]:visible').first.click()
 confirm();page.locator('#ranger-20-flurry').select_option('strike');click('gloom-flurry')
 assert 'Stalker’s Flurry' in page.locator('#ranger-2024-panel').inner_text()
 lib();reopen('Ranger Gloom Browser')
 assert 'Stalker’s Flurry' in page.locator('#ranger-2024-panel').inner_text() or 'Gloom Stalker' in page.locator('#ranger-2024-panel').inner_text()
 lib();create('Ranger Fey Browser','fey-wanderer',15)
 click('turn');confirm();page.locator('#ranger-20-fey-target').fill('Kobold');click('fey-twist')
 assert 'Beguiling Twist' in page.locator('#ranger-2024-panel').inner_text()
 lib();reopen('Ranger Fey Browser');assert 'Fey Wanderer' in page.locator('#ranger-2024-panel').inner_text()
 lib();create('Ranger Hunter Browser','hunter',11)
 assert 'Hunter · advanced 2024 features' in page.locator('#ranger-2024-panel').inner_text()
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+2'),'Mobile overflow'
 assert not errors,errors
 browser.close()
print('PASS: 2024 Ranger four subclasses, Beast/Gloom/Fey/Hunter controls, attacks, save/reopen, and mobile layout')
