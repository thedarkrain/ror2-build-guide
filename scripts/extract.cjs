const fs=require('fs');const p=require('path');
let s=fs.readFileSync('/mnt/data/risk_of_rain_2_build_lab.html','utf8');
const match=(a,b)=>{let i=s.indexOf(a),j=s.indexOf(b,i+a.length); if(i<0||j<0)throw Error(a); return s.slice(i,j)};
const data=Function(`'use strict'; ${match('const rawItems=', 'const byName=')}return {items,hallowed,hexes,pages,survivors};`)();
const catAliases={white:'Common',green:'Uncommon',red:'Legendary',yellow:'Boss',void:'Void',lunar:'Lunar',equipment:'Equipment',hallowed:'Hallowed',hex:'Hex',page:'N\'tormat'};
for(const i of data.items){i.rarity=catAliases[i.tier]||i.tier;i.dlc=i.tier==='void'?'Survivors of the Void':null;i.wiki=i.name;delete i.icon;}
for(const arr of [data.hallowed,data.hexes,data.pages]){for(const i of arr){i.rarity=catAliases[i.tier];i.dlc='Hallowed Concepts'; i.wiki=i.name; delete i.icon;}}
for(const s of data.survivors) delete s.icon;
const out='/mnt/data/ror2-field-manual/src/data/game.json';fs.writeFileSync(out,JSON.stringify(data,null,2)); console.log(Object.fromEntries(Object.entries(data).map(([k,v])=>[k,v.length])),out);
