"""M13 browser acceptance checks (local Chromium + playwright); optional, not part of `npm test`."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64, re, shutil
base=Path(__file__).resolve().parents[1]
html=(base/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="css/style.css">','<style>'+(base/'css/style.css').read_text()+'</style>')
bootstrap='''<script>
Object.defineProperty(window, 'indexedDB', {configurable:true, value:undefined});
const MEM={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>MEM[k]||null,setItem:(k,v)=>MEM[k]=String(v),removeItem:k=>delete MEM[k]}});
window.confirm=()=>true;
</script>'''
html=html.replace('</head>',bootstrap+'</head>')
def inject(match):
    body=(base/match.group(1)).read_text().replace('</script>','<\\/script>')
    return '<script>'+body+'</script>'
html=re.sub(r'<script src="([^"]+)"></script>',inject,html)
for name in ('butterfly.svg','folio-seal.svg','folio-book.svg'):
    b64=base64.b64encode((base/'assets'/name).read_bytes()).decode()
    html=html.replace('assets/'+name,'data:image/svg+xml;base64,'+b64)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1366,'height':860})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='domcontentloaded')
    page.locator('[data-action=library-open]').first.wait_for()
    page.locator('[data-action=library-open]').first.click()
    page.locator('main .folio-panel').first.wait_for()
    print('Pip sheet loaded; panels:',page.locator('main .folio-panel').count())
    panel=page.locator('main .folio-panel').first
    assert panel.locator('.panel-collapse-toggle').count()==1
    panel.locator('.panel-collapse-toggle').click()
    assert 'is-collapsed' in panel.get_attribute('class')
    assert panel.locator('.panel-body').is_hidden()
    page.locator('[data-action=nav][data-tab=combat]').first.click()
    page.locator('[data-action=nav][data-tab=sheet]').first.click()
    panel=page.locator('main .folio-panel').first
    assert 'is-collapsed' in panel.get_attribute('class')
    panel.locator('.panel-collapse-toggle').click()
    assert panel.locator('.panel-body').is_visible()
    page.locator('#hp-amount').fill('23')
    page.locator('[data-action=temp-hp]').click()
    assert 'TEMP 23' in page.locator('.hp-display').inner_text()
    assert page.locator('#hp-amount').input_value()=='23'
    page.locator('#hp-amount').fill('0')
    page.locator('[data-action=temp-hp]').click()
    assert 'TEMP 0' in page.locator('.hp-display').inner_text()
    page.locator('#concentration').select_option(label='Bless')
    page.locator('#hp-amount').fill('19')
    page.locator('[data-action=damage]').click()
    dialog=page.locator('.concentration-dialog')
    assert dialog.is_visible()
    assert 'Bless' in dialog.inner_text()
    assert 'DC 10' in dialog.inner_text()
    dialog.locator('[data-action=concentration-pass]').click()
    assert dialog.count()==0
    assert page.locator('#concentration').input_value()=='Bless'
    page.locator('#hp-amount').fill('999')
    page.locator('[data-action=damage]').click()
    dialog=page.locator('.concentration-dialog')
    assert 'DC 30' in dialog.inner_text()
    dialog.locator('[data-action=concentration-fail]').click()
    assert page.locator('#concentration').input_value()==''
    page.locator('[data-action=nav][data-tab=inventory]').first.click()
    form=page.locator('#currency-form')
    form.locator('input[name=amount]').fill('99999999')
    form.locator('button[type=submit]').click()
    assert '100,000,010' in page.locator('.coin-grid').inner_text()
    overflow=page.locator('.coin-grid strong').evaluate_all('(els)=>els.every(el=>el.scrollWidth<=el.clientWidth+1)')
    assert overflow,'Coin display overflow still present'
    assert not errors,errors
    print('M13 browser PASS: collapse persistence, HP control, concentration pass/fail/DC cap, coin overflow, no JS exceptions')
    browser.close()
