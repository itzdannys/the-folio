"""Offline browser regression of Glory counterattack, Living Legend strike, Vengeance OA and saves."""
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
 browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1180,'height':850});page.set_default_timeout(10000)
 errors=[];page.on('pageerror',lambda er:errors.append(str(er)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('window.FolioDice.rollDie=side=>side===20?15:4')
 def create(name,subclass,level):
  page.locator('[data-action=library-new-character]').first.click()
  form=page.locator('#library-character-create')
  form.locator('[name=name]').fill(name)
  form.locator('[name=classId]').select_option('class:paladin')
  form.locator('[name=level]').fill(str(level))
  form.locator('[name=subclassId]').select_option('subclass:'+subclass)
  form.locator('button[type=submit]').click()
  assert not form.count(),page.locator('body').inner_text()[-1000:]
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def library():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def equip():
  page.locator('[data-action=nav][data-tab=inventory]:visible').first.click()
  page.locator('[data-action=weapon-catalog-open]').click()
  page.locator('[data-action=weapon-catalog-add][data-id=longsword]').first.click()
  page.locator('[data-action=close-modal]').last.click()
  page.locator('.ledger-item').filter(has_text='Longsword').locator('[data-action=item-equip]').click()
 def weapon():page.locator('.ledger-item').filter(has_text='Longsword').locator('[data-action=weapon-attack]').click()
 def roll():page.locator('#weapon-attack-form button[type=submit]').click()
 # A prevented hit grants the actual weapon follow-up without a second reaction or use.
 create('Glory Counter','oath-of-glory',15)
 page.locator('#glory-hit-total').fill('15')
 page.locator('#glory-target-ac').fill('15')
 page.locator('[data-action=glory-defense]').click()
 equip();weapon()
 assert page.locator('[name=gloryCounterattack]').is_visible()
 page.locator('[name=gloryCounterattack]').check()
 page.locator('[name=gloryAttackerConfirmed]').check()
 page.locator('[name=gloryInRange]').check()
 page.locator('#weapon-attack-form [name=targetAC]').fill('12');roll()
 assert 'Glorious Defense counterattack' in page.locator('body').inner_text()
 library();reopen('Glory Counter');page.locator('[data-action=nav][data-tab=inventory]:visible').first.click();weapon()
 assert page.locator('[name=gloryCounterattack]').count()==0
 page.locator('[data-action=close-modal]').last.click();library()
 # Unerring Strike converts a natural 1 into normal hit and persists once-turn spent status.
 create('Glory Legend','oath-of-glory',20)
 page.locator('[data-action=paladin-capstone]').click()
 equip();weapon();page.evaluate('window.FolioDice.rollDie=side=>side===20?1:4')
 assert page.locator('[name=livingLegendUnerring]').is_visible()
 page.locator('[name=livingLegendUnerring]').check()
 page.locator('[name=ownTurnConfirmed]').check()
 page.locator('#weapon-attack-form [name=targetAC]').fill('40');roll()
 assert 'Living Legend Unerring Strike turns miss into hit' in page.locator('body').inner_text()
 library();reopen('Glory Legend');page.locator('[data-action=nav][data-tab=inventory]:visible').first.click();weapon()
 assert page.locator('[name=livingLegendUnerring]').is_disabled()
 page.locator('[data-action=close-modal]').last.click();library()
 # Vengeance Opportunity Attack triggers on confirmed reach and hit.
 create('Vengeance Pursuer','oath-of-vengeance',7);equip();weapon()
 assert page.locator('[name=relentlessOpportunity]').is_visible()
 page.evaluate('window.FolioDice.rollDie=side=>side===20?15:4')
 page.locator('[name=relentlessOpportunity]').check()
 page.locator('[name=opportunityConfirmed]').check()
 page.locator('[name=opportunityInReach]').check()
 page.locator('#weapon-attack-form [name=targetAC]').fill('12');roll()
 assert 'Opportunity Attack Reaction spent' in page.locator('body').inner_text()
 library();reopen('Vengeance Pursuer');page.locator('[data-action=nav][data-tab=inventory]:visible').first.click();weapon()
 assert page.locator('[name=relentlessOpportunity]').is_disabled()
 page.locator('[data-action=close-modal]').last.click()
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'),'Mobile horizontal overflow'
 assert not errors,errors
 browser.close()
print('PASS: Glory counterattack, Living Legend unerring hit, Vengeance opportunity attack, save/reopen, mobile')
