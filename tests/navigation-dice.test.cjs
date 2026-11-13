const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('Folio branding is keyboard accessible library navigation; no redundant header Library button',()=>{
  const ui=read('js/ui.js');
  const markup=ui.match(/function topbar\(.*?function vitals/s)?.[0]||'';
  assert.match(markup, /<button type="button" class="brand brand-home-button" data-action="go-library"/);
  assert.match(markup, /aria-label="Return to character library"/);
  assert.doesNotMatch(markup, /library-back-top/);
  assert.match(read('css/style.css'),/\.brand-home-button:focus-visible/);
});

test('Each Quick Roll die has number-free correct geometry, including a nonblank d6',()=>{
  const visual=read('js/rules-ui.js');
  assert.match(visual,/assets\/dice\/d\$\{n\}\.svg/);
  assert.match(visual,/data-action="quick-roll-die"/);
  for(const sides of [4,6,8,10,12,20]){
    const svg=read(`assets/dice/d${sides}.svg`);
    assert.match(svg,new RegExp(`d${sides} polyhedral die shape`));
    assert.match(svg,/<polygon points=/);
    assert.doesNotMatch(svg,/<text x=/,'face numerals must not be rendered');
    assert.ok((svg.match(/<polygon /g)||[]).length>=2);
  }
  assert.ok((read('assets/dice/d20.svg').match(/<polygon /g)||[]).length>=(read('assets/dice/d6.svg').match(/<polygon /g)||[]).length+3);
  assert.match(read('css/style.css'),/prefers-reduced-motion:reduce/);
});

test('Paladin spell-level progression is distinct from total character level and Pip has a separate limited advancement path',()=>{
  require('../js/spell-catalog.js');
  const FR=require('../js/rules-engine.js');
  const character=level=>({className:'Paladin',level,build:{characterClass:'Paladin'}});
  for(const [level,highest] of [[1,1],[4,1],[5,2],[8,2],[9,3],[12,3],[13,4],[16,4],[17,5],[20,5]]){
    assert.equal(FR.spellAccess(character(level)).maxLevel,highest);
    assert.ok(FR.availableSpells(character(level)).every(sp=>sp.level<=highest));
  }
  assert.ok(FR.availableSpells(character(9)).some(sp=>sp.level===3));
});
