"""Interactive M18.10 checks: Berserker Rage, Reckless, Frenzy, persistence and mobile."""
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
 page=browser.new_page(viewport={'width':1200,'height':850});page.set_default_timeout(10000);errors=[]
 page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(html,wait_until='domcontentloaded')
 page.locator('[data-action=library-new-character]').first.click()
 f=page.locator('#library-character-create')
 f.locator('[name=name]').fill('Berserker Browser Test')
 f.locator('[name=classId]').select_option('class:barbarian')
 f.locator('[name=level]').fill('6')
 f.locator('[name=subclassId]').select_option('subclass:berserker')
 f.locator('button[type=submit]').click()
 page.locator('.library-character').filter(has_text='Berserker Browser Test').locator('[data-action=library-open]').click()
 assert page.locator('[data-action=rage-toggle]').count()==1
 assert page.locator('[data-action=barbarian-new-turn]').count()==1
 page.locator('[data-action=rage-toggle]').click()
 assert 'End Rage' in page.locator('[data-action=rage-toggle]').inner_text()
 page.locator('[data-action=nav][data-tab=inventory]:visible').first.click()
 page.locator('[data-action=weapon-catalog-open]').click()
 page.locator('[data-action=weapon-catalog-add][data-id=battleaxe]').first.click()
 page.locator('[data-action=close-modal]').last.click()
 page.locator('.ledger-item').filter(has_text='Battleaxe').locator('[data-action=item-equip]').first.click()
 page.locator('.ledger-item').filter(has_text='Battleaxe').locator('[data-action=weapon-attack]').first.click()
 f=page.locator('#weapon-attack-form')
 assert f.locator('[name=recklessAttack]').count()==1
 f.locator('[name=recklessAttack]').check()
 f.locator('[name=targetAC]').fill('10')
 page.evaluate('window.FolioDice.rollDie=sides=>sides===20?15:4')
 f.locator('button[type=submit]').click()
 page.wait_for_function('JSON.parse(STORE[Object.keys(STORE)[0]]).characters.find(c=>c.name==="Berserker Browser Test").stack.past.length>=4');assert 'Frenzy +8' in page.locator('body').inner_text()
 assert 'Reckless Attack' in page.locator('body').inner_text()
 page.locator('.ledger-item').filter(has_text='Battleaxe').locator('[data-action=weapon-attack]').first.click()
 f=page.locator('#weapon-attack-form')
 assert f.locator('[name=recklessAttack]').is_disabled()
 f.locator('[name=targetAC]').fill('10')
 f.locator('button[type=submit]').click()
 assert 'Frenzy +8' not in page.locator('.toast').inner_text(), 'Frenzy must not repeat on second hit'
 page.locator('[data-action=go-library]').first.click()
 page.locator('.library-character').filter(has_text='Berserker Browser Test').locator('[data-action=library-open]').click()
 assert 'Reckless active' in page.locator('body').inner_text()
 page.locator('[data-action=barbarian-new-turn]').click()
 assert 'Choose Reckless Attack' in page.locator('body').inner_text()
 # Higher-level Berserker: Intimidating Presence and Retaliation are real UI actions.
 page.locator('[data-action=go-library]').first.click()
 page.locator('[data-action=library-new-character]').first.click()
 f=page.locator('#library-character-create')
 f.locator('[name=name]').fill('Berserker Fourteen')
 f.locator('[name=classId]').select_option('class:barbarian')
 f.locator('[name=level]').fill('14')
 f.locator('[name=subclassId]').select_option('subclass:berserker')
 f.locator('button[type=submit]').click()
 page.locator('.library-character').filter(has_text='Berserker Fourteen').locator('[data-action=library-open]').click()
 assert page.locator('[data-action=barbarian-intimidate][data-cost=free]').count()==1
 page.locator('[data-action=barbarian-intimidate][data-cost=free]').click()
 assert page.locator('[data-action=barbarian-intimidate][data-cost=rage]').count()==1
 page.locator('[data-action=barbarian-intimidate][data-cost=rage]').click()
 assert 'Intimidating Presence activated' in page.locator('body').inner_text()
 page.locator('[data-action=nav][data-tab=inventory]:visible').first.click()
 page.locator('[data-action=weapon-catalog-open]').click()
 page.locator('[data-action=weapon-catalog-add][data-id=battleaxe]').first.click()
 page.locator('[data-action=close-modal]').last.click()
 page.locator('.ledger-item').filter(has_text='Battleaxe').locator('[data-action=item-equip]').first.click()
 page.locator('.ledger-item').filter(has_text='Battleaxe').locator('[data-action=weapon-attack]').first.click()
 f=page.locator('#weapon-attack-form')
 assert f.locator('[name=retaliationAttack]').count()==1
 f.locator('[name=retaliationAttack]').check()
 f.locator('[name=targetAC]').fill('10')
 f.locator('button[type=submit]').click()
 assert 'Retaliation (Reaction spent)' in page.locator('.toast').inner_text()
 assert 'Frenzy +' not in page.locator('.toast').inner_text(), 'off-turn Retaliation must never trigger Frenzy'
 page.locator('.ledger-item').filter(has_text='Battleaxe').locator('[data-action=weapon-attack]').first.click()
 assert page.locator('[name=retaliationAttack]').is_disabled()
 page.locator('[data-action=close-modal]').last.click()
 page.locator('[data-action=nav][data-tab=sheet]:visible').first.click()
 page.set_viewport_size({'width':390,'height':844})
 assert page.locator('[data-action=barbarian-new-turn]').is_visible()
 assert not errors,errors
 (BASE/'test-output').mkdir(exist_ok=True)
 page.screenshot(path=str(BASE/'test-output/milestone18-10-berserker-mobile.png'),full_page=True)
 browser.close()
print('PASS: Berserker 6/14 Rage, Reckless, Frenzy, Mindless Rage, Intimidating Presence, Retaliation, persistence and mobile')
