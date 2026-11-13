"""Optional Milestone 10 UI smoke test, Python 3.9+ and Playwright.

Run: python tests/browser-smoke.py
Requires Playwright Chromium. Uses an in-memory localStorage substitute and
inlined local CSS/JS; this does not establish Windows file:// or IndexedDB persistence.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re
import shutil
import base64
import json

base = Path(__file__).resolve().parents[1]
out = base / 'test-output'
out.mkdir(exist_ok=True)
html = (base/'index.html').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>'+(base/'css/style.css').read_text(encoding='utf-8')+'</style>')
bootstrap = '''<script>
Object.defineProperty(window, 'indexedDB', {configurable:true, value:undefined});
const TEST_MEMORY={};
Object.defineProperty(window,'localStorage',{configurable:true,value:{
 getItem:k=>TEST_MEMORY[k]||null,
 setItem:(k,v)=>TEST_MEMORY[k]=String(v),
 removeItem:k=>delete TEST_MEMORY[k]
}});
window.confirm=()=>true;
</script>'''
html=html.replace('</head>',bootstrap+'</head>')

def inject(match):
    body=(base/match.group(1)).read_text(encoding='utf-8').replace('</script>','<\\/script>')
    return '<script>\n'+body+'\n</script>'
html=re.sub(r'<script src="([^"]+)"></script>',inject,html)
# Inline local SVGs so test screenshots show the real bookplate despite restricted file:// navigation.
for svgname in ('butterfly.svg','folio-seal.svg'):
    encoded=base64.b64encode((base/'assets'/svgname).read_bytes()).decode('ascii')
    html=html.replace('assets/'+svgname,'data:image/svg+xml;base64,'+encoded)
die_test_data={n:base64.b64encode((base/'assets'/'dice'/f'd{n}.svg').read_bytes()).decode('ascii') for n in (4,6,8,10,12,20)}
html=html.replace('assets/dice/d${n}.svg','data:image/svg+xml;base64,${window.__DICE_IMAGES[n]}')
html=html.replace('</head>','<script>window.__DICE_IMAGES='+json.dumps(die_test_data)+'</script></head>')

with sync_playwright() as p:
    executable=shutil.which('chromium') or shutil.which('google-chrome')
    kwargs={'headless':True,'args':['--no-sandbox','--disable-dev-shm-usage']}
    if executable: kwargs['executable_path']=executable
    browser=p.chromium.launch(**kwargs)
    page=browser.new_page(viewport={'width':1440,'height':900},accept_downloads=True)
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.set_content(html,wait_until='domcontentloaded')
    page.wait_for_timeout(250)
    assert page.locator('.library-character h3').all_inner_texts()==['Pip']

    # Create a reusable homebrew species and a level-5 Wizard.
    page.locator('[data-action="library-homebrew"]').click()
    page.locator('[data-action="library-hb-new"]').click()
    hb=page.locator('#library-homebrew-form')
    hb.locator('select[name=kind]').select_option('species')
    hb.locator('input[name=name]').fill('Moonfolk')
    hb.locator('input[name=speed]').fill('35')
    hb.locator('select[name=bonusAbility]').select_option('dex')
    hb.locator('input[name=bonusAmount]').fill('1')
    hb.locator('input[name=acBonus]').fill('1')
    hb.locator('button[type=submit]').click()
    assert page.get_by_text('Moonfolk',exact=True).count()>=1
    page.screenshot(path=str(out/'homebrew-desktop.png'),full_page=True)
    for kind,name,description in [('spell','Butterfly Step','Fey magic teleportation subject to DM approval'),('weapon','Moonsteel Rapier','A custom weapon')]:
        page.locator('[data-action=library-hb-new]').click()
        hf=page.locator('#library-homebrew-form')
        hf.locator('select[name=kind]').select_option(kind)
        hf.locator('input[name=name]').fill(name)
        hf.locator('textarea[name=description]').fill(description)
        if kind=='spell': hf.locator('input[name=level]').fill('2')
        else:
            hf.locator('input[name=damage]').fill('1d8')
            hf.locator('input[name=mastery]').fill('Vex')
        hf.locator('button[type=submit]').click()
        assert page.get_by_text(name,exact=True).count()>=1
    page.locator('[data-action=library-modal-close]').last.click()
    page.locator('[data-action=library-new-character]').first.click()
    form=page.locator('#library-character-create')
    form.locator('input[name=name]').fill('Ilyra')
    form.locator('input[name=level]').fill('5')
    form.locator('select[name=classId]').select_option('class:wizard')
    form.locator('select[name=speciesId]').select_option(label='Moonfolk · Homebrew')
    form.locator('select[name=backgroundId]').select_option('background:sage')
    form.locator('select[name=backgroundPlus]').select_option('int')
    form.locator('select[name=backgroundOne]').select_option('wis')
    assert '4' in page.locator('#builder-live-preview').inner_text()
    page.screenshot(path=str(out/'builder-desktop.png'),full_page=True)
    form.locator('button[type=submit]').click()
    page.locator('.library-character').filter(has_text='Ilyra').locator('[data-action=library-open]').click()
    assert page.locator('.ac-crest strong').inner_text()=='11'
    assert page.locator('.hp-current').inner_text()=='22'
    assert '4 / 4' in page.locator('.builder-slot-card').first.inner_text()
    # Saved Milestone 9 homebrew entries can be copied into a character sheet.
    page.locator('[data-action=nav][data-tab=spellbook]').first.click()
    page.locator('[data-action=homebrew-spell-open]').first.click()
    page.locator('[data-action=homebrew-import-spell]').first.click()
    assert 'Butterfly Step' in page.locator('.spellbook-preview').inner_text()
    page.locator('[data-action=nav][data-tab=inventory]').first.click()
    page.locator('[data-action=homebrew-equipment-open]').first.click()
    page.locator('[data-action=homebrew-import-equipment]').first.click()
    assert 'Moonsteel Rapier' in page.locator('.inventory-ledger').inner_text()
    page.screenshot(path=str(out/'homebrew-inventory.png'),full_page=True)

    # SRD spell catalogue: filter, select an initial list, cast and track concentration.
    page.locator('[data-action=nav][data-tab=spellbook]').first.click()
    page.locator('[data-action=open-prep]').click()
    assert '339 spells in the bundled catalogue' in page.locator('body').inner_text()
    assert 'Wizard spell catalogue' in page.locator('body').inner_text()
    shield_key=page.evaluate("window.FolioSpellCatalog.spells.find(s=>s.name==='Shield').key")
    web_key=page.evaluate("window.FolioSpellCatalog.spells.find(s=>s.name==='Web').key")
    page.locator(f'[data-action="catalog-draft-toggle"][data-id="{shield_key}"]').click()
    page.locator(f'[data-action="catalog-draft-toggle"][data-id="{web_key}"]').click()
    page.locator('[data-action=catalog-save-list]').click()
    assert page.get_by_text('Shield',exact=True).count()>=1
    page.locator(f'[data-action="open-cast"][data-id="{shield_key}"]').click()
    page.locator('#cast-form select[name=cost]').select_option('slot1')
    page.locator('#cast-form button[type=submit]').click()
    page.locator('[data-action=nav][data-tab=sheet]').first.click()
    assert '3 / 4' in page.locator('.builder-slot-card').first.inner_text()
    page.locator('[data-action=nav][data-tab=spellbook]').first.click()
    page.locator(f'[data-action="open-cast"][data-id="{web_key}"]').click()
    page.locator('#cast-form select[name=cost]').select_option('slot2')
    page.locator('#cast-form button[type=submit]').click()
    page.locator('[data-action=nav][data-tab=sheet]').first.click()
    page.locator('#concentration').wait_for()
    assert page.locator('#concentration').input_value()=='Web'
    page.locator('[data-action=nav][data-tab=spellbook]').first.click()
    page.screenshot(path=str(out/'spellbook-desktop.png'),full_page=True)

    # Quick Roll opens from the bottom-left launcher and rolls animated dice.
    page.locator('.floating-die').click()
    assert page.locator('.quick-roll-window').count()==1
    assert page.locator('.quick-die').count()==6
    assert page.locator('.quick-die img.quick-die-visual').count()==6
    assert page.locator('.quick-die img.quick-die-visual').evaluate_all('(els)=>els.every(img=>img.complete && img.naturalWidth>0)')
    assert page.locator('.quick-die[data-sides="6"] img').get_attribute('src').startswith('data:image/svg+xml')
    page.screenshot(path=str(out/'quick-roll-window.png'),full_page=True)
    page.locator('[data-action=quick-roll-die][data-sides="20"]').click()
    assert 'is-rolling' in page.locator('[data-action=quick-roll-die][data-sides="20"]').get_attribute('class')
    page.wait_for_timeout(800)
    total=int(page.locator('.quick-roll-result b').inner_text())
    assert 1<=total<=20
    page.locator('[data-change=quick-roll-count]').select_option('2')
    page.locator('[data-change=quick-roll-modifier]').fill('3')
    page.locator('[data-action=quick-roll-die][data-sides="6"]').click()
    page.wait_for_timeout(800)
    total=int(page.locator('.quick-roll-result b').inner_text())
    assert 5<=total<=15
    page.screenshot(path=str(out/'quick-roll-result.png'),full_page=True)
    page.locator('[data-action=quick-roll-close]').click()

    # Browse the 38-weapon catalogue, add/equip a weapon, and roll an attack.
    page.locator('[data-action=nav][data-tab=inventory]').first.click()
    page.locator('[data-action=weapon-catalog-open]').click()
    assert '38 WEAPONS' in page.locator('.weapon-catalog-dialog').inner_text()
    page.locator('#weapon-catalog-search').fill('Longsword')
    page.locator('[data-action=weapon-catalog-add]').click()
    page.locator('[data-action=close-modal]').last.click()
    longsword=page.locator('.ledger-item').filter(has_text='Longsword')
    longsword.locator('[data-action=item-equip]').click()
    longsword.locator('[data-action=weapon-attack]').click()
    page.locator('#weapon-attack-form input[name=targetAC]').fill('10')
    page.locator('#weapon-attack-form button[type=submit]').click()
    assert 'Longsword' in page.locator('.roll-result').inner_text()
    page.screenshot(path=str(out/'inventory-weapons-desktop.png'),full_page=True)

    # Slot spending/Undo and level progression still work; Pip remains isolated.
    page.locator('[data-action=nav][data-tab=sheet]').first.click()
    page.locator('[data-action=generic-slot][data-index="0"][data-delta="-1"]').first.click()
    assert '2 / 4' in page.locator('.builder-slot-card').first.inner_text()
    page.locator('[data-action=undo]').first.click()
    assert '3 / 4' in page.locator('.builder-slot-card').first.inner_text()
    page.locator('[data-action=open-builder]').first.click()
    edit=page.locator('#character-build-edit')
    edit.locator('input[name=level]').fill('9')
    edit.locator('button[type=submit]').click()
    page.locator('[data-action=go-library]').first.click()
    page.locator('.library-character').filter(has_text='Pip').locator('[data-action=library-open]').click()
    assert page.locator('.hp-current').inner_text()=='60'
    assert page.locator('.ac-crest strong').inner_text()=='17'
    page.locator('[data-action=nav][data-tab=spellbook]').first.click()
    assert 'Prepared Paladin' in page.locator('body').inner_text()
    page.locator('[data-action=open-prep]').click()
    assert 'Compelled Duel' in page.locator('body').inner_text()
    assert 'Wrathful Smite' in page.locator('body').inner_text()
    page.screenshot(path=str(out/'pip-preparations.png'),full_page=True)
    page.locator('[data-action=close-prep]').first.click()
    page.screenshot(path=str(out/'pip-spellbook.png'),full_page=True)

    # Phone layout checks.
    assert page.locator('.top-actions [data-action=go-library]').count()==0
    assert page.locator('button.brand-home-button[data-action=go-library]').count()==1
    page.locator('button.brand-home-button').click()
    assert page.locator('.library-character').count()>=2
    page.set_viewport_size({'width':390,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth-window.innerWidth')<=2
    page.screenshot(path=str(out/'library-mobile.png'),full_page=True)
    page.locator('[data-action=library-new-character]').first.click()
    assert page.evaluate('document.documentElement.scrollWidth-window.innerWidth')<=2
    page.screenshot(path=str(out/'builder-mobile.png'),full_page=True)
    page.locator('[data-action=library-modal-close]').last.click()
    page.locator('.library-character').filter(has_text='Pip').locator('[data-action=library-open]').click()
    page.locator('.floating-die').click()
    assert page.locator('.quick-die img.quick-die-visual').count()==6
    assert page.evaluate('document.documentElement.scrollWidth-window.innerWidth')<=2
    page.screenshot(path=str(out/'quick-roll-mobile.png'),full_page=True)
    assert not errors,errors
    print('Milestone 10 browser smoke tests passed — SRD spells, casting, Quick Roll, weapon catalogue/attack, level progression, Pip isolation, mobile width')
    browser.close()
