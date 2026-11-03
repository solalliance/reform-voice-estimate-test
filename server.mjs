import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {timingSafeEqual} from 'node:crypto';
import {sessionConfig} from './session.mjs';
const port=Number(process.env.PORT||8787);
const allowed=process.env.ALLOWED_ORIGIN||'https://solalliance.github.io';
const files={'/':['index.html','text/html; charset=utf-8'],'/app.mjs':['app.mjs','text/javascript'],'/estimate.mjs':['estimate.mjs','text/javascript'],'/style.css':['style.css','text/css']};
const hits=new Map();
http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  const origin=req.headers.origin;
  if(origin && origin!==allowed && origin!==`http://localhost:${port}` && origin!==`http://127.0.0.1:${port}`){res.writeHead(403).end('接続元が許可されていません');return;}
  if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
  if(req.method==='GET'&&req.url==='/local-config'){
    const local=['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
    const localHost=[`localhost:${port}`,`127.0.0.1:${port}`].includes(req.headers.host);
    if(!local||!localHost||(origin&&origin!==`http://${req.headers.host}`)){res.writeHead(403).end('Local access only');return;}
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify({accessCode:process.env.DEMO_ACCESS_CODE||''}));return;
  }
  if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');res.writeHead(204).end();return;}
  if(req.method==='POST'&&req.url==='/session'){
    const key=process.env.OPENAI_API_KEY,code=process.env.DEMO_ACCESS_CODE;
    if(!key||!code){res.writeHead(503).end('サーバーのAPIキー・接続コードが未設定です');return;}
    const actual=Buffer.from(req.headers.authorization||''),expected=Buffer.from(`Bearer ${code}`);
    if(actual.length!==expected.length||!timingSafeEqual(actual,expected)){res.writeHead(401).end('接続コードを確認してください');return;}
    const bucket=Math.floor(Date.now()/60000); if(!hits.has(bucket)){hits.clear();hits.set(bucket,0);}hits.set(bucket,hits.get(bucket)+1);
    if(hits.get(bucket)>6){res.writeHead(429).end('少し待ってから接続してください');return;}
    try{
      let body='';for await(const chunk of req){body+=chunk;if(body.length>65536){res.writeHead(413).end('データが大きすぎます');return;}}
      if(!body.startsWith('v=0')){res.writeHead(400).end('音声接続データが不正です');return;}
      const form=new FormData();form.set('sdp',body);form.set('session',JSON.stringify(sessionConfig(process.env.REALTIME_MODEL||'gpt-realtime-2.1')));
      const upstream=await fetch('https://api.openai.com/v1/realtime/calls',{method:'POST',headers:{Authorization:`Bearer ${key}`},body:form,signal:AbortSignal.timeout(25000)});
      if(!upstream.ok){console.error('OpenAI session status:',upstream.status);res.writeHead(502).end(`音声APIに接続できませんでした（${upstream.status}）。APIの利用設定を確認してください`);return;}
      res.setHeader('Content-Type','application/sdp');res.writeHead(200).end(await upstream.text());
    }catch{res.writeHead(502).end('音声APIへの接続がタイムアウト、または失敗しました');}return;
  }
  if(req.method==='GET'&&files[req.url]){const [file,type]=files[req.url];try{res.setHeader('Content-Type',type);res.end(await readFile(new URL(`./public/${file}`,import.meta.url)));}catch{res.writeHead(500).end('読み込みに失敗しました');}return;}
  res.writeHead(404).end('Not found');
}).listen(port,'0.0.0.0',()=>console.log(`Voice estimate test: http://localhost:${port}`));
