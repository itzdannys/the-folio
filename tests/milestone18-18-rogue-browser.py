"""2024 Rogue classes and core controls, character persistence, and mobile layout."""
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
 page=browser.new_page(viewport={'width':1180,'height':850});page.set_default_timeout(8000)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 page.evaluate('window.FolioDice.rollDie=side=>side===20?16:side===6?4:3')
 def create(name,sub,level):
  page.locator('[data-action=library-new-character]').first.click()
  form=page.locator('#library-character-create');form.locator('[name=name]').fill(name)
  form.locator('[name=classId]').select_option('class:rogue');form.locator('[name=level]').fill(str(level));form.locator('[name=subclassId]').select_option('subclass:'+sub)
  form.locator('button[type=submit]').click();assert not form.count(),name+' create failed'
  page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 def lib():page.locator('[data-action=go-library]').first.click()
 def reopen(name):page.locator('.library-character').filter(has_text=name).locator('[data-action=library-open]').first.click()
 create('Rogue C Thief','thief',17)
 assert page.locator('#rogue-2024-panel').count()==1
 page.locator('[data-action=rogue-new-turn]').first.click()
 page.locator('#rogue-action-kind').select_option('steady-aim');page.locator('#rogue-action-confirm').check();page.locator('[data-action=rogue-action]').first.click()
 assert 'Steady Aim ready' in page.locator('#rogue-2024-panel').inner_text()
 lib();reopen('Rogue C Thief')
 assert 'Steady Aim ready' in page.locator('#rogue-2024-panel').inner_text()
 page.locator('[data-action=rogue-second-turn]').first.click()
 assert 'Tracked turn active' in page.locator('#rogue-2024-panel').inner_text()
 page.locator('[data-action=rogue-next-round]').first.click()
 lib()
 create('Rogue C Assassin','assassin',17)
 assert page.locator('#rogue-2024-panel').count()==1
 assert 'Death Strike' in page.locator('#rogue-2024-panel').inner_text()
 page.locator('[data-action=nav][data-tab=inventory]:visible').first.click()
 assert page.locator('.ledger-item').filter(has_text='Disguise Kit').count()==1
 assert page.locator('.ledger-item').filter(has_text="Poisoner's Kit").count()==1
 lib()
 create('Rogue C Soulknife','soulknife',17)
 assert page.locator('#rogue-psy-ac').is_visible()
 page.locator('[data-action=rogue-new-turn]').first.click()
 page.locator('#rogue-psy-ac').fill('10');page.locator('#rogue-psy-ally').check();page.locator('[data-action=rogue-psychic-attack]').first.click()
 assert 'Psychic Blade' in page.locator('body').inner_text()
 page.locator('#rogue-psy-bonus').check();page.locator('[data-action=rogue-psychic-attack]').first.click()
 assert 'Bonus Action' in page.locator('body').inner_text()
 lib();reopen('Rogue C Soulknife')
 assert page.locator('#rogue-psy-ac').count()==1
 lib()
 create('Rogue C Arcane','arcane-trickster',17)
 assert page.locator('#rogue-arcane-target').count()==1
 page.locator('#rogue-arcane-target').fill('Ogre');page.locator('#rogue-arcane-invisible').check();page.locator('#rogue-arcane-confirm').check()
 page.locator('[data-action=rogue-ambush]').first.click()
 assert 'Magical Ambush' in page.locator('body').inner_text()
 page.locator('#rogue-arcane-second').fill('Goblin')
 page.locator('[data-action=rogue-versatile]').first.click()
 assert 'Versatile Trickster' in page.locator('body').inner_text()
 lib();reopen('Rogue C Arcane')
 assert page.locator('#rogue-arcane-target').count()==1
 page.set_viewport_size({'width':390,'height':844})
 assert page.locator('[data-action=rogue-new-turn]').is_visible()
 assert not errors,errors
 (BASE/'test-output').mkdir(exist_ok=True)
 page.screenshot(path=str(BASE/'test-output/milestone18-18-rogue-mobile.png'),full_page=True)
 browser.close()
print('PASS: all four Rogues, Thief, Assassin items, Soulknife blades, Arcane powers, save/reopen and mobile')
