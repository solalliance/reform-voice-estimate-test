export async function connection(){
 let code='';const hash=new URLSearchParams(location.hash.slice(1));
 if(['localhost','127.0.0.1'].includes(location.hostname)){
  const r=await fetch('/local-config');if(r.ok)code=(await r.json()).accessCode||'';
 }else{
  try{code=hash.get('access')||sessionStorage.getItem('voice-demo-access')||'';if(code)sessionStorage.setItem('voice-demo-access',code);}catch{code=hash.get('access')||'';}
 }
 if(hash.has('access'))history.replaceState(null,'',location.pathname+location.search);
 return {code,base:location.hostname.endsWith('github.io')?'https://advertisers-trio-stores-ongoing.trycloudflare.com':location.origin};
}
