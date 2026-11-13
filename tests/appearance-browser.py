"""Milestone 11 interactive browser regression. Uses an inline offline bundle with simulated localStorage;
no actual local file or IndexedDB restart guarantee. Run: python tests/appearance-browser.py"""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
import base64,re,shutil,json
base=Path(__file__).resolve().parents[1]
out=base/'test-output';out.mkdir(exist_ok=True)
html=(base/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="css/style.css">','<style>'+(base/'css/style.css').read_text()+'</style>')
bootstrap="""<script>
Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});
const TEST_MEMORY={};
Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>TEST_MEMORY[k]||null,setItem:(k,v)=>TEST_MEMORY[k]=String(v),removeItem:k=>delete TEST_MEMORY[k]}});
window.confirm=()=>true;
</script>"""
html=html.replace('</head>',bootstrap+'</head>')
def inline(m):return '<script>\n'+(base/m.group(1)).read_text().replace('</script>','<\\/script>')+'\n</script>'
html=re.sub(r'<script src="([^"]+)"></script>',inline,html)
for name in ('butterfly.svg','folio-seal.svg'):
  html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+base64.b64encode((base/'assets'/name).read_bytes()).decode())
image_path=out/'test-background.png'
im=Image.new('RGB',(580,340),(43,61,91));d=ImageDraw.Draw(im);d.ellipse((70,30,430,300),fill=(166,95,116));d.rectangle((240,120,550,260),fill=(96,71,111));im.save(image_path)
with sync_playwright() as p:
  executable=shutil.which('chromium') or shutil.which('google-chrome')
  browser=p.chromium.launch(headless=True,executable_path=executable,args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':1440,'height':900},accept_downloads=True);page.set_default_timeout(5500)
  errors=[];page.on('pageerror',lambda x:errors.append(str(x)))
  page.set_content(html,wait_until='domcontentloaded');page.wait_for_timeout(250)
  assert page.locator('.library-character').count()==1
  page.locator('[data-action=library-open]').first.click()
  assert page.evaluate('document.body.dataset.folioTheme')=='masquerade'
  assert page.locator('[data-action=open-appearance]').count()==1
  print('STEP page.locator(\'[data-action=open-appearance]\').click()',flush=True)
  page.locator('[data-action=open-appearance]').click()
  assert page.locator('#appearance-form').count()==1
  assert page.locator('[name=preset]:checked').input_value()=='masquerade'
  page.screenshot(path=str(out/'appearance-masquerade-desktop.png'),full_page=True)
  print('STEP page.locator(\'.preset-picker\').filter(has_text=\'Enchanted Forest\').click()',flush=True)
  page.locator('.preset-picker').filter(has_text='Enchanted Forest').click()
  assert page.locator('input[name=header]').input_value()=='#26483e'
  page.locator('select[name=diceStyle]').select_option('steel')
  page.locator('input[name=accent]').fill('#00ffaa')
  img_before=page.locator('#appearance-live img').get_attribute('src')
  assert img_before.startswith('data:image/svg+xml')
  print('STEP page.locator(\'#appearance-form button[type=submit]\').click()',flush=True)
  page.locator('#appearance-form button[type=submit]').click()
  assert page.evaluate('document.body.dataset.folioTheme')=='forest'
  assert page.evaluate('getComputedStyle(document.body).getPropertyValue("--theme-accent").trim()')=='#00ffaa'
  assert page.locator('.hp-current').inner_text()=='60'
  page.locator('.floating-die').click()
  assert page.locator('.quick-die img').first.get_attribute('src').startswith('data:image/svg+xml')
  page.screenshot(path=str(out/'appearance-forest-dice.png'),full_page=False)
  page.locator('[data-action=quick-roll-close]').click()
  page.locator('[data-action=undo]').first.click()
  assert page.evaluate('document.body.dataset.folioTheme')=='masquerade'
  # Save a reusable theme and verify applying it to another character.
  page.locator('[data-action=open-appearance]').click()
  page.locator('.preset-picker').filter(has_text='Celestial Archive').click()
  page.locator('input[name=accent]').fill('#abcabc')
  page.locator('#appearance-theme-name').fill('Night Archive')
  print('STEP page.locator(\'[data-action=appearance-save-theme]\').click()',flush=True)
  page.locator('[data-action=appearance-save-theme]').click()
  assert page.locator('#appearance-saved-theme option').count()==2
  assert page.locator('[data-action=appearance-use-theme]').count()==1
  # Upload a custom background; it should be compressed to a local data URI.
  print('STEP page.locator(\'#appearance-image\').set_input_files(str(image_path))',flush=True)
  page.locator('#appearance-image').set_input_files(str(image_path))
  page.wait_for_function('document.querySelector("#appearance-image-status").textContent.includes("ready")',timeout=12000)
  assert page.locator('#appearance-live').count()==1
  page.locator('input[name=imageDim]').evaluate('(el)=>{el.value=65;el.dispatchEvent(new Event("input",{bubbles:true}));}')
  page.locator('select[name=imagePosition]').select_option('top')
  page.locator('#appearance-form button[type=submit]').click()
  assert page.evaluate('document.body.dataset.folioTheme')=='celestial'
  assert 'data:image/webp;base64' in page.evaluate('document.body.style.getPropertyValue("--theme-image")')
  page.screenshot(path=str(out/'appearance-custom-background.png'),full_page=False)
  page.locator('[data-action=go-library]').first.click()
  print('STEP page.locator(\'[data-action=library-new-character]\').first.click()',flush=True)
  page.locator('[data-action=library-new-character]').first.click()
  f=page.locator('#library-character-create')
  f.locator('input[name=name]').fill('Lyra')
  f.locator('select[name=classId]').select_option('class:wizard')
  f.locator('select[name=speciesId]').select_option('species:elf')
  f.locator('select[name=backgroundId]').select_option('background:sage')
  f.locator('select[name=backgroundPlus]').select_option('int')
  f.locator('select[name=backgroundOne]').select_option('wis')
  f.locator('button[type=submit]').click()
  page.locator('.library-character').filter(has_text='Lyra').locator('[data-action=library-open]').click()
  assert page.evaluate('document.body.dataset.folioTheme')=='classic'
  page.locator('[data-action=open-appearance]').click()
  page.locator('#appearance-saved-theme').select_option(label='Night Archive')
  page.locator('[data-action=appearance-use-theme]').click()
  assert page.locator('input[name=preset]:checked').input_value()=='celestial'
  page.locator('#appearance-form button[type=submit]').click()
  assert page.evaluate('document.body.dataset.folioTheme')=='celestial'
  page.locator('[data-action=go-library]').first.click()
  page.screenshot(path=str(out/'appearance-library-colours.png'),full_page=False)
  with page.expect_download() as download_info:page.locator('[data-action=library-export-all]').click()
  dl=download_info.value
  downloaded=json.loads(Path(dl.path()).read_text())
  assert downloaded['format']=='masquerade-folio-library'
  assert len(downloaded['themes'])==1
  assert len(downloaded['characters'])==2
  assert any(c['stack']['present'].get('appearance',{}).get('backgroundImage','').startswith('data:image/webp;base64,') for c in downloaded['characters'])
  page.locator('.library-character').filter(has_text='Pip').locator('[data-action=library-open]').click()
  assert page.evaluate('document.body.dataset.folioTheme')=='celestial'
  # Source save contains both different characters plus an image without URLs outside the device.
  lib=page.evaluate('JSON.parse(localStorage.getItem("masquerade-folio:library:v1"))')
  assert len(lib['characters'])==2
  by={c['name']:c for c in lib['characters']}
  assert by['Pip']['stack']['present']['appearance']['backgroundImage'].startswith('data:image/webp;base64,')
  assert by['Lyra']['stack']['present']['appearance']['preset']=='celestial'
  assert len(lib['themes'])==1
  assert by['Pip']['stack']['present']['resources']['hp']==60
  # Mobile appearance studio and background layer.
  page.set_viewport_size({'width':390,'height':844})
  page.locator('[data-action=open-appearance]').click()
  page.screenshot(path=str(out/'appearance-mobile.png'),full_page=True)
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),page.evaluate('document.documentElement.scrollWidth')
  assert not errors, errors
  print('Milestone 11 browser workflow passed: per-character themes, live preview, dice recolour, Undo, saved themes, local image conversion, mobile width, no uncaught page errors')
  browser.close()
