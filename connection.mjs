export async function connection(){
 const hash=new URLSearchParams(location.hash.slice(1));let saved='';
 try{saved=sessionStorage.getItem('voice-demo-access')||'';}catch{}
 let code=hash.get('access')||saved;
 if(['localhost','127.0.0.1'].includes(location.hostname)){
  try{const r=await fetch('/local-config');if(r.ok)code=(await r.json()).accessCode||code;}catch{}
 }
 if(code){
  try{sessionStorage.setItem('voice-demo-access',code);}catch{}
  for(const a of document.querySelectorAll('a[href]')){
   const url=new URL(a.href);if(url.origin===location.origin&&['/report.html','/report-admin.html'].some(path=>url.pathname.endsWith(path))){url.hash=new URLSearchParams({access:code}).toString();a.href=url.href;}
  }
 }
 if(hash.has('access'))history.replaceState(null,'',location.pathname+location.search);
 return {code,base:location.hostname.endsWith('github.io')?'https://advertisers-trio-stores-ongoing.trycloudflare.com':location.origin};
}
