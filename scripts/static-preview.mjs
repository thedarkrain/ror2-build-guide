import {writeFileSync,readFileSync} from 'node:fs';
const root={innerHTML:'',addEventListener(){},querySelectorAll:()=>[]};
globalThis.localStorage={getItem:()=>null,setItem(){}};
globalThis.location={hash:'#home'};globalThis.history={replaceState(){}};
globalThis.document={getElementById:()=>root,activeElement:null};
globalThis.window={scrollY:0,scrollTo(){},addEventListener(){}};
await import('../src/app.js');
const css=readFileSync('src/style.css','utf8');
writeFileSync('/mnt/data/ror2_rework/static_home.html','<meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style>'+root.innerHTML);
