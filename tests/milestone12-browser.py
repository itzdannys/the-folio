"""Offline inline-script browser regression for 3D Quick Roll and release navigation.
Requires Python Playwright and Chromium. No account/server/network.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re,base64,shutil,io
from PIL import Image, ImageChops
base=Path(__file__).resolve().parents[1]
output=base/'test-output';output.mkdir(exist_ok=True)
html=(base/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="css/style.css">','<style>'+(base/'css/style.css').read_text()+'</style>')
bootstrap='''<script>
Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});
const SIMULATED_STORAGE={};
Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>SIMULATED_STORAGE[k]||null,setItem:(k,v)=>SIMULATED_STORAGE[k]=String(v),removeItem:k=>delete SIMULATED_STORAGE[k]}});
window.confirm=()=>true;
</script>'''
html=html.replace('</head>',bootstrap+'</head>')
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>\n'+(base/m[1]).read_text().replace('</script>','<\\/script>')+'\n</script>',html)
for f in ['butterfly.svg','folio-seal.svg']:
  html=html.replace('assets/'+f,'data:image/svg+xml;base64,'+base64.b64encode((base/'assets'/f).read_bytes()).decode())
with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':1280,'height':850},accept_downloads=True)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded');page.wait_for_timeout(200)
  assert page.locator('.library-character').count()==1
  page.locator('[data-action=library-open]').first.click()
  assert page.locator('.hp-current').inner_text()=='60'
  page.locator('.floating-die').click()
  assert page.locator('.quick-die img').count()==6
  for i in range(6):
    uri=page.locator('.quick-die img').nth(i).get_attribute('src')
    assert 'text%20x%3D' not in uri and '%3Ctext' not in uri
  canvas=page.locator('#quick-roll-tray');assert canvas.count()==1
  assert page.evaluate('document.getElementById("quick-roll-tray").width')>100
  page.screenshot(path=str(output/'m12-dice-3d-idle.png'))
  page.locator('[data-change=quick-roll-count]').select_option('2')
  page.locator('[data-change=quick-roll-modifier]').fill('3')
  page.locator('[data-sides="6"]').first.click()
  assert page.get_by_text('Rolling…').count()==1
  page.wait_for_timeout(120)
  frame_a=canvas.screenshot()
  page.wait_for_timeout(320)
  frame_b=canvas.screenshot()
  a=Image.open(io.BytesIO(frame_a)).convert('RGB');b=Image.open(io.BytesIO(frame_b)).convert('RGB')
  assert ImageChops.difference(a,b).getbbox() is not None, '3D dice did not move during roll'
  page.screenshot(path=str(output/'m12-dice-3d-rolling.png'))
  page.wait_for_timeout(900)
  assert page.locator('.quick-roll-result').count()==1
  total=page.locator('.quick-roll-result b').inner_text()
  assert 5<=int(total)<=15
  assert page.get_by_text('Rolling…').count()==0
  assert page.evaluate('document.getElementById("quick-roll-tray").width')>100
  page.screenshot(path=str(output/'m12-dice-3d-result.png'))
  # D20 modes, values and history.
  page.locator('[data-change=quick-roll-count]').select_option('1')
  page.locator('[data-change=quick-roll-mode]').select_option('advantage')
  page.locator('[data-sides="20"]').click()
  page.wait_for_timeout(1200)
  assert 'advantage' in page.locator('.quick-roll-result strong').inner_text()
  assert page.locator('.quick-roll-history-row').count()==2
  # Escape returns focus to the toggle; refresh/reopen remains independent of rolls.
  page.keyboard.press('Escape')
  assert page.locator('.quick-roll-window').count()==0
  assert page.evaluate('document.activeElement.classList.contains("floating-die")')
  assert page.locator('.hp-current').inner_text()=='60'
  # Existing spellbook, library and settings remain accessible.
  page.locator('[data-tab=spellbook]').first.click()
  assert page.get_by_text('Prepared Paladin').count()>0
  page.locator('[data-action=go-library]').first.click()
  assert page.locator('.library-character').count()==1
  # Test phone layout at 390 px.
  page.set_viewport_size({'width':390,'height':844})
  page.locator('[data-action=library-open]').first.click()
  page.locator('.floating-die').click()
  assert page.locator('#quick-roll-tray').is_visible()
  assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+1')
  page.screenshot(path=str(output/'m12-dice-mobile.png'))
  assert not errors,errors
  print('Milestone 12 browser verification passed: animated 3D polyhedra, fair result UI, reduced history, escape focus, Pip isolation, library, spellbook, 390px mobile and zero JS errors.')
  browser.close()
