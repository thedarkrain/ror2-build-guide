// Optional asset hydration: query wiki.gg MediaWiki's imageinfo API and cache official wiki media.
// Only run if you have confirmed you may redistribute the images in your hosted fan project.
// Usage: npm run assets:sync
import game from '../src/data/game.json' with { type: 'json' };
import {extra} from '../src/data/extra.js';
import {skillImageOverride} from '../src/data/skill-notes.js';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const API='https://riskofrain2.wiki.gg/api.php';
const out=resolve('public/assets/wiki');
const manifestPath=resolve('src/data/local-art.json');
const pause=t=>new Promise(r=>setTimeout(r,t));
const unique=new Map();
const add=(name,kind)=>unique.set(`${kind}:${name}`,{name,kind,base:(kind==='skill'?(skillImageOverride[name]||name):name).replace(/:/g,'')});
game.survivors.forEach(s=>{add(s.name,'survivor');s.skills.flat().forEach(n=>add(n,'skill'))});
[...game.items,...extra,...game.hexes,...game.hallowed,...game.pages].forEach(i=>add(i.name,'item'));
const entries=[...unique.values()];
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
const request=async url=>{const resp=await fetch(url,{headers:{'User-Agent':'PetrichorFieldManualBot/1.1 (fan project; github source requested by user)','Accept':'application/json,image/png,image/webp,*/*'}});if(!resp.ok)throw Error(`${resp.status} ${url}`);return resp};
const discovered=new Map();
for(let i=0;i<entries.length;i+=25){
 const chunk=entries.slice(i,i+25), files=chunk.map(e=>`File:${e.base}.png`);
 const url=`${API}?action=query&prop=imageinfo&iiprop=url&format=json&formatversion=2&titles=${encodeURIComponent(files.join('|'))}`;
 try {
  const json=await (await request(url)).json();
  for(const p of json.query?.pages||[]){if(p.imageinfo?.[0]?.url)discovered.set(p.title.toLowerCase(),p.imageinfo[0].url)}
  process.stdout.write(`\rWiki image filenames checked: ${Math.min(i+25,entries.length)}/${entries.length}`);
 } catch(e){console.warn(`\nWiki API unavailable: ${e.message}. The website will still use remote wiki redirects.`);process.exitCode=0;break}
 await pause(400);
}
await mkdir(out,{recursive:true});
let saved=0,missed=0;
for(const entry of entries){
 const key=`${entry.kind}:${entry.name}`;
 if(manifest[key])continue;
 const title=`File:${entry.base}.png`;
 const source=discovered.get(title.toLowerCase());
 if(!source){missed++;continue}
 try {
  const res=await request(source);
  const mime=(res.headers.get('content-type')||'').toLowerCase();
  const ext=mime.includes('webp')?'webp':mime.includes('jpeg')?'jpg':'png';
  const slug=encodeURIComponent(key).replace(/%/g,'_');
  const filename=`${slug}.${ext}`;
  await writeFile(resolve(out,filename),Buffer.from(await res.arrayBuffer()));
  manifest[key]=`/assets/wiki/${filename}`;saved++;
  if(saved%20===0)console.log(`\nSaved ${saved} wiki images`);
 }catch(e){console.warn(`Could not cache ${title}: ${e.message}`);missed++}
 await pause(80);
}
await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log(`\nDone. Downloaded ${saved}, unavailable ${missed}, cached total ${Object.keys(manifest).length}.\nCommit public/assets/wiki and src/data/local-art.json to GitHub for self-hosted art.`);
