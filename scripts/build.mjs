import {cpSync,existsSync,mkdirSync,rmSync} from 'node:fs';
import path from 'node:path';
const out=path.resolve('dist');
if(existsSync(out))rmSync(out,{recursive:true,force:true});
mkdirSync(out,{recursive:true});
for(const f of ['index.html','public','src']) cpSync(path.resolve(f),path.join(out,f==='public'?'':f),{recursive:true,force:true});
console.log('Built static website → dist/ (no dependencies required)');
