import d from '../src/data/game.json' with {type:'json'};
import {readFileSync} from 'node:fs';
import {extra} from '../src/data/extra.js';
const assert=(condition,message)=>{if(!condition)throw Error(message)};
for(const key of ['items','survivors','hallowed','hexes','pages'])assert(Array.isArray(d[key]),`Missing ${key}`);
assert(d.survivors.length===21,'Expected 20 regular survivors + Heretic');
assert(d.hexes.length===14&&d.hallowed.length===11&&d.pages.length===7,'Incorrect HC counts');
assert(new Set(d.items.map(i=>i.name)).size===d.items.length,'Duplicate item');
const itemNames = new Set([...d.items,...d.hallowed,...extra].map(x=>x.name));
let count=0;
for (const s of d.survivors) {
 assert(s.builds.length>=3&&s.skills.length>=4,`Incomplete survivor ${s.name}`);
 for(const [i,b] of s.builds.entries()) {
  count++;
  assert(b.items?.length>=8 && b.priority?.length===b.items?.length && b.core?.length===3,`${s.name} build ${i} incomplete items`);
  assert(b.skillChoices?.length===s.skills.length,`${s.name} build ${i} incomplete skills`);
  b.skillChoices.forEach((choice,j)=>assert(Number.isInteger(choice)&&choice>=0&&choice<s.skills[j].length,`${s.name} build ${i} invalid skill slot ${j}`));
  for(const it of b.items)assert(itemNames.has(it),`${s.name} build ${i} unknown item: ${it}`);
  assert(b.how && b.risk,`${s.name} build ${i} missing guide`);
 }
}
assert(count>=65,'Expected 65 editorial build paths');
assert(readFileSync('src/app.js','utf8').includes('imageSources'),'Missing real image source logic');
console.log(`Validated ${d.survivors.length} survivors and ${count} build paths; ${d.items.length} curated base items, ${d.hallowed.length} Hallowed, ${d.hexes.length} Hex, ${d.pages.length} rituals.`);
