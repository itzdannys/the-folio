"""Exercise earned ASI choices through create/edit and reopening a local character."""
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
 page=browser.new_page(viewport={'width':1280,'height':850});page.set_default_timeout(5000);errors=[]
 page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(html,wait_until='domcontentloaded')
 page.locator('[data-action=library-new-character]').first.click()
 form=page.locator('#library-character-create')
 form.locator('[name=name]').fill('ASI Tester')
 form.locator('[name=classId]').select_option('class:fighter')
 assert form.locator('[name=fightingStyleId]').count()==1
 form.locator('[name=fightingStyleId]').select_option('feat:fighting-style-defense')
 form.locator('[name=level]').fill('4')
 assert form.locator('[name=advancement-kind-4]').count()==1,'feat award UI missing'
 form.locator('[name=advancement-kind-4]').select_option('asi')
 form.locator('[name=advancement-first-4]').select_option('str')
 form.locator('[name=advancement-second-4]').select_option('str')
 assert 'Level 4: ASI STR / STR' in form.locator('#builder-live-preview').inner_text(),form.locator('#builder-live-preview').inner_text()
 assert form.locator('#builder-live-preview .builder-final-scores').inner_text().startswith('STR\n12') or '12' in form.locator('#builder-live-preview .builder-final-scores').inner_text()
 form.locator('[type=submit]').click()
 assert page.locator('#library-character-create').count()==0,'create may have failed'
 page.locator('.library-character').filter(has_text='ASI Tester').locator('[data-action=library-open]').click()
 assert 'STR' in page.locator('body').inner_text()
 page.locator('[data-action=open-builder]').first.click()
 form=page.locator('#character-build-edit')
 assert form.locator('[name=advancement-kind-4]').input_value()=='asi'
 assert form.locator('[name=fightingStyleId]').input_value()=='feat:fighting-style-defense'
 assert form.locator('[name=advancement-first-4]').input_value()=='str'
 first_stats=form.locator('#builder-live-preview .builder-final-scores').inner_text()
 # Edit upward into the Fighter-only level 6 award.
 form.locator('[name=level]').fill('6')
 assert form.locator('[name=advancement-kind-6]').count()==1
 form.locator('[name=advancement-kind-6]').select_option('asi')
 form.locator('[name=advancement-first-6]').select_option('con')
 form.locator('[name=advancement-second-6]').select_option('con')
 assert 'Level 6: ASI CON / CON' in form.locator('#builder-live-preview').inner_text()
 form.locator('button[type=submit]').click()
 assert page.locator('#character-build-edit').count()==0,'edit may have failed'
 page.locator('[data-action=open-builder]').first.click()
 form=page.locator('#character-build-edit')
 assert form.locator('[name=level]').input_value()=='6'
 assert form.locator('[name=advancement-first-6]').input_value()=='con'
 assert 'Level 6: ASI CON / CON' in form.locator('#builder-live-preview').inner_text()
 # Check that the custom feat cards have been granted on the sheet.
 form.locator('button[type=submit]').click()
 page.locator('[data-action=open-features]').last.click()
 assert 'Level 6 · Ability Score Improvement' in page.locator('body').inner_text()
 page.locator('[data-action=nav][data-tab=sheet]').first.click()
 page.locator('[data-action=open-builder]').first.click()
 form=page.locator('#character-build-edit')
 page.set_viewport_size({'width':390,'height':844})
 assert form.locator('[name=advancement-kind-6]').is_visible()
 (BASE/'test-output').mkdir(exist_ok=True)
 page.screenshot(path=str(BASE/'test-output'/'milestone18-2-level-advancement-mobile.png'),full_page=True)
 assert not errors,errors
 browser.close()
print('PASS: Fighter ASI choices at 4/6, persisted leveling, feature cards, mobile viewport')
