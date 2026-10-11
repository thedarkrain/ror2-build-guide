import http from 'node:http';
import {readFileSync,statSync,existsSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const root=resolve(process.argv[2]||'.');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const port=Number(process.env.PORT||4173);
http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 let file=resolve(root,'.'+pathname);
 if(!file.startsWith(root+sep)&&file!==root){res.writeHead(403);res.end('Forbidden');return}
 if(!existsSync(file)||!statSync(file).isFile())file=resolve(root,'index.html');
 try{const data=readFileSync(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data)}catch{res.writeHead(404);res.end('Not found')}
}).listen(port,'0.0.0.0',()=>console.log(`Field Manual: http://localhost:${port}`));
