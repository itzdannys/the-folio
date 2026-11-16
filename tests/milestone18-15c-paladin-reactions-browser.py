"""Offline browser smoke: new Paladin reaction + protection controls, storage and mobile."""
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
 browser=p.chromium.launch(headless=True, executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1180,'height':850}); page.set_default_timeout(10000)
 errors=[];page.on('pageerror',lambda er:errors.append(str(er)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('window.FolioDice.rollDie=side=>side===20?15:side===8?6:4')
 def create(name,subclass):
  page.locator('[data-action=library-new-character]').first.click()
  form=page.locator('#library-character-create')
  form.locator('[name=name]').fill(name)
  form.locator('[name=classId]').select_option('class:paladin')
  form.locator('[name=level]').fill('15')
  form.locator('[name=subclassId]').select_option('subclass:'+subclass)
  form.locator('button[type=submit]').click()
  assert not form.count()
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def library():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def equip_sword():
  page.locator('[data-action=nav][data-tab=inventory]:visible').first.click()
  page.locator('[data-action=weapon-catalog-open]').click()
  page.locator('[data-action=weapon-catalog-add][data-id=longsword]').first.click()
  page.locator('[data-action=close-modal]').last.click()
  page.locator('.ledger-item').filter(has_text='Longsword').locator('[data-action=item-equip]').click()
 def weapon():page.locator('.ledger-item').filter(has_text='Longsword').locator('[data-action=weapon-attack]').click()
 # Vengeance: the actual modal requires confirmed trigger and consumes Reaction.
 create('Reaction Knight','oath-of-vengeance')
 page.locator('#vengeance-target').fill('Stone Golem')
 page.locator('[data-action=vengeance-vow]').click()
 equip_sword(); weapon()
 assert page.locator('[name=soulVengeance]').is_visible()
 page.locator('[name=vowedTarget]').check()
 page.locator('[name=soulVengeance]').check()
 page.locator('[name=soulTrigger]').check()
 page.locator('[name=soulInReach]').check()
 page.locator('#weapon-attack-form [name=targetAC]').fill('12')
 page.locator('#weapon-attack-form button[type=submit]').click()
 assert 'Soul of Vengeance Reaction spent' in page.locator('body').inner_text()
 library();reopen('Reaction Knight')
 page.locator('[data-action=nav][data-tab=inventory]:visible').first.click(); weapon()
 assert page.locator('[name=soulVengeance]').is_disabled(), 'Reaction use should persist after reopen'
 page.locator('[data-action=close-modal]').last.click()
 library()
 # Devotion: protection applies after a real tracked Divine Smite.
 create('Shield Knight','oath-of-devotion');equip_sword();weapon()
 page.locator('#weapon-attack-form [name=targetAC]').fill('10')
 page.locator('#weapon-attack-form [name=smiteCost]').select_option('free')
 page.locator('#weapon-attack-form button[type=submit]').click()
 page.locator('[data-action=nav][data-tab=sheet]:visible').first.click()
 assert 'Smite of Protection:' in page.locator('body').inner_text()
 assert 'Active. Your AC and Dexterity saving throws include +2 Half Cover' in page.locator('body').inner_text()
 library();reopen('Shield Knight')
 assert 'Active. Your AC and Dexterity saving throws include +2 Half Cover' in page.locator('body').inner_text()
 page.locator('[data-action=reaction-reset]').click()
 assert 'After a confirmed Divine Smite, Half Cover applies' in page.locator('body').inner_text()
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'), 'Mobile horizontal overflow'
 assert not errors,errors
 browser.close()
print('PASS: Devotion protection and Vengeance reaction attack via offline browser, save/reopen and mobile')
