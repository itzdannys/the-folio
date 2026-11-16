"""Milestone 15.1 browser check using a fully inlined offline page."""
from pathlib import Path
import shutil, re, base64
from playwright.sync_api import sync_playwright
base=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
  context=browser.new_context(viewport={'width':1280,'height':850},accept_downloads=True)
  page=context.new_page();page.set_default_timeout(8000);errors=[]
  page.on('pageerror',lambda e: errors.append(str(e)))
  html=(base/'index.html').read_text()
  html=html.replace('<link rel="stylesheet" href="css/style.css">','<style>'+(base/'css/style.css').read_text()+'</style>')
  html=html.replace('</head>',"<script>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});const STORE={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>STORE[k]||null,setItem:(k,v)=>STORE[k]=String(v),removeItem:k=>delete STORE[k]}});window.confirm=()=>true;</script></head>")
  def inject(m): return '<script>'+(base/m.group(1)).read_text().replace('</script>',r'<\/script>')+'</script>'
  html=re.sub(r'<script src="([^"]+)"></script>',inject,html)
  for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
    data=base64.b64encode((base/'assets'/name).read_bytes()).decode()
    html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+data)
  page.set_content(html,wait_until='domcontentloaded')
  print("loaded", flush=True)
  page.locator('[data-action=library-open]').first.wait_for(timeout=10000)
  page.locator('[data-action=library-open]').first.click()
  assert page.locator('.bookplate').get_attribute('src').startswith('data:image/svg+xml;base64,')
  assert page.locator('.always-visible-undo').is_visible()
  page.locator('.folio-options-menu summary').click()
  assert page.locator('.folio-options-list button').count()==6
  page.locator('[data-action=open-artwork]').click()
  assert page.locator('#artwork-sheet-icon').input_value()=='emblem'
  assert page.locator('#artwork-card-image').input_value()=='portrait'
  assert page.locator('.artwork-token-controls').is_visible()
  assert page.locator('.artwork-preview-col #artwork-zoom').count()==1
  page.locator('#artwork-token-source').select_option('emblem')
  page.locator('#artwork-sheet-icon').select_option('token')
  page.locator('#artwork-card-image').select_option('emblem')
  canvas=page.locator('#artwork-token-canvas');canvas.hover();page.mouse.wheel(0,-100)
  assert page.locator('#artwork-zoom').input_value()=='1.05'
  print('saving artwork',flush=True)
  page.locator('[data-action=artwork-save]').click()
  page.locator('.artwork-studio').wait_for(state='detached',timeout=10000)
  src=page.locator('.bookplate').get_attribute('src')
  assert src.startswith('data:image/webp;base64,'),src[:80]
  page.locator('[data-action=go-library]').click()
  assert page.locator('.library-card-portrait').count()==0
  assert page.locator('.library-default-emblem').first.get_attribute('src').startswith('data:image/svg+xml;base64,')
  page.locator('[data-action=library-open]').first.click()
  page.locator('.folio-options-menu summary').click();page.locator('[data-action=open-artwork]').click()
  assert page.locator('#artwork-sheet-icon').input_value()=='token'
  assert page.locator('#artwork-card-image').input_value()=='emblem'
  page.locator('#artwork-card-image').select_option('token')
  print('saving artwork',flush=True)
  page.locator('[data-action=artwork-save]').click()
  page.locator('.artwork-studio').wait_for(state='detached',timeout=10000)
  page.locator('[data-action=go-library]').click()
  assert page.locator('.library-default-emblem').first.get_attribute('src').startswith('data:image/webp;base64,')
  page.locator('[data-action=library-open]').first.click()
  print('layout',flush=True)
  page.locator('[data-action=layout-edit]').click()
  panel=page.locator('.folio-panel[data-layout-id=skills]');handle=panel.locator('.layout-drag-handle');target=page.locator('.sheet-left .folio-panel').first
  x=handle.bounding_box();y=target.bounding_box()
  page.mouse.move(x['x']+x['width']/2,x['y']+x['height']/2);page.mouse.down();page.mouse.move(y['x']+40,y['y']+18,steps=8)
  assert page.locator('.sheet-middle > .folio-panel[data-layout-id=skills]').count()==1, 'should stay in original column until mouse release'
  page.mouse.up()
  assert page.locator('.sheet-left > .folio-panel[data-layout-id=skills]').count()==1
  page.locator('[data-action=layout-save]').click()
  assert page.locator('.sheet-left > .folio-panel[data-layout-id=skills]').count()==1
  page.locator('[data-action=layout-edit]').click()
  page.locator('[data-action=layout-reset]').click()
  page.locator('[data-action=layout-save]').click()
  assert page.locator('.sheet-middle > .folio-panel[data-layout-id=skills]').count()==1
  (base/'test-output').mkdir(exist_ok=True)
  page.screenshot(path=str(base/'test-output'/'m15-polish-sheet.png'))
  assert not errors,errors
  print('M15.3 offline-in-memory Chromium PASS: Options, book token, choices, wheel, saved icons, stable drag, in-editor reset')
  browser.close()
