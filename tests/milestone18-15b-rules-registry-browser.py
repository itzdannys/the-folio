"""Read-only registry smoke under the same offline, local inlined-script harness."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re, shutil
base=Path(__file__).resolve().parents[1]
html=(base/'index.html').read_text(encoding='utf8')
html=html.replace('<link rel="stylesheet" href="css/style.css">','<style>'+(base/'css/style.css').read_text(encoding='utf8')+'</style>')
html=html.replace('</head>','''<script>
Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});
const MOCK={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>MOCK[k]||null,setItem:(k,v)=>MOCK[k]=String(v),removeItem:k=>delete MOCK[k]}});
window.confirm=()=>true;
</script></head>''')
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(base/m.group(1)).read_text(encoding='utf8').replace('</script>',r'<\/script>')+'</script>',html)
with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':1200,'height':800})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded')
  assert page.locator('.library-character h3').all_inner_texts()==['Pip']
  results=page.evaluate('''() => {
    const a=window.FolioRulesVersionAudit.audit();
    const lib=window.FolioLibrary;
    return { candidates:a.candidateCount,selected:a.selected.map(x=>x.name),pending:a.pendingOptions.length,kind:a.kind,globals:[!!window.FolioRulesRegistry,!!window.FolioSources,!!lib] };
  }''')
  assert results['kind']=='read-only-audit',results
  assert results['candidates']==610,results # Three additional official 2024 Wizard schools in 18.26
  assert len(results['selected'])==5,results
  assert results['pending']==38,results
  assert all(results['globals']),results
  assert not errors,errors
  browser.close()
print('PASS: Offline browser loads actual rules version audit, current Paladin identities, and preserved Pip library')
