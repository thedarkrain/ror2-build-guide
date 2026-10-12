from pathlib import Path
p=Path(__file__).resolve().parent.parent/'src/app.js'
s=p.read_text()
s=s.replace("import { chapters, glossary, expansionCards, bosses, quickQuiz } from './data/learn.js';", "import { chapters, glossary, expansionCards, bosses, quickQuiz } from './data/learn.js';\nimport { skillExplain, skillImageOverride } from './data/skill-notes.js';")
start=s.index("const RAW =")
end=s.index("const HBANNER =",start)
s=s[:start]+s[end:]
start=s.index('function imageSources(')
end=s.index('function initArtwork()',start)
s=s[:start]+'''// Wikimedia-style file redirects: the image sources are exclusively the Risk of Rain 2 wiki.
// Wiki media might not hotlink on every network; fallbacks remain readable and link back to the wiki.
function imageSources(entry, kind='item') {
  const n = typeof entry === 'string' ? entry : entry.name;
  const filename = (kind === 'skill' ? (skillImageOverride[n] || n) : n).replace(/:/g, '');
  const encoded = encodeURIComponent(filename.replace(/ /g, '_'));
  const paths = [encoded + '.png', encoded + '.webp'];
  return [
    ...paths.map(file => `https://riskofrain2.wiki.gg/wiki/Special:Redirect/file/${file}`),
    `https://riskofrain2.wiki.gg/wiki/Special:FilePath/${paths[0]}`
  ];
}
function art(entry,kind='item',extraClass='') {
  const sources=imageSources(entry,kind);
  const title=typeof entry==='string' ? entry : entry.name;
  return `<span class="art ${extraClass} ${typeof entry==='object'?tierCss(entry):''}" title="${escaped(title)}"><img data-art data-urls="${escaped(JSON.stringify(sources))}" src="${escaped(sources[0])}" alt="${escaped(title)} artwork from the Risk of Rain 2 wiki" loading="lazy" referrerpolicy="no-referrer"/><span class="art-fallback" aria-hidden="true">${escaped(title.slice(0,2).toUpperCase())}</span></span>`;
}
''' +s[end:]
start=s.index('function skillsModule(')
end=s.index('function itemCompact(',start)
s=s[:start]+'''function skillCards(s,b){
 const labels=s.skills.length===5?['PASSIVE','PRIMARY','SECONDARY','UTILITY','SPECIAL']:['PRIMARY','SECONDARY','UTILITY','SPECIAL'];
 const selected=state.skills[s.id]||{};
 return `<div class="skill-cards">${s.skills.map((options,i)=>{
   const ix=Math.min(options.length-1,selected[i]??b.skillChoices[i]??0);
   return `<div class="skill-slot"><div class="skill-slot-head"><strong>${labels[i]||'SKILL'}</strong><span>${options.length>1?'CHOOSE ONE':'FIXED ABILITY'}</span></div><div class="skill-options">${options.map((op,j)=>`<div class="skill-option ${ix===j?'chosen':''}"><button class="skill-option-main" aria-pressed="${ix===j}" data-action="pick-skill" data-slot="${i}" data-index="${j}">${art(op,'skill','ability-art')}<span class="skill-option-body"><b>${escaped(op)}</b><small>${escaped(skillExplain(op))}</small></span><span class="skill-check">${ix===j?'✓':'○'}</span></button><a href="${wiki(s.name)}#${enc(op)}" target="_blank" rel="noopener noreferrer" class="skill-wiki" title="Verify ${escaped(op)} on the wiki">WIKI ↗</a></div>`).join('')}</div></div>`;
 }).join('')}</div>`;
}
function selectedSkillPreview(s,b){const labels=s.skills.length===5?['PASSIVE','PRIMARY','SECONDARY','UTILITY','SPECIAL']:['PRIMARY','SECONDARY','UTILITY','SPECIAL'];return `<div class="loadout-visual">${skillSelection(s,b).map((op,i)=>`<div class="selected-skill">${art(op,'skill','selected-art')}<span><small>${labels[i]||'SKILL'}</small><b>${escaped(op)}</b></span></div>`).join('')}</div>`;}
function buildSelector(s){return `<div class="build-presets">${s.builds.map((b,i)=>{
  const skillNames=s.skills.map((opts,j)=>opts[b.skillChoices[j]||0]);
  return `<button class="build-select ${i===state.preset?'on':''}" data-action="preset" data-index="${i}"><span class="kicker">PATH 0${i+1} · ${escaped(b.style)}</span><strong>${escaped(b.title)}</strong><small>${escaped(b.desc)}</small><div class="preset-art-title">RECOMMENDED ABILITIES</div><div class="preset-icons">${skillNames.map(op=>art(op,'skill','preset-art')).join('')}</div><div class="preset-art-title">CORE ITEMS</div><div class="preset-icons">${b.core.map(n=>art(FIND.get(n)||n,'item','preset-art')).join('')}</div><span class="preset-foot"><em>${escaped(b.difficulty)}</em><b>${i===state.preset?'✓ CURRENT BUILD':'VIEW LOADOUT ↗'}</b></span></button>`;
 }).join('')}</div>`;}
function survivorDetail(){const s=selectedSurvivor(),b=activeBuild();return `<section class="survivor-detail panel"><div class="survivor-info"><div><div class="kicker">SURVIVOR PROFILE / ${escaped(s.dlc.toUpperCase())}</div><h2>${escaped(s.name.toUpperCase())}</h2><p class="survivor-quote">${escaped(s.tagline)}</p><p>${escaped(s.desc)}</p><div class="tag green">${escaped(s.role)}</div></div>${art(s.name,'survivor','hero-survivor')}</div><div class="two-panel"><div><h3>RECOMMENDED SKILL LOADOUT</h3><p class="micro-muted">Choose an ability by clicking its picture. The recommended selection changes with your build preset.</p>${skillCards(s,b)}</div><div><h3>${s.builds.length} BUILD PATHS</h3>${buildSelector(s)}<button class="btn primary full" data-go="builds">SEE ITEMS AND STACK TARGETS →</button></div></div></section>`;}
''' +s[end:]
# replace build markup with full survivor grid, no dropdown
start=s.index(' `<section class="panel buildbar">')
end=s.index(' <div class="build-columns">',start)
s=s[:start]+''' `<section class="panel buildbar"><div class="buildbar-top"><div class="kicker">01 / ALL SURVIVORS — CLICK A PORTRAIT TO CHANGE CHARACTER</div><span class="tag green">${game.survivors.length} SURVIVORS</span></div><div class="all-survivor-grid">${game.survivors.map(v=>`<button class="survivor-pick ${v.id===s.id?'active':''}" data-action="pick-survivor" data-id="${v.id}" aria-pressed="${v.id===s.id}">${art(v.name,'survivor','pick-art')}<span>${escaped(v.name)}</span><small>${escaped(v.dlc==='Base game'?'BASE':v.dlc)}</small></button>`).join('')}</div></section>
 <section class="panel featured-survivor-banner">${art(s.name,'survivor','featured-survivor-art')}<div><div class="kicker">SELECTED CHARACTER</div><h2>${escaped(s.name)}</h2><p>${escaped(s.role)} · ${escaped(s.dlc)}</p><small>${escaped(s.desc)}</small></div></section>
''' +s[end:]
s=s.replace('${skillsModule(s,b)}<div class="build-skill-summary">${preferred.map((n,i)=>`<div><span>${slotNames[i]}</span><b>${escaped(n)}</b></div>`).join(\'\')}</div>', '${selectedSkillPreview(s,b)}${skillCards(s,b)}')
# update sources language; no raw github
s=s.replace('Standard item icons and survivor portraits are linked from <a href="https://github.com/MattieTK/ror.tk.gg" target="_blank" rel="noopener">MattieTK/ror.tk.gg’s public image directory ↗</a>, whose project documents its wiki asset source. New DLC icons fall back to <a href="${ROOT}Category%3AItem_icons" target="_blank" rel="noopener">wiki.gg file redirects ↗</a>. Official expansion promo art is linked from Epic Games Store.', 'Survivor portraits, skill images, items, Hexes, Hallowed items and spell images all use <a href="${ROOT}Category%3AImages" target="_blank" rel="noopener">riskofrain2.wiki.gg file redirects ↗</a>. Official expansion promo art is linked from Epic Games Store. New wiki files may not be available immediately.')
s=s.replace('Artwork loads online from linked community assets; unknown/new files show a labeled fallback.', 'Artwork loads from wiki.gg file redirects; missing or blocked wiki images show a labeled fallback with a source link.')
s=s.replace('the skill loadout, real item icons, reasons, and suggested stack goals adapt to the build', 'the illustrated skill loadout, wiki item icons, reasons, and stack goals adapt to the build')
s=s.replace('Choose a strategy then add its core items to your collection.', 'Choose a strategy then add its core items to your collection.')
# insert event
needle=" if(a==='preset'){state.preset=Number(button.dataset.index);state.skills[state.survivor]={};render(true);return;}"
s=s.replace(needle, needle+"\n if(a==='pick-skill'){const id=selectedSurvivor().id;if(!state.skills[id])state.skills[id]={};state.skills[id][Number(button.dataset.slot)]=Number(button.dataset.index);render(true);return;}")
# remove unusable dropdown handlers
s=s.replace(" if(e.target.id==='build-survivor'){state.survivor=e.target.value;state.preset=0;state.skills[state.survivor]={};render(true)}\n if(e.target.dataset.action==='skill'){const s=selectedSurvivor();if(!state.skills[s.id])state.skills[s.id]={};state.skills[s.id][e.target.dataset.slot]=Number(e.target.value);render(true)}\n",'')
p.write_text(s)
