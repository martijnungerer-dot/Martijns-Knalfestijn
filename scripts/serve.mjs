import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const index=fileURLToPath(new URL('../index.html',import.meta.url));
const server=createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 if(path!=='/'&&path!=='/index.html'){res.writeHead(404,{'Content-Type':'text/plain'});res.end('Niet gevonden');return;}
 try{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(await readFile(index));}
 catch{res.writeHead(500,{'Content-Type':'text/plain'});res.end('Maak eerst index.html met npm run build.');}
});
server.listen(4173,'127.0.0.1',()=>console.log('Open http://127.0.0.1:4173 — Ctrl+C om te stoppen.'));
