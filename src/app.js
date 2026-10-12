import game from './data/game.json' with { type: 'json' };
import { extra } from './data/extra.js';
import { chapters, glossary, expansionCards, bosses, quickQuiz } from './data/learn.js';
import { skillExplain, skillImageOverride } from './data/skill-notes.js';
import { procBySkill, abilityDetails, survivorProcGuides, procIntro } from './data/proc.js';
import { destinationRoutes, encounterBosses, trialChallenges } from './data/encounters.js';
import { fieldTerms } from './data/terms.js';

const ROOT = 'https://riskofrain2.wiki.gg/wiki/';
const HBANNER = 'https://cdn1.epicgames.com/offer/0dfcaeede0214b80b597f08fd7d64b1b/EGS_RiskofRain2HallowedConcepts_GearboxSoftware_DLC_S1_2560x1440-d5be18d6fe84447f97e0e1a1de3a5670';
const ITEMS = [...game.items, ...extra].filter((it, ix, list) => list.findIndex(x => x.name === it.name) === ix);
const ALL = [...ITEMS, ...game.hallowed, ...game.hexes, ...game.pages];
const FIND = new Map(ALL.map(it => [it.name, it]));
const DEFAULT = { page: 'home', survivor: 'acrid', preset: 0, skills: {}, bag: {}, itemQuery: '', tier: 'all', dlc: 'all', survivorQuery: '', hallowedTab: 'hexes', nPage: 'Clarity', spellUsed: {}, hexCount: 2, procDaggers: 1, procAttack: '', voidMode: 'controlled', destinationFilter: 'all', chapter: 'first-run', lessons: [], checklist: {}, glossaryQuery: '', quizPos: 0, quizAnswers: {}, modal: null };
let memory = {};
try { memory = JSON.parse(localStorage.getItem('petrichor-field-guide-v1') || '{}') || {}; } catch { /* unavailable */ }
const state = { ...DEFAULT, ...memory, page: location.hash.replace('#', '') || 'home', modal: null };
if (!['home','learn','survivors','builds','items','hallowed','spells','bosses','procs','glossary','sources'].includes(state.page)) state.page='home';
const root = document.getElementById('app');
const escaped = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const enc = s => encodeURIComponent(String(s).replace(/ /g, '_'));
const wiki = (name, override) => `${ROOT}${enc(override || name)}`;
const persist = () => { try { let copy = {...state}; delete copy.modal; localStorage.setItem('petrichor-field-guide-v1', JSON.stringify(copy)); } catch {/* private browsing */} };
const selectedSurvivor = () => game.survivors.find(x=>x.id === state.survivor) || game.survivors[0];
const activeBuild = () => selectedSurvivor().builds[Math.min(selectedSurvivor().builds.length-1,Math.max(0,state.preset))];
const TIER_NAME = {white:'COMMON',green:'UNCOMMON',red:'LEGENDARY',yellow:'BOSS',lunar:'LUNAR',void:'VOID',equipment:'EQUIPMENT',hallowed:'HALLOWED',hex:'HEX',page:'PAGE'};
const niceTier = i => TIER_NAME[i.tier] || i.rarity || 'ITEM';
const tierCss = i => `tier-${i.tier || 'white'}`;
// Direct wiki.gg media thumbnails, using the same /images/thumb/ path as the wiki's
// own image elements. This site does NOT download or bundle game artwork.
// MediaWiki filenames use underscores for spaces; the file's original case matters.
const MEDIA_ROOT = 'https://riskofrain2.wiki.gg/images/';
function imageSources(entry, kind='item') {
  const name = typeof entry === 'string' ? entry : entry.name;
  const rawStem = typeof entry === 'object' && entry.image ? entry.image : (kind === 'skill' ? (skillImageOverride[name] || name) : name);
  const fileStem = rawStem.replace(/:/g, '').replace(/ /g, '_');
  const file = /\.(png|jpg|jpeg|webp)$/i.test(fileStem) ? fileStem : `${fileStem}.png`;
  const encoded = encodeURIComponent(file);
  const variants = [
    `${MEDIA_ROOT}thumb/${encoded}/128px-${encoded}`,
    `${MEDIA_ROOT}thumb/${encoded}/256px-${encoded}`,
    `${MEDIA_ROOT}${encoded}`,
    `https://riskofrain2.wiki.gg/wiki/Special:Redirect/file/${encoded}`,
  ];
  // A few icons can be WebP instead of PNG; try actual wiki image-file paths.
  const webp = encodeURIComponent(`${fileStem.replace(/\.(png|jpg|jpeg|webp)$/i,'')}.webp`);
  variants.push(`${MEDIA_ROOT}thumb/${webp}/128px-${webp}`, `${MEDIA_ROOT}${webp}`);
  return [...new Set(variants)];
}
function art(entry,kind='item',extraClass='') {
  const sources=imageSources(entry,kind);
  const title=typeof entry==='string' ? entry : entry.name;
  return `<span class="art ${extraClass} ${typeof entry==='object'?tierCss(entry):''}" title="${escaped(title)}"><img data-art data-urls="${escaped(JSON.stringify(sources))}" src="${escaped(sources[0])}" alt="${escaped(title)} artwork from the Risk of Rain 2 wiki" loading="lazy" decoding="async" referrerpolicy="no-referrer"/><span class="art-fallback" aria-hidden="true">${escaped(title.slice(0,2).toUpperCase())}</span></span>`;
}
function initArtwork(){
  root.querySelectorAll('img[data-art]').forEach(img => {
    const all=JSON.parse(img.dataset.urls);
    let i=0;
    const onError=()=>{
      i++;
      if (i<all.length) img.src=all[i];
      else img.closest('.art')?.classList.add('image-failed');
    };
    img.addEventListener('error',onError);
    img.addEventListener('load',()=>{
      if (img.naturalWidth > 0) img.closest('.art')?.classList.remove('image-failed');
      else onError();
    });
    // Cached broken image requests may fail before handlers are attached.
    if(img.complete && !img.naturalWidth) queueMicrotask(onError);
  });
}
// A consistent newcomer vocabulary is available inline throughout the field manual.
// Tooltips are DOM nodes rather than HTML fragments embedded in data strings;
// matching never runs inside links, controls or existing jargon annotations.
const ALL_TERMS = [...fieldTerms, ...glossary.filter(([term]) => !fieldTerms.some(([name])=>name.toLowerCase()===term.toLowerCase()))];
const TERM_MAP = new Map(ALL_TERMS.map(([term,definition])=>[term.toLowerCase(),{term,definition}]));
const regexQuote = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const jargonPattern = new RegExp(`(?<![\\p{L}\\p{N}])(${ALL_TERMS.map(([x])=>regexQuote(x)).sort((a,b)=>b.length-a.length).join('|')})(?![\\p{L}\\p{N}])`,'giu');
let currentTip=null, pinnedTip=false;
function closeTerm(){const pop=root.querySelector?.('#term-help');if(pop){pop.hidden=true;pop.innerHTML='';}currentTip=null;pinnedTip=false;}
function annotateTerms(){
  const main=root.querySelector?.('main');
  if(!main || !document.createTreeWalker)return;
  const skip='a,input,select,textarea,option,pre,code,svg,script,style,.jargon,.art,.kicker,h1,h2,h3,h4,summary,.sidebar,.term-onboarding';
  const nodes=[];
  const walker=document.createTreeWalker(main,NodeFilter.SHOW_TEXT,{acceptNode(node){
    if(!node.textContent.trim() || node.parentElement?.closest(skip))return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;
  }});
  while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){
    const original=node.textContent;const matches=[...original.matchAll(jargonPattern)];
    if(!matches.length)continue;
    const fragment=document.createDocumentFragment();let last=0;let count=0;
    for(const match of matches){
      if(++count>12)break;const begin=match.index;
      if(begin>last)fragment.append(document.createTextNode(original.slice(last,begin)));
      const span=document.createElement('span');span.className='jargon';
      // Terms inside selectable ability cards remain part of their parent button;
      // mouse/touch still works, while standalone terms are keyboard-focusable.
      if(!node.parentElement?.closest('button')){span.tabIndex=0;span.setAttribute('role','button');span.setAttribute('aria-haspopup','true');span.setAttribute('aria-label',`Explain ${match[0]}`);}
      span.dataset.term=match[0].toLowerCase();span.textContent=match[0];fragment.append(span);
      last=begin+match[0].length;
    }
    fragment.append(document.createTextNode(original.slice(last)));node.replaceWith(fragment);
  }
}
function showTerm(el,pin=false){
  const info=TERM_MAP.get(el?.dataset?.term);const pop=root.querySelector?.('#term-help');
  if(!info||!pop)return;
  currentTip=el;pinnedTip=pin;
  const heading=document.createElement('strong');heading.textContent=info.term;
  const description=document.createElement('p');description.textContent=info.definition;
  const foot=document.createElement('small');foot.textContent='FIELD NOTES  •  ESC TO CLOSE';
  pop.replaceChildren(heading,description,foot);pop.hidden=false;
  const rect=el.getBoundingClientRect();
  const w=Math.min(342,innerWidth-24);const h=pop.getBoundingClientRect().height;
  const left=Math.max(12,Math.min(innerWidth-w-12,rect.left));
  const top=rect.bottom+h+12 < innerHeight ? rect.bottom+10 : Math.max(12,rect.top-h-10);
  pop.style.left=left+'px';pop.style.top=top+'px';pop.style.width=w+'px';
}
const navs = [
 ['home','◆','Overview','START HERE'],['learn','◎','Learning academy','20 LESSONS'],
 ['survivors','♙','Survivors','21'],['builds','▥','Build lab','65 BUILDS'],
 ['items','▦','Item codex',`${ITEMS.length}+`],['hallowed','✧','Hex & Hallowed','25'],
 ['spells','▤','N’tormat spells','7'],['bosses','⚔','Bosses & places','GUIDE'],['procs','◈','Proc guide','21'],
 ['glossary','≡','Glossary','QUICK LOOKUP'],['sources','↗','Sources & credits','WIKI']
];
function sidebar(){
 const prime=['home','builds','survivors','items','bosses','learn'];
 const more=['hallowed','spells','procs','glossary','sources'];
 const navButton=(id)=>{const [_,ico,name,count]=navs.find(n=>n[0]===id);return `<button class="nav ${state.page===id?'active':''}" data-go="${id}" aria-current="${state.page===id?'page':'false'}"><span class="nav-symbol">${ico}</span><span>${escaped(name)}</span><small>${escaped(count)}</small></button>`};
 return `<aside class="sidebar"><button class="logo" data-go="home"><span class="logo-mark">◇</span><span><b>PETRICHOR</b><small>YOUR FIELD MANUAL</small></span></button><div class="nav-label">NAVIGATION</div><nav aria-label="Main navigation">${prime.map(navButton).join('')}</nav><details class="sidebar-more" ${more.includes(state.page)?'open':''}><summary>MORE KNOWLEDGE <span>▾</span></summary><nav aria-label="Advanced guides">${more.map(navButton).join('')}</nav></details><div class="sidebar-note"><span class="glow-dot"></span> YOUR RUN, YOUR BUILD <p>Pick your survivor. Learn the skills. Prioritize items that make your chosen strategy stronger.</p></div><a class="sidebar-wiki" target="_blank" rel="noopener noreferrer" href="${ROOT}Main_Page">Community wiki ↗</a></aside>`;
}
function topbar(){return `<header class="topbar"><div class="breadcrumb"><span>RISK OF RAIN 2</span><b>/</b><strong>${escaped((navs.find(x=>x[0]===state.page)||[])[2]||'Overview')}</strong></div><div class="top-right"><span class="update"><span class="glow-dot"></span> HALLOWED CONCEPTS · OCT 2026</span><button class="btn small-outline" data-action="go-sources">SOURCES ↗</button></div></header>`;}
const heading=(over,title,desc)=>`<div class="pagehead"><div class="kicker">${escaped(over)}</div><h1>${escaped(title)}</h1><p>${escaped(desc)}</p></div>`;
const foot = `<footer class="footer"><span>◇ PETRICHOR FIELD MANUAL · INDEPENDENT FAN PROJECT</span><span>Game and art © respective owners · Data reviewed October 11, 2026 · <a href="${ROOT}Main_Page" target="_blank" rel="noopener">wiki.gg ↗</a></span></footer>`;
function bannerCards(){return `<div class="stats-row"><span><b>${game.survivors.length}</b> survivors</span><span><b>${ITEMS.length}</b> curated regular items</span><span><b>14</b> curses</span><span><b>11</b> Hallowed items</span><span><b>7</b> rituals</span></div>`;}
const DLC_HOME = [
 {title:'RISK OF RAIN 2',subtitle:'THE BASE GAME',year:'2019—2020',wiki:'Risk_of_Rain_2',className:'origin',scene:'Distant Roost',people:['Commando','Huntress','Acrid'],copy:'The crash. The planet. The endless climb. Loot chests, activate teleporters and choose to escape or loop.',features:['11 selectable base survivors','Mithrix and the Moon finale','Classic items, artifacts and looping'],survivorIds:['commando','huntress','acrid','engineer']},
 {title:'SURVIVORS OF THE VOID',subtitle:'EXPANSION 01',year:'2022',wiki:'Survivors_of_the_Void',className:'void',scene:'Siphoned Forest',people:['Railgunner','Void Fiend'],copy:'Harness corrupted loot, master the Void and discover another ending beyond the normal escape.',features:['Railgunner + Void Fiend','Void-tier item conversions','Simulacrum and the Planetarium'],survivorIds:['railgunner','voidfiend']},
 {title:'SEEKERS OF THE STORM',subtitle:'EXPANSION 02',year:'2024',wiki:'Seekers_of_the_Storm',className:'storm',scene:'Prime Meridian',people:['Seeker','CHEF','False Son'],copy:'Follow the Path of the Colossus through new environments, shrines and a second major ending.',features:['Seeker + CHEF + False Son','Halcyon Shrines','False Son and new routes'],survivorIds:['seeker','chef','falseson']},
 {title:'ALLOYED COLLECTIVE',subtitle:'EXPANSION 03',year:'2025',wiki:'Alloyed_Collective',className:'alloy',scene:'Iron Alluvium',people:['Operator','Drifter'],copy:'Command drones or turn scattered junk into strength across mechanical battlefields.',features:['Operator + Drifter','Drone systems and new machinery','Solus encounters and environments'],survivorIds:['operator','drifter']},
 {title:'HALLOWED CONCEPTS',subtitle:'EXPANSION 04 · NEW',year:'2026',wiki:'Hallowed_Concepts',className:'hallowed',scene:'Lurid Basilica',people:['Enforcer','Acolyte'],copy:'Accept dangerous Hexes, earn Hallowed powers, collect N’tormat rituals and endure deadly trials.',features:['Enforcer + Acolyte','14 Hexes + 11 Hallowed items','N’tormat, trials and ritual route'],survivorIds:['enforcer','acolyte']}
];
function home(){
 const featured=['acrid','voidfiend','enforcer','railgunner','loader','engineer'];
 const number=game.survivors.reduce((n,x)=>n+x.builds.length,0);
 return `<section class="landing-hero"><div class="landing-sky"></div><div class="landing-planet" aria-hidden="true"></div><div class="landing-intro"><div class="hero-eyebrow"><span class="orb"></span> TRANSMISSION RECEIVED <span class="line"></span> PETRICHOR V</div><h1>EVERY RUN<br>HAS A <em>PATH.</em></h1><p class="hero-lead">Lost in the item chaos? <strong>I’m here to help you build smarter.</strong> Choose a survivor, learn what their abilities actually do, and discover which items to prioritize to make your strategy work.</p><p class="term-onboarding"><span>ⓘ</span> New to the planet? <b>Hover</b> over glowing dotted terms or <b>tap</b> them on mobile for instant explanations.</p><div class="landing-buttons"><button class="btn primary big" data-go="builds">FIND MY BUILD <span>↗</span></button><button class="btn glass big" data-go="learn">I'M NEW — GUIDE ME <span>→</span></button></div><div class="landing-metrics"><div><b>21</b><span>SURVIVORS</span></div><div><b>${number}</b><span>BUILD PATHS</span></div><div><b>5</b><span>GAME EDITIONS</span></div><div><b>1</b><span>GOAL: SURVIVE</span></div></div></div><div class="landing-character"><div class="hero-portrait portrait-back">${art('Void Fiend','survivor','landing-art')}</div><div class="hero-portrait portrait-mid">${art('Enforcer','survivor','landing-art')}</div><div class="hero-portrait portrait-front">${art('Acrid','survivor','landing-art')}</div><div class="hero-portrait-label">SELECT YOUR SURVIVOR <span>◇</span> MASTER THE PLANET</div></div></section>
 <section class="start-strip" aria-label="Start guide"><div class="start-heading"><span class="kicker">GET STARTED / THREE SIMPLE STEPS</span><h2>Survive with a plan.</h2></div>${[['01','Choose a survivor','See every character, their available skills and how each plays.','survivors'],['02','Select a build','Compare multiple playstyles and their exact skill choices.','builds'],['03','Prioritize your loot','Know your core items, suggested stacks and on-hit synergy.','items']].map(([n,t,d,page])=>`<button class="start-step" data-go="${page}"><span class="start-num">${n}</span><span><strong>${t}</strong><small>${d}</small></span><b>↗</b></button>`).join('')}</section>
 <section class="landing-section" id="expansions"><div class="landing-heading"><div><span class="kicker">THE FULL EXPERIENCE / 2019—2026</span><h2>One planet. Five chapters.</h2><p>Explore the base game and all four expansions. Every survivor shown below is available in the Build Lab, with specialized loadouts and item priorities.</p></div><a href="${wiki('Expansions')}" target="_blank" rel="noopener noreferrer" class="text-link">EXPANSIONS ON WIKI ↗</a></div>
 <div class="dlc-gallery">${DLC_HOME.map((d,i)=>`<article class="dlc-card ${d.className} ${i===0?'dlc-wide':''}"><div class="dlc-card-art"><div class="dlc-stage">${art(d.scene,'destination','dlc-scene-art')}</div><div class="dlc-faces">${d.people.map(n=>art(n,'survivor','dlc-face')).join('')}</div></div><div class="dlc-text"><div class="dlc-eyebrow"><span>${escaped(d.subtitle)}</span><small>${d.year}</small></div><h3>${escaped(d.title)}</h3><p>${escaped(d.copy)}</p><div class="dlc-features">${d.features.map(f=>`<span>✦ ${escaped(f)}</span>`).join('')}</div><div class="dlc-survivors">${d.survivorIds.map(id=>{const s=game.survivors.find(x=>x.id===id);return `<button data-action="goto-survivor-build" data-id="${id}" title="Open ${escaped(s.name)} builds">${art(s.name,'survivor','dlc-small-avatar')}<span>${escaped(s.name)}</span></button>`}).join('')}</div><a class="dlc-wiki" href="${ROOT}${d.wiki}" rel="noopener noreferrer" target="_blank">DLC DETAILS ON WIKI ↗</a></div></article>`).join('')}</div></section>
 <section class="landing-section"><div class="landing-heading"><div><span class="kicker">THE BUILDER / PRACTICAL STRATEGY</span><h2>Your next run starts here.</h2><p>Try a featured survivor. Select a build to see all skill icons, the eight most important items, stacking guidance and a proc breakdown.</p></div><button class="btn outline" data-go="builds">ALL 21 SURVIVORS ↗</button></div><div class="landing-featured">${featured.map(id=>{const s=game.survivors.find(x=>x.id===id);return `<button class="landing-survivor" data-action="goto-survivor-build" data-id="${id}">${art(s.name,'survivor','landing-survivor-pic')}<strong>${escaped(s.name)}</strong><small>${s.builds.length} STRATEGIES</small><span>VIEW BUILDS →</span></button>`}).join('')}</div></section>
 <section class="landing-last"><div><span class="kicker">FIELD MANUAL / KNOWLEDGE IS SURVIVAL</span><h2>Not sure what that item does?</h2><p>Use the item codex for explanations, the proc lab for attack efficiency, and the encounter atlas to prepare for bosses, hidden stages and trials. The guide stays with you from your first chest to your final fight.</p><div class="landing-buttons"><button class="btn primary" data-go="items">BROWSE ITEMS ↗</button><button class="btn glass" data-go="bosses">BOSSES & TRIALS →</button></div></div><div class="last-emblem">◇<span>RISK OF RAIN 2<br>FIELD INTELLIGENCE</span></div></section><div class="home-disclaimer">Unofficial fan-made build companion. Game names and artwork belong to their respective owners. Art and mechanics linked to the <a href="${ROOT}Main_Page" target="_blank" rel="noopener noreferrer">Risk of Rain 2 wiki ↗</a>. Build priorities are editorial suggestions, not a guarantee of optimal results.</div>`;
}
function learn(){
 const selected=chapters.find(c=>c.id===state.chapter)||chapters[0];
 const complete=state.lessons.length;
 return heading('ACADEMY / LEARN AT YOUR OWN PACE','The survival handbook','Short beginner-friendly lessons, a glossary and a quick self-test. Mark lessons complete as you read.')+
 `<div class="learn-layout"><aside class="lesson-list panel"><div class="panel-top"><div><div class="kicker">20 MINI LESSONS</div><h3>Course index</h3></div><b class="counter">${complete}/${chapters.length}</b></div><div class="progress"><i style="width:${100*complete/chapters.length}%"></i></div>${chapters.map(c=>`<button class="lesson-link ${selected.id===c.id?'active':''}" data-action="chapter" data-chapter="${c.id}"><b>${c.icon}</b><span>${escaped(c.title)}<small>${escaped(c.category)}</small></span>${state.lessons.includes(c.id)?'<i>✓</i>':'<i>›</i>'}</button>`).join('')}</aside>
 <div class="learn-main"><article class="panel lesson-detail"><div class="lesson-kicker"><span>${escaped(selected.category)}</span><span>READ · ${selected.time}</span></div><h2>${escaped(selected.title)}</h2><p class="lead">${escaped(selected.intro)}</p><div class="explain-list">${selected.steps.map(([name,body],i)=>`<div class="explain-step"><span class="step-num">${String(i+1).padStart(2,'0')}</span><div><h3>${escaped(name)}</h3><p>${escaped(body)}</p></div></div>`).join('')}</div><div class="lesson-tip"><b>◆ FIELD TIP</b><p>${escaped(selected.tip)}</p></div><div class="lesson-actions"><a href="${wiki(selected.wiki)}" target="_blank" rel="noopener noreferrer" class="btn outline">OPEN WIKI ↗</a><button class="btn ${state.lessons.includes(selected.id)?'outline':'primary'}" data-action="toggle-lesson" data-chapter="${selected.id}">${state.lessons.includes(selected.id)?'✓ LESSON COMPLETE':'MARK AS LEARNED ✓'}</button></div></article>${quiz()}</div></div>`;
}
function quiz(){const q=quickQuiz[state.quizPos%quickQuiz.length]; const pick=state.quizAnswers[state.quizPos];
 return `<section class="panel quiz"><div class="panel-top"><div><div class="kicker">TEST YOUR KNOWLEDGE</div><h2>Field exam</h2></div><span class="counter">${state.quizPos+1}/${quickQuiz.length}</span></div><h3>${escaped(q.q)}</h3><div class="quiz-choices">${q.options.map((o,i)=>`<button ${pick!==undefined?'disabled':''} class="quiz-option ${pick===i?(i===q.correct?'good':'bad'):''} ${pick!==undefined&&i===q.correct?'correct':''}" data-action="answer" data-index="${i}"><span>${'ABC'[i]}</span>${escaped(o)}</button>`).join('')}</div>${pick!==undefined?`<div class="quiz-feedback">${pick===q.correct?'✓ Correct!':'Not quite.'} ${escaped(q.why)}</div>`:''}<div class="lesson-actions"><button class="btn low" data-action="next-question">NEXT QUESTION →</button></div></section>`;
}
function roster(){let q=state.survivorQuery.toLowerCase().trim();const matching=game.survivors.filter(s=>(s.name+' '+s.role+' '+s.dlc).toLowerCase().includes(q));
 return heading('CHARACTERS / WHO DO YOU PLAY?','The survivor roster','21 characters including secret Heretic. Click any portrait for skills, playstyle, and three or four carefully differentiated item builds.')+
 `<div class="toolbar"><label class="searchbox">⌕ <input id="survivor-search" value="${escaped(state.survivorQuery)}" placeholder="Search survivors or playstyle…" /></label><span class="muted small">${matching.length} matching survivors</span></div><div class="roster-grid">${matching.map(s=>`<button class="roster-card ${state.survivor===s.id?'selected':''}" data-action="pick-survivor" data-id="${s.id}">${art(s.name,'survivor','roster-art')}<strong>${escaped(s.name)}</strong><small>${escaped(s.role)}</small><span>${escaped(s.dlc)}</span></button>`).join('')}</div>${survivorDetail()}`;
}
function skillLabels(s){return s.id==='mult'?['PRIMARY WEAPON A','SECONDARY','UTILITY','SPECIAL','PRIMARY WEAPON B']:s.skills.length===5?['PASSIVE','PRIMARY','SECONDARY','UTILITY','SPECIAL']:['PRIMARY','SECONDARY','UTILITY','SPECIAL'];}
function skillSelection(s,b){return s.skills.map((opts,i)=>opts[Math.min(opts.length-1,(state.skills[s.id]||{})[i]??b.skillChoices[i]??0)]).filter(Boolean)}
function skillCards(s,b){
 const labels=skillLabels(s);
 const selected=state.skills[s.id]||{};
 return `<div class="skill-cards">${s.skills.map((options,i)=>{
   const ix=Math.min(options.length-1,selected[i]??b.skillChoices[i]??0);
   return `<div class="skill-slot"><div class="skill-slot-head"><strong>${labels[i]||'SKILL'}</strong><span>${options.length>1?'CHOOSE ONE':'FIXED ABILITY'}</span></div><div class="skill-options">${options.map((op,j)=>`<div class="skill-option ${ix===j?'chosen':''}"><button class="skill-option-main" aria-pressed="${ix===j}" data-action="pick-skill" data-slot="${i}" data-index="${j}">${art(op,'skill','ability-art')}<span class="skill-option-body"><b>${escaped(op)}</b><small>${escaped(skillExplain(op))}</small><span class="ability-mini-stat">${procBySkill[op]?`PROC ${escaped(procBySkill[op])}`:'PROC: CHECK WIKI'}</span></span><span class="skill-check">${ix===j?'✓':'○'}</span></button><a href="${wiki(s.name)}#${enc(op)}" target="_blank" rel="noopener noreferrer" class="skill-wiki" title="Verify ${escaped(op)} on the wiki">WIKI ↗</a></div>`).join('')}</div></div>`;
 }).join('')}</div>`;
}
function abilityDeepDive(s,b){
 const selected=skillSelection(s,b);
 const labels=skillLabels(s);
 return `<div class="ability-detail-grid">${selected.map((name,i)=>{
 const meta=abilityDetails[name]||{};
 const supported=Boolean(procBySkill[name]);
 const recommendation=b.priority.filter(x=>(meta.good||[]).includes(x.name)).slice(0,3);
 return `<article class="ability-detail"><div class="ability-detail-title">${art(name,'skill','ability-detail-art')}<div><small>${labels[i]||'ABILITY'}</small><h4>${escaped(name)}</h4></div></div><p>${escaped(skillExplain(name))}</p><div class="ability-stat-row"><span>PROC COEFFICIENT</span><b>${supported?escaped(procBySkill[name]):'Not yet verified'}</b></div>${meta.damage?`<div class="ability-stat-row"><span>DAMAGE</span><b>${escaped(meta.damage)}</b></div>`:''}${meta.charge?`<div class="ability-stat-row"><span>CHARGE / TIMING</span><b>${escaped(meta.charge)}</b></div>`:''}${meta.notes?.length?`<ul class="ability-note-list">${meta.notes.map(t=>`<li>${escaped(t)}</li>`).join('')}</ul>`:''}<div class="ability-synergy"><b>ITEM SYNERGY</b><div class="ability-synergy-items">${(recommendation.length?recommendation:b.priority.slice(0,2)).map(e=>`<div>${art(FIND.get(e.name)||e.name)}<span>${escaped(e.name)}<small>${escaped(e.why)}</small></span></div>`).join('')}</div></div><a href="${wiki(s.name)}" target="_blank" rel="noopener noreferrer">FULL SKILL DESCRIPTION & COOLDOWN ON WIKI ↗</a></article>`;
 }).join('')}</div>`;
}
function perBuildProcStrategy(s,b){
 const guide=survivorProcGuides[s.name];
 const selected=skillSelection(s,b);
 const withCoeff=selected.map(name=>({name,coef:procBySkill[name]})).filter(x=>x.coef);
 const onhitNames=['Tri-Tip Dagger','AtG Missile Mk. 1','Ukulele','Sticky Bomb','Stun Grenade','Polylute','Leeching Seed','Harvester\'s Scythe','Sanguine Chalice','Predatory Instincts','Shattering Justice','57 Leaf Clover'];
 const burstNames=['Kjaro\'s Band','Runald\'s Band','Crowbar','Focus Crystal','Armor-Piercing Rounds'];
 const onhit=b.priority.filter(x=>onhitNames.includes(x.name));
 const burst=b.priority.filter(x=>burstNames.includes(x.name));
 const currentAttack=(state.procAttack && withCoeff.some(x=>x.name===state.procAttack))?state.procAttack:(withCoeff[0]?.name||'');
 const raw=procBySkill[currentAttack]||'';
 const numerical=(raw.match(/(?:^|\s)([0-9]+(?:\.[0-9]+)?)/)||[])[1];
 const coef=numerical?Number(numerical):null;
 const chance=coef===null?null:Math.min(100,10*Math.max(0,state.procDaggers||0)*coef);
 return `<section class="panel padding spacing proc-panel"><div class="panel-top"><div><div class="kicker">06 / MAKE EACH ATTACK COUNT</div><h2>Proc optimization for ${escaped(s.name)}</h2></div><span class="tag green">WIKI-BASED COMBAT MATH</span></div>
 <p class="muted">The <b>proc coefficient</b> changes how frequently or how strongly eligible on-hit items activate. <a href="${ROOT}Proc_Coefficient" target="_blank" rel="noopener noreferrer">Original wiki formula ↗</a></p>
 <div class="proc-coach-grid"><div class="proc-coach"><span>THE ENGINE</span><p>${escaped(guide.engine)}</p></div><div class="proc-coach"><span>BEST HITS</span><p>${escaped(guide.attack)}</p></div><div class="proc-coach"><span>HOW TO MAXIMIZE</span><p>${escaped(guide.maximize)}</p></div><div class="proc-coach caution"><span>COMMON MISTAKE</span><p>${escaped(guide.avoid)}</p></div></div>
 <div class="proc-attack-list">${selected.map(name=>`<div class="proc-attack-chip">${art(name,'skill')}<span><b>${escaped(name)}</b><small>${procBySkill[name]?escaped(procBySkill[name]):'Coefficient not verified yet'}</small></span></div>`).join('')}</div>
 <div class="proc-match"><div class="kicker">YOUR CURRENT BUILD: ${escaped(b.title.toUpperCase())}</div><p>${onhit.length?`<b>Frequent-hit synergy:</b> ${onhit.map(x=>escaped(x.name)).join(' + ')}. ${escaped(onhit[0].why)}`:'Your current item path emphasizes mobility, defense or other damage engines; not every build is designed around repeated on-hit rolls.'}</p>${burst.length?`<p><b>Burst synergy:</b> ${burst.map(x=>escaped(x.name)).join(' + ')}. Big qualifying skill hits get more value from single-hit modifiers.</p>`:''}<p><b>Build rotation:</b> ${escaped(b.how)}</p></div>
 <div class="proc-calculator"><div><div class="kicker">BLEED CHANCE / INTERACTIVE EXAMPLE</div><h3>What do extra Tri-Tip Daggers do?</h3><p>${escaped(procIntro.rule)}</p><div class="proc-facts"><span>Critical strikes <b>do not</b> multiply proc chance.</span><span>Multiple pellets = multiple rolls, not one enormous roll.</span></div></div><div class="proc-controls"><div class="proc-value"><button data-action="proc-minus" aria-label="Remove one Tri-Tip Dagger">−</button><div><b>×${state.procDaggers||0}</b><small>Tri-Tip Daggers</small></div><button data-action="proc-plus" aria-label="Add one Tri-Tip Dagger">+</button></div>${withCoeff.length?`<label class="proc-label">ATTACK FOR EXAMPLE<select id="proc-attack">${withCoeff.map(x=>`<option value="${escaped(x.name)}" ${currentAttack===x.name?'selected':''}>${escaped(x.name)}</option>`).join('')}</select></label>`:'<div class="help">This survivor’s skills do not yet have verified proc numbers here; see the full wiki entry.</div>'}<div class="proc-result">${chance===null?'<b>—</b><small>No verified coefficient for selected skill</small>':`<b>${chance.toFixed(1)}%</b><small>Bleed chance per eligible hit with ${escaped(currentAttack)} (first hit coefficient only)</small>`}</div><small class="help">Multi-hit counts are not multiplied into this per-hit chance. Bleed duration and unusual items use additional rules.</small></div></div>
 </section>`;
}
function procsPage(){return heading('PROC ACADEMY / 21 SURVIVORS','Master on-hit efficiency','Understand per-hit proc coefficients, hit frequency, status effects, and the best attack-and-item strategy for each survivor. Read the wiki-linked mechanics before stacking.')+
 `<section class="panel padding"><h2>What is a proc?</h2><p>${escaped(procIntro.rule)}</p><p>${escaped(procIntro.crit)}</p><div class="proc-examples"><div><b>0.6 proc</b><span>One dagger = 6% bleed per hit</span></div><div><b>1.0 proc</b><span>One dagger = 10% bleed per hit</span></div><div><b>3.0 proc</b><span>One dagger = 30% bleed per hit</span></div></div><p class="help">For simple 10% chance-per-stack Tri-Tip Dagger. As always, check actual item mechanics and patch notes.</p><a href="${ROOT}Proc_Coefficient" target="_blank" rel="noopener noreferrer">OPEN THE WIKI’S COMPLETE PROC TABLE ↗</a></section><div class="proc-guide-grid">${game.survivors.map(s=>{const g=survivorProcGuides[s.name];return `<article class="panel proc-guide-card"><div class="proc-guide-title">${art(s.name,'survivor','proc-survivor-art')}<div><h3>${escaped(s.name)}</h3><small>${escaped(s.role)}</small></div></div><p>${escaped(g.engine)}</p><div class="proc-guide-highlight"><b>HOW TO MAXIMIZE</b><p>${escaped(g.maximize)}</p></div><p class="proc-avoid"><b>AVOID:</b> ${escaped(g.avoid)}</p><button class="btn outline full" data-action="goto-survivor-build" data-id="${s.id}">OPEN ${escaped(s.name.toUpperCase())} BUILDS →</button></article>`}).join('')}</div>`;}
function selectedSkillPreview(s,b){const labels=skillLabels(s);return `<div class="loadout-visual">${skillSelection(s,b).map((op,i)=>`<div class="selected-skill">${art(op,'skill','selected-art')}<span><small>${labels[i]||'SKILL'}</small><b>${escaped(op)}</b></span></div>`).join('')}</div>`;}
function buildSelector(s){return `<div class="build-presets">${s.builds.map((b,i)=>{
  const skillNames=s.skills.map((opts,j)=>opts[b.skillChoices[j]||0]);
  return `<button class="build-select ${i===state.preset?'on':''}" data-action="preset" data-index="${i}"><span class="kicker">PATH 0${i+1} · ${escaped(b.style)}</span><strong>${escaped(b.title)}</strong><small>${escaped(b.desc)}</small><div class="preset-art-title">RECOMMENDED ABILITIES</div><div class="preset-icons">${skillNames.map(op=>art(op,'skill','preset-art')).join('')}</div><div class="preset-art-title">CORE ITEMS</div><div class="preset-icons">${b.core.map(n=>art(FIND.get(n)||n,'item','preset-art')).join('')}</div><span class="preset-foot"><em>${escaped(b.difficulty)}</em><b>${i===state.preset?'✓ CURRENT BUILD':'VIEW LOADOUT ↗'}</b></span></button>`;
 }).join('')}</div>`;}
function survivorDetail(){const s=selectedSurvivor(),b=activeBuild();return `<section class="survivor-detail panel"><div class="survivor-info"><div><div class="kicker">SURVIVOR PROFILE / ${escaped(s.dlc.toUpperCase())}</div><h2>${escaped(s.name.toUpperCase())}</h2><p class="survivor-quote">${escaped(s.tagline)}</p><p>${escaped(s.desc)}</p><div class="tag green">${escaped(s.role)}</div></div>${art(s.name,'survivor','hero-survivor')}</div><div class="two-panel"><div><h3>RECOMMENDED SKILL LOADOUT</h3><p class="micro-muted">Choose an ability by clicking its picture. The recommended selection changes with your build preset.</p>${skillCards(s,b)}</div><div><h3>${s.builds.length} BUILD PATHS</h3>${buildSelector(s)}<button class="btn primary full" data-go="builds">SEE ITEMS AND STACK TARGETS →</button></div></div></section>`;}
function itemCompact(n,opts={}){const item=FIND.get(n)||{name:n,tier:'white',desc:'Read item details on the wiki.'};return `<button class="item-compact ${tierCss(item)}" data-action="inspect" data-name="${escaped(n)}">${art(item)}<span><b>${escaped(n)}</b><small>${escaped(niceTier(item))}</small></span>${opts.add?`<i title="Add to inventory">+</i>`:''}</button>`;}
function uniqueMechanic(s,b){
 if(s.id==='voidfiend'){
 const pairs=[['PRIMARY','Drown','Corrupted Drown','Long-range 300% beam; 1.0 proc.','Short-range 2000%/s beam; 0.625 per tick.'],['SECONDARY','Flood','Corrupted Flood','Charge a projectile.','Fast damaging corrupted projectile.'],['UTILITY','Trespass','Corrupted Trespass','Invulnerable upward arc; cleanses debuffs.','Invulnerable fast forward movement; cleanses debuffs.'],['SPECIAL','Suppress','Corrupted Suppress','Spend 25% Corruption to heal 25% maximum health.','Spend 25% maximum health to gain 25% Corruption.']];
 return `<section class="form-swap"><div class="corruption-primer"><div class="kicker">VOID FIEND / BEGINNER FIELD NOTES</div><h3>What is Corruption?</h3><p><b>Corruption is Void Fiend’s special 0–100% power meter</b> — it is not health, poison or an ordinary debuff. While Controlled, the meter fills over time. Reaching 100% changes Void Fiend automatically into its powerful Corrupted form. The meter then drains; when it reaches its minimum, Void Fiend transforms back.</p><div class="corruption-track"><div class="corruption-meter" style="width:${state.voidMode==='corrupted'?'100':'42'}%"></div></div><div class="corruption-axis"><span>0% / CONTROLLED</span><span>100% / TRANSFORM</span></div><div class="corruption-switch"><button class="${state.voidMode==='controlled'?'on':''}" data-action="void-mode" data-mode="controlled" aria-pressed="${state.voidMode==='controlled'}">◇ Explore CONTROLLED</button><button class="${state.voidMode==='corrupted'?'on':''}" data-action="void-mode" data-mode="corrupted" aria-pressed="${state.voidMode==='corrupted'}">✦ Explore CORRUPTED</button></div><div class="corruption-advice">${state.voidMode==='corrupted'?'<b>CORRUPTED:</b> +100 armor, short-range heavy damage, and a changing set of four skills. Corrupted Suppress spends 25% maximum health to add 25% Corruption, helping you stay transformed.':'<b>CONTROLLED:</b> Safer ranged damage and access to healing. Suppress spends 25% Corruption to restore 25% maximum health, letting you delay transformation.'}</div><div class="corruption-lessons"><span><b>+3% / sec</b> meter while Controlled (baseline)</span><span><b>−6.67% / sec</b> while Corrupted (baseline)</span><span><b>+2% min</b> per Void item</span><span><b>Crits fill</b> • healing drains</span></div><p class="micro-muted">Numbers are baseline wiki values. Damage taken, critical hits, healing and Void items change the timing. The meter is illustrative, not synchronized to your game. Hover or tap the dotted terms for help.</p></div><div class="form-head"><span class="kicker">SPECIAL SURVIVOR MECHANIC</span><h3>Two forms. One fixed loadout.</h3><p>Void Fiend does not equip alternate starting skills. Its abilities transform automatically with the Corruption meter. Your three build paths change <b>item priorities and combat strategy</b> — not selectable skills.</p></div><div class="form-columns"><div class="form-column controlled"><strong>CONTROLLED FORM</strong><small>Safer range • healing • control</small>${pairs.map(p=>`<div class="form-skill">${art(p[1],'skill')}<div><span>${p[0]}</span><b>${p[1]}</b><p>${p[3]}</p></div></div>`).join('')}</div><div class="form-column corrupted"><strong>CORRUPTED FORM</strong><small>High damage • aggressive • short range</small>${pairs.map(p=>`<div class="form-skill">${art(p[2],'skill')}<div><span>${p[0]}</span><b>${p[2]}</b><p>${p[4]}</p></div></div>`).join('')}</div></div><div class="form-facts"><span><b>+2%</b> minimum Corruption per Void item</span><span><b>+2% × proc</b> Corruption on critical hits</span><span><b>− Corruption</b> from healing</span><span><b>+100 armor</b> in corrupted form</span></div><a target="_blank" rel="noopener noreferrer" href="${wiki('Void Fiend')}">VERIFY VOID FIEND MECHANICS ON THE WIKI ↗</a></section>`;
 }
 if(s.id==='mult')return `<div class="notice special-note"><b>MUL-T weapon setup:</b> Configure both Primary Weapon A and Primary Weapon B. Retool swaps between them; Power Mode fires both. These are two real loadout slots, not a passive or second copy of the Secondary skill.</div>`;
 if(s.id==='heretic')return `<div class="notice special-note"><b>Secret character:</b> Heretic cannot be chosen in the normal survivor lobby. Collect all four Heresy items during a run to transform into her. These builds describe your item strategy after transformation.</div>`;
 return '';
}
function builds(){
 const s=selectedSurvivor(),b=activeBuild(),bag=Object.entries(state.bag).filter(([,count])=>count>0);
 const slotNames=skillLabels(s);
 const preferred=skillSelection(s,b);
 return heading('65 STRATEGY PATHS / 21 SURVIVORS',`${s.name} build laboratory`,'Pick a survivor, then a playstyle. See the recommended skills, highest-priority items, stacking goals and the logic behind every choice.')+
 `<section class="panel buildbar"><div class="buildbar-top"><div class="kicker">01 / ALL SURVIVORS — CLICK A PORTRAIT TO CHANGE CHARACTER</div><span class="tag green">${game.survivors.length} SURVIVORS</span></div><div class="all-survivor-grid">${game.survivors.map(v=>`<button class="survivor-pick ${v.id===s.id?'active':''}" data-action="pick-survivor" data-id="${v.id}" aria-pressed="${v.id===s.id}">${art(v.name,'survivor','pick-art')}<span>${escaped(v.name)}</span><small>${escaped(v.dlc==='Base game'?'BASE':v.dlc)}</small></button>`).join('')}</div></section>
 <section class="panel featured-survivor-banner">${art(s.name,'survivor','featured-survivor-art')}<div><div class="kicker">SELECTED CHARACTER</div><h2>${escaped(s.name)}</h2><p>${escaped(s.role)} · ${escaped(s.dlc)}</p><small>${escaped(s.desc)}</small></div></section>
 <div class="build-jump"><a href="#choose-build">01 BUILDS</a><a href="#choose-skills">02 SKILLS</a><a href="#choose-items">03 ITEMS</a><a href="#how-to-play">04 GAME PLAN</a></div><div class="build-columns"><div>
 <div class="section-top tight" id="choose-build"><div><div class="kicker">02 / SELECT AN OPTIMIZATION</div><h2>${s.builds.length} ways to play ${escaped(s.name)}</h2></div></div>
 ${buildSelector(s)}
 <section class="panel padding" id="choose-skills"><div class="panel-top"><div><div class="kicker">03 / SKILLS THAT MATCH YOUR BUILD</div><h2>Recommended loadout</h2></div><span class="tag">${escaped(b.difficulty.toUpperCase())}</span></div><p class="muted">These are the skills selected for <b>${escaped(b.title)}</b>. Swapping a skill can make some items less useful.</p>${uniqueMechanic(s,b)}${selectedSkillPreview(s,b)}${skillCards(s,b)}<details class="deep-dive"><summary><span>◈</span><b>ABILITY INTELLIGENCE</b><small>Exact proc values, skill mechanics & item interactions</small><i>▾</i></summary>${abilityDeepDive(s,b)}</details></section>
 <section class="panel padding spacing" id="choose-items"><div class="panel-top"><div><div class="kicker">04 / ITEM PRIORITY & STACKING</div><h2>Items that maximize this strategy</h2></div><span class="tag">${b.items.length} RECOMMENDATIONS</span></div>
 <p class="muted">Top three are the <b>core engine</b>; the rest improve damage, mobility, safety or a late-game payoff. Suggested stack counts are rough planning goals, not hard caps or guaranteed optimal quantities.</p>
 <div class="priority-core-callout"><span>THE CORE ENGINE</span><div>${b.core.map(n=>`<button class="core-bundle-item" data-action="inspect" data-name="${escaped(n)}">${art(FIND.get(n)||n)}<b>${escaped(n)}</b></button>`).join('')}</div><small>Grab these when offered — then follow the ordered list below for alternatives and stacking.</small></div><div class="item-priority-list">${b.priority.map((entry,i)=>{const it=FIND.get(entry.name)||{name:entry.name,tier:'white'};return `<div class="priority-row ${i<3?'essential':''}"><div class="priority-rank">${String(i+1).padStart(2,'0')}</div><button class="priority-art" data-action="inspect" data-name="${escaped(entry.name)}">${art(it)}</button><div class="priority-description"><div class="priority-title"><b>${escaped(entry.name)}</b>${i<3?'<span class="core-label">CORE</span>':''}<span class="rarity-mini">${escaped(niceTier(it))}</span></div><p>${escaped(entry.why)}</p><small><b>Stacks:</b> ${escaped(entry.target)}</small></div><button class="priority-add" aria-label="Add ${escaped(entry.name)} to inventory" data-action="bag-plus" data-name="${escaped(entry.name)}">+ ADD</button></div>`}).join('')}</div>
 <div class="toolbar bottom"><button class="btn primary" data-action="add-core">+ ADD CORE 3</button><button class="btn outline" data-action="add-build">+ ADD ALL 8 (1× EACH)</button><button class="btn outline" data-go="items">ITEM CODEX ↗</button></div></section>
 <section class="panel padding spacing" id="how-to-play"><div class="panel-top"><div><div class="kicker">05 / HOW TO PLAY IT</div><h2>The actual combat loop</h2></div></div><p class="build-combo">${escaped(b.how)}</p><div class="strategy-columns"><div class="strategy-good"><b>WHY THIS WORKS</b><p>${escaped(b.desc)}</p></div><div class="strategy-bad"><b>TRADE-OFF / WATCH OUT</b><p>${escaped(b.risk)}</p></div></div><p class="micro-muted">Item effects and exact caps can change with patches. Read the wiki for full formulas and procurement rules.</p><a href="${wiki(s.name)}" target="_blank" rel="noopener" class="btn outline">VERIFY SKILLS ON WIKI ↗</a></section><details class="deep-dive proc-dive"><summary><span>✦</span><b>PROC OPTIMIZATION</b><small>Maximize on-hit effects and calculate bleed chance</small><i>▾</i></summary>${perBuildProcStrategy(s,b)}</details>
 </div><aside class="build-right"><section class="panel padding sticky"><div class="panel-top"><div><div class="kicker">YOUR CURRENT PLAN</div><h2>Item inventory <span class="muted">(${bag.reduce((a,[,c])=>a+c,0)})</span></h2></div><button class="mini" data-action="bag-reset">CLEAR</button></div><div class="invlist">${bag.length?bag.map(([name,qty])=>{const it=FIND.get(name)||{name,tier:'white'};return `<div class="inventory-item">${art(it)}<span>${escaped(name)}<small>${escaped(niceTier(it))}</small></span><button data-action="bag-minus" data-name="${escaped(name)}">−</button><b>×${qty}</b><button data-action="bag-plus" data-name="${escaped(name)}">+</button></div>`}).join(''):'<div class="empty-note">Choose a strategy then add its core items to your collection.</div>'}</div><div class="stack-buttons"><button class="btn primary full" data-action="export">↓ EXPORT BUILD JSON</button><button class="btn outline full" data-action="copy">COPY ITEMS & SKILLS</button><button class="btn outline full" data-action="import">↑ IMPORT BUILD JSON</button></div><div class="help">Your selections are local to this browser. It does not read your game inventory.</div></section></aside></div>`;
}
function itemCard(it, actions=true){return `<article class="item-card ${tierCss(it)}"><button class="item-main" data-action="inspect" data-name="${escaped(it.name)}">${art(it,'item','codex-art')}<div class="item-card-meta"><span class="item-rarity">${escaped(niceTier(it))}</span><h3>${escaped(it.name)}</h3><p>${escaped(it.desc)}</p></div></button>${actions?`<div class="item-card-foot"><span>${escaped(it.role||'Special item')}</span><button data-action="bag-plus" data-name="${escaped(it.name)}">+ ADD</button></div>`:''}</article>`;}
function items(){let q=state.itemQuery.trim().toLowerCase();const src=[...ITEMS,...game.hallowed];const filtered=src.filter(it=>(state.tier==='all'||it.tier===state.tier) && (state.dlc==='all'||(it.dlc||'Base / mixed')===state.dlc) && (!q||`${it.name} ${it.desc} ${it.role}`.toLowerCase().includes(q)));
 return heading('COLLECT • STACK • COMBINE','Item codex','Actual Risk of Rain 2 icon artwork and beginner-friendly explanations. Search by item name, effect, or rarity, and add items to a build.')+
 `<div class="filters-panel"><label class="searchbox">⌕ <input id="item-query" placeholder="Search items, effects, tags…" value="${escaped(state.itemQuery)}" /></label><select id="tier-filter" aria-label="Item rarity">${[['all','Every rarity'],['white','Common / white'],['green','Uncommon / green'],['red','Legendary / red'],['yellow','Boss / yellow'],['lunar','Lunar / blue'],['void','Void / purple'],['equipment','Equipment / orange'],['hallowed','Hallowed / purple']].map(([v,t])=>`<option value="${v}" ${v===state.tier?'selected':''}>${t}</option>`).join('')}</select><span class="tag">${filtered.length} ITEMS FOUND</span></div><div class="notice">This is a large <b>curated catalogue</b>, not a guaranteed complete or live-synced game database. For exact item formulas, click an item and open its wiki entry. Artwork loads from wiki.gg file redirects; missing or blocked wiki images show a labeled fallback with a source link.</div><div class="item-grid">${filtered.length?filtered.map(it=>itemCard(it)).join(''):'<div class="empty-note">No matching items. Try a shorter search.</div>'}</div>`;}
function hallowed(){const hex=state.hallowedTab==='hexes';const arr=hex?game.hexes:game.hallowed;const n=state.hexCount;
 return heading('HALLOWED CONCEPTS / DLC 4','Curses and holy rewards','Hexes are harmful bargains. Hallowed items are possible powerful rewards. The shrine connects them.')+
 `<div class="hallowed-hero"><div class="kicker">THE DEVIL’S DEAL</div><h2>SUFFER A CURSE.<br><span>CLAIM YOUR REWARD.</span></h2><p>You take a Hex from a Concept Reliquary. Its bad effect stays with you. After the Teleporter event, a Hallowed Shrine may let you cleanse curses for item choices.</p><div class="pill-switch"><button class="${hex?'on':''}" data-action="hallowed-tab" data-value="hexes">☠ 14 HEXES</button><button class="${!hex?'on':''}" data-action="hallowed-tab" data-value="rewards">✦ 11 HALLOWED REWARDS</button></div></div>
 <section class="panel padding spacing"><div class="panel-top"><div><div class="kicker">INTERACTIVE EXAMPLE · NOT AN ODDS CALCULATOR</div><h2>How much danger will you accept?</h2></div><b>${n} HEX${n!==1?'ES':''}</b></div><p class="muted">Slide to plan how many curses you would consider holding. More curses may improve potential rewards, but every extra Hex is another downside until cleansed.</p><div class="slider-line"><span>0</span><input type="range" min="0" max="7" value="${n}" id="hex-count" /><span>7</span></div><div class="hex-response"><b>${n===0?'No Hex risk':n<=2?'Low-to-moderate exposure':n<=4?'Significant risk': 'High-risk gamble'}</b><p>${n===0?'No curse downsides to deal with.':n<=2?'Reasonable place to learn the cleansing mechanic; rewards are not guaranteed to be Hallowed.':n<=4?'Multiple curses may compound. Avoid if your health or movement is weak.':'You are stacking many bad effects. More Hallowed reward potential does not erase the danger.'}</p></div><div class="shrine-flow"><span>CONCEPT RELIQUARY</span><b>→</b><span>HEXY STAGE</span><b>→</b><span>TELEPORTER</span><b>→</b><span>HALLOWED SHRINE</span></div></section>
 <div class="panel padding spacing"><div class="panel-top"><div><div class="kicker">${hex?'NEGATIVE EFFECTS':'SPECIAL REWARDS'}</div><h2>${hex?'All 14 Hex curses':'All 11 Hallowed items'}</h2></div><a target="_blank" rel="noopener" href="${wiki('Hallowed_Concepts')}">WIKI SOURCE ↗</a></div><div class="item-grid inside">${arr.map(it=>itemCard(it,!hex)).join('')}</div></div>`;
}
function spells(){const x=game.pages.find(p=>p.name===state.nPage)||game.pages[0],used=state.spellUsed[x.name]||0;
 return heading('HALLOWED CONCEPTS / NEW CURIO','The N’tormat spellbook','Collect a magical Page, equip its spell in the book’s separate slot, and cast powerful rituals. Charges refresh when you reach another stage.')+
 `<div class="book-hero"><div><div class="kicker">AN ANCIENT POWER</div><h2>THE N’TORMAT</h2><p>Different from normal orange Equipment. Pages are rituals. Their effects are helpful, but gathering Pages can also curse future Teleporter events.</p><span class="tag green">7 USABLE SPELLS · PLUS A NON-SPELL SHREDDED PAGE</span></div><div class="book-sigil">✺</div></div><div class="spell-layout"><div class="spell-grid">${game.pages.map(p=>`<button class="spell-tile ${state.nPage===p.name?'on':''}" data-action="select-spell" data-name="${escaped(p.name)}">${art(p,'item','spell-art')}<span><b>${escaped(p.name)}</b><small>${escaped(p.role)}</small></span></button>`).join('')}</div><section class="panel padding spell-detail"><div class="kicker">SELECTED RITUAL</div><div class="spell-head">${art(x,'item','giant')}<div><h2>${escaped(x.name)}</h2><span class="tag">${escaped(x.role)}</span></div></div><p>${escaped(x.desc)}</p><div class="mini-rule"><span>USES IN THIS SIMULATOR</span><strong>${Math.max(0,1-used)} / 1</strong></div><div class="toolbar bottom"><button class="btn primary" data-action="cast-spell" ${used>=1?'disabled':''}>${used>=1?'RITUAL SPENT':'CAST RITUAL'}</button><button class="btn outline" data-action="next-stage">↻ NEXT STAGE (RECHARGE)</button></div><p class="help">Simulation only: actual Pages can have additional charges, stacking behavior and usage restrictions. Next-stage regeneration is the general rule.</p><a href="${wiki(x.wiki)}" target="_blank" rel="noopener">Read spell details on wiki ↗</a></section></div><div class="notice spaced">⚠ <b>Reincarnation:</b> its ordinary effect is fatal. Under special conditions it can access routes. <b>Shredded Page</b> is listed as an additional Page-type item, but does not grant a usable spell.</div>`;
}
function bossesPage(){
 const dest=destinationRoutes.filter(x=>state.destinationFilter==='all'||x.kind.toLowerCase().includes(state.destinationFilter));
 return heading('DESTINATIONS / ENCOUNTERS / N’KUHANA TRIALS','Bosses, stages & challenges','See the boss, learn the route, prepare for the objective and understand the reward. All illustrations use wiki-hosted game-file URLs with links to their original wiki pages.')+
 `<div class="notice"><b>Route finder:</b> The Moon goes to Mithrix; Void Locus leads to the Voidling; green Colossus portals lead to False Son; Shrines of Descent lead to the Anima Harvester. Artifact codes unlock special challenge arenas.</div>
 <div class="section-top"><div><div class="kicker">BOSS FIELD GUIDE</div><h2>${encounterBosses.length} major and special encounters</h2></div></div><div class="encounter-grid">${encounterBosses.map(b=>`<article class="panel encounter-card"><div class="encounter-photo">${art({name:b.name,image:b.image},'boss','encounter-art')}<span>${escaped(b.type)}</span></div><div class="encounter-body"><div class="kicker">${escaped(b.dlc)}</div><h3>${escaped(b.name)}</h3><p class="encounter-where">⌖ ${escaped(b.where)}</p><div class="encounter-section"><b>HOW TO REACH</b><p>${escaped(b.route)}</p></div><div class="encounter-section"><b>HOW TO WIN</b><p>${escaped(b.strategy)}</p></div><div class="encounter-section reward"><b>REWARD / UNLOCK</b><p>${escaped(b.reward)}</p></div><a href="${wiki(b.wiki)}" target="_blank" rel="noopener noreferrer">BOSS IMAGE & FULL MECHANICS ON WIKI ↗</a></div></article>`).join('')}</div>
 <div class="section-top"><div><div class="kicker">N’KUHANA / HALLOWED CONCEPTS</div><h2>The nine Winnowing trials</h2></div><span class="tag">3 REALMS · 9 CHALLENGES</span></div><div class="notice">Find a <b>Ritual Gong</b> on an eligible stage. Its Anima Portal leads to a Winnowing challenge. Trials share a <b>Reckoning</b> timer, temporarily replace your normal items with Ethereal options and can reward a Page plus one permanent item. <a href="${wiki("N'kuhana_Trials")}" target="_blank" rel="noopener">Read the full rules ↗</a></div>
 <div class="trial-realm-grid">${['Predation','Mortality','Survival'].map(type=>`<section class="panel trial-realm"><div class="realm-photo">${art({name:'Winnowing of '+type,image:'Winnowing of '+type},'stage','realm-art')}</div><div class="realm-content"><div class="kicker">HIDDEN REALM / WINNOWING</div><h3>Winnowing of ${type}</h3>${trialChallenges.filter(x=>x[0]===type).map(([c,title,desc],i)=>`<div class="trial-challenge"><b>${String(i+1).padStart(2,'0')} · ${escaped(title)}</b><p>${escaped(desc)}</p></div>`).join('')}<a href="${wiki("N'kuhana_Trials")}" target="_blank" rel="noopener noreferrer">GUIDE TO THESE TRIALS ↗</a></div></section>`).join('')}</div>
 <div class="section-top"><div><div class="kicker">PLACES / ARTIFACTS / ALTERNATE ENDINGS</div><h2>Where should I go next?</h2></div><label class="place-filter">SHOW <select id="destination-filter">${[['all','All places'],['trial','Trials / artifacts'],['hidden','Hidden realms'],['final','Final stages'],['stage','Regular stages'],['ritual','Ritual realms']].map(([v,n])=>`<option value="${v}" ${state.destinationFilter===v?'selected':''}>${n}</option>`).join('')}</select></label></div>
 <div class="destination-grid">${dest.map(d=>`<article class="panel destination-card"><div class="destination-photo">${art({name:d.name,image:d.image},'stage','destination-art')}</div><div class="destination-content"><div class="destination-meta"><small>${escaped(d.kind)}</small><small>${escaped(d.dlc)}</small></div><h3>${escaped(d.name)}</h3><p class="destination-boss">${escaped(d.boss)}</p><b>GET THERE</b><p>${escaped(d.access)}</p><b>THE CHALLENGE</b><p>${escaped(d.objective)}</p><b class="destination-reward">REWARD</b><p>${escaped(d.reward)}</p><a href="${wiki(d.wiki)}" target="_blank" rel="noopener noreferrer">VIEW PLACE & IMAGES ON WIKI ↗</a></div></article>`).join('')}</div>
 <div class="section-top"><div><div class="kicker">DLC CONTENT</div><h2>Which expansion adds what?</h2></div></div><div class="dlc-grid">${expansionCards.map((d,i)=>`<article class="dlc-card"><span>0${i+1} / ${d.year}</span><h3>${escaped(d.title)}</h3><p>${escaped(d.short)}</p><a href="${wiki(d.wiki)}" target="_blank" rel="noopener">READ WIKI ↗</a></article>`).join('')}</div>`;
}
function glossaryPage(){const q=state.glossaryQuery.trim().toLowerCase();const data=ALL_TERMS.filter(([term,desc])=>(term+' '+desc).toLowerCase().includes(q));return heading('THE WORDS YOU KEEP HEARING','Game glossary','What does proc mean? Why does everyone say “loop”? Search unfamiliar game terms here.')+
 `<div class="toolbar"><label class="searchbox">⌕ <input id="glossary-query" placeholder="Search any term…" value="${escaped(state.glossaryQuery)}" /></label><span class="tag">${data.length} DEFINITIONS</span></div><div class="glossary-grid">${data.map(([n,d])=>`<article class="panel glossary-term"><h3>${escaped(n)}</h3><p>${escaped(d)}</p></article>`).join('')}</div>`;}
function sources(){return heading('ACCURACY & ART CREDITS','Sources and methodology','This is an unofficial fan project, not an official game or wiki mirror. The project links to original sources for verification.')+
 `<div class="sources-layout"><section class="panel padding"><div class="kicker">PRIMARY GAMEPLAY REFERENCES</div><h2>Research links</h2><div class="source-list">${[['Risk of Rain 2 wiki main page',ROOT+'Main_Page'],['Items and item tier overview',ROOT+'Items'],['Survivor index',ROOT+'Survivors'],['Hallowed Concepts overview',ROOT+'Hallowed_Concepts'],['Hallowed Shrine',ROOT+'Hallowed_Shrine'],['The N’tormat',ROOT+'The_N%27tormat'],['Karma',ROOT+'Karma'],['Proc coefficient',ROOT+'Proc_Coefficient'],['N’kuhana Trials',ROOT+'N%27kuhana_Trials'],['Environments and hidden realms',ROOT+'Map'],['Engineer / Bouncing Grenades',ROOT+'Engineer'],['Official October 8, 2026 patch notes','https://support.2k.com/hc/en-us/articles/56193476123795-Risk-of-Rain-2-Patch-Notes-October-8-2026']].map(([name,u])=>`<a target="_blank" rel="noopener noreferrer" href="${u}">${escaped(name)} <b>↗</b></a>`).join('')}</div></section><section class="panel padding"><div class="kicker">REAL IN-GAME ART</div><h2>Where images come from</h2><p>Survivor portraits, skill images, items, Hexes, Hallowed items and spell images all use <a href="${ROOT}Category%3AImages" target="_blank" rel="noopener">riskofrain2.wiki.gg file redirects ↗</a>. Official expansion promo art is linked from Epic Games Store. New wiki files may not be available immediately.</p><p>All art and characters remain the property of the respective copyright holders. These images are loaded remotely, <b>not packaged as owned or original art</b>. On networks blocking the image hosts, the site uses readable text fallback cards.</p><p>This is not a license to reuse any artwork commercially. Check individual asset licenses and rights before publishing publicly.</p></section><section class="panel padding"><div class="kicker">EDITORIAL STANDARDS</div><h2>Facts vs builds</h2><p>Game mechanics, effects, stage systems and DLC terminology are summarized from the linked wiki. Build recommendations are <b>subjective strategy suggestions</b>, not official tier lists or scientifically determined best builds.</p><p>The wiki itself marks some newly released Hallowed Concepts material as under construction. Verify balance numbers in the current build and check new patches. The site is a searchable curated guide, not a complete live game database or an API mirror.</p></section><section class="panel padding"><div class="kicker">DEVELOPER INFORMATION</div><h2>Built for Vercel</h2><p>Zero runtime dependencies. The project is written in plain modular JavaScript, CSS, JSON and Node’s built-in build server. It deploys as static HTML/JS/CSS. Saved lessons and inventories live only in your browser’s localStorage.</p></section></div>`;}
function detailModal(){const item=FIND.get(state.modal);if(!item)return '';return `<div class="overlay" role="presentation" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-label="${escaped(item.name)} details"><button class="close" data-action="close-modal" aria-label="Close details">×</button>${art(item,'item','modal-icon')}<div class="kicker">${escaped(niceTier(item))} · ITEM DETAILS</div><h2>${escaped(item.name)}</h2><p>${escaped(item.desc)}</p>${item.note?`<div class="lesson-tip"><b>WHY PICK IT?</b><p>${escaped(item.note)}</p></div>`:''}${item.danger?`<p class="warning">Curse severity: ${item.danger}/5 — an editorial rating, not a game statistic.</p>`:''}<div class="modal-actions"><a class="btn outline" href="${wiki(item.wiki||item.name)}" target="_blank" rel="noopener noreferrer">DETAILS ON WIKI ↗</a>${item.tier==='hex'||item.tier==='page'?'':`<button class="btn primary" data-action="modal-add" data-name="${escaped(item.name)}">+ ADD TO BUILD</button>`}</div></div></div>`;}
function pageContent(){switch(state.page){case 'learn':return learn();case 'survivors':return roster();case 'builds':return builds();case 'items':return items();case 'hallowed':return hallowed();case 'spells':return spells();case 'bosses':return bossesPage();case 'procs':return procsPage();case 'glossary':return glossaryPage();case 'sources':return sources();default:return home();}}
function render(preserve=false){const scroll=window.scrollY;const active=document.activeElement;const target=active?.id,position=active?.selectionStart;root.innerHTML=`<div class="site">${sidebar()}<div class="content">${topbar()}<main class="page">${pageContent()}</main>${foot}</div></div>${state.modal?detailModal():''}<div id="term-help" class="term-help" role="tooltip" hidden></div>`;initArtwork();annotateTerms();persist();if(preserve){window.scrollTo(0,scroll);if(target){let el=document.getElementById(target);if(el){el.focus();try{el.setSelectionRange(position,position)}catch{}}}}}
function navigate(to){state.page=to;state.modal=null;history.replaceState(null,'',`#${to}`);window.scrollTo(0,0);render()}
function addBag(name,delta=1){state.bag[name]=Math.max(0,(state.bag[name]||0)+delta);if(!state.bag[name])delete state.bag[name];}
function download(name,contents,type='application/json'){const a=document.createElement('a');const url=URL.createObjectURL(new Blob([contents],{type}));a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function exportBuild(asText=false){const s=selectedSurvivor(),payload={app:'Petrichor Field Manual',schema:2,survivor:s.name,style:activeBuild().title,skills:skillSelection(s,activeBuild()),inventory:state.bag};if(asText){const msg=`${s.name} — ${activeBuild().title}\n${activeBuild().desc}\n\nSKILLS:\n${skillSelection(s,activeBuild()).map(n=>`- ${n}`).join('\n')}\n\nITEMS:\n${Object.entries(state.bag).map(([name,n])=>`- ${name} ×${n}`).join('\n')}\n\nWiki: https://riskofrain2.wiki.gg/`;navigator.clipboard?.writeText(msg).then(()=>alert('Copied build to clipboard')).catch(()=>window.prompt('Copy this build:',msg));return;}download(`ror2-${s.id}-build.json`,JSON.stringify(payload,null,2));}
root.addEventListener('click',e=>{
 const termTarget=e.target.closest?.('.jargon');
 if(termTarget?.dataset?.term){e.stopPropagation?.();if(pinnedTip&&currentTip===termTarget)closeTerm();else showTerm(termTarget,true);return;}
 if(pinnedTip&&!e.target.closest?.('#term-help')?.id)closeTerm();
 const button=e.target.closest('[data-go],[data-action]');if(!button)return;
 if(button.dataset.go){navigate(button.dataset.go);return;}
 const a=button.dataset.action;
 if(a==='go-sources'){navigate('sources');return;}
 if(a==='spotlight-acrid'){state.survivor='acrid';navigate('builds');return;}
 if(a==='open-chapter'){state.chapter=button.dataset.chapter;navigate('learn');return;}
 if(a==='chapter'){state.chapter=button.dataset.chapter;render(true);return;}
 if(a==='toggle-lesson'){const id=button.dataset.chapter;state.lessons=state.lessons.includes(id)?state.lessons.filter(x=>x!==id):[...state.lessons,id];render(true);return;}
 if(a==='answer'){if(state.quizAnswers[state.quizPos]===undefined){state.quizAnswers[state.quizPos]=Number(button.dataset.index);render(true)}return;}
 if(a==='next-question'){state.quizPos=(state.quizPos+1)%quickQuiz.length;render(true);return;}
 if(a==='goto-survivor-build'){state.survivor=button.dataset.id;state.preset=0;navigate('builds');return;}
 if(a==='proc-minus'){state.procDaggers=Math.max(0,(state.procDaggers||0)-1);render(true);return;}
 if(a==='proc-plus'){state.procDaggers=Math.min(99,(state.procDaggers||0)+1);render(true);return;}
 if(a==='pick-survivor'){state.survivor=button.dataset.id;state.preset=0;state.skills[state.survivor]={};render(true);return;}
 if(a==='void-mode'){state.voidMode=button.dataset.mode==='corrupted'?'corrupted':'controlled';render(true);return;}
 if(a==='preset'){state.preset=Number(button.dataset.index);state.skills[state.survivor]={};render(true);return;}
 if(a==='pick-skill'){const id=selectedSurvivor().id;if(!state.skills[id])state.skills[id]={};state.skills[id][Number(button.dataset.slot)]=Number(button.dataset.index);render(true);return;}
 if(a==='inspect'){state.modal=button.dataset.name;render(true);return;}
 if(a==='close-modal'){if(e.target===button||button.classList.contains('close')){state.modal=null;render(true)}return;}
 if(a==='bag-plus'||a==='modal-add'){addBag(button.dataset.name);state.modal=null;render(true);return;}
 if(a==='bag-minus'){addBag(button.dataset.name,-1);render(true);return;}
 if(a==='bag-reset'){if(confirm('Clear your build inventory?')){state.bag={};render(true)}return;}
 if(a==='add-build'){activeBuild().items.forEach(n=>addBag(n));render(true);return;}
 if(a==='add-core'){activeBuild().core.forEach(n=>addBag(n));render(true);return;}
 if(a==='export'){exportBuild();return;}
 if(a==='copy'){exportBuild(true);return;}
 if(a==='import'){const raw=window.prompt('Paste an exported build JSON here:');if(!raw)return;try{const obj=JSON.parse(raw);if(!obj.inventory||typeof obj.inventory!=='object'||Array.isArray(obj.inventory))throw Error('Missing inventory');const cleaned={};for(const [key,n] of Object.entries(obj.inventory)){if(!FIND.has(key)||!Number.isInteger(n)||n<0||n>999)continue;cleaned[key]=n;}state.bag=cleaned;const s=game.survivors.find(x=>x.name===obj.survivor);if(s)state.survivor=s.id;render(true)}catch(err){alert('Invalid build JSON. '+err.message)}return;}
 if(a==='hallowed-tab'){state.hallowedTab=button.dataset.value;render(true);return;}
 if(a==='select-spell'){state.nPage=button.dataset.name;render(true);return;}
 if(a==='cast-spell'){state.spellUsed[state.nPage]=1;render(true);return;}
 if(a==='next-stage'){state.spellUsed={};render(true);return;}
});
// A glossary hint can be hovered with a mouse, focused with a keyboard, or tapped on touch screens.
root.addEventListener('pointerover',e=>{const el=e.target.closest?.('.jargon');if(el?.dataset?.term&&!pinnedTip)showTerm(el);});
root.addEventListener('pointerout',e=>{if(!pinnedTip&&e.target.closest?.('.jargon')?.dataset?.term)closeTerm();});
root.addEventListener('focusin',e=>{const el=e.target.closest?.('.jargon');if(el?.dataset?.term&&!pinnedTip)showTerm(el);});
root.addEventListener('focusout',e=>{if(!pinnedTip&&e.target.closest?.('.jargon')?.dataset?.term)closeTerm();});
root.addEventListener('keydown',e=>{
  if(e.target.closest?.('.jargon')&&(e.key==='Enter'||e.key===' ')){
    e.preventDefault();const el=e.target.closest('.jargon');if(pinnedTip&&currentTip===el)closeTerm();else showTerm(el,true);
  }
  if(e.key==='Escape'&&currentTip)closeTerm();
});
root.addEventListener('input',e=>{
 if(e.target.id==='item-query'){state.itemQuery=e.target.value;render(true)}
 else if(e.target.id==='survivor-search'){state.survivorQuery=e.target.value;render(true)}
 else if(e.target.id==='glossary-query'){state.glossaryQuery=e.target.value;render(true)}
 else if(e.target.id==='hex-count'){state.hexCount=Number(e.target.value);render(true)}
});
root.addEventListener('change',e=>{
 if(e.target.id==='tier-filter'){state.tier=e.target.value;render(true)}
 else if(e.target.id==='proc-attack'){state.procAttack=e.target.value;render(true)}
 else if(e.target.id==='destination-filter'){state.destinationFilter=e.target.value;render(true)}
});
window.addEventListener('hashchange',()=>{const p=location.hash.slice(1);if(navs.some(n=>n[0]===p)&&state.page!==p){state.page=p;render();window.scrollTo(0,0)}});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.modal){state.modal=null;render(true)}});
render();
