// Optional local server. Double-clicking index.html works too.
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=process.cwd();const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png'};
createServer(async(req,res)=>{
  try{const pathname=decodeURIComponent(new URL(req.url||'/', 'http://localhost').pathname);
    const pathnameSafe=pathname==='/'?'/index.html':pathname;
    const abs=resolve(root,'.'+pathnameSafe);
    if(!abs.startsWith(root+sep)){res.writeHead(403).end('Forbidden');return;}
    if(!(await stat(abs)).isFile())throw Error('Not a file');
    res.writeHead(200,{'Content-Type':mime[extname(abs)]||'application/octet-stream','Cache-Control':'no-cache'}).end(await readFile(abs));
  }catch{res.writeHead(404).end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log('The Folio at http://127.0.0.1:'+port));
