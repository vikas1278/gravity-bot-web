async function loadSite(){
 try{
  const r=await fetch('/api/public'); if(!r.ok) return;
  const d=await r.json(),s=d.settings||{};
  const name=s.bot_name||'Gravity Bot',logo=(s.logo_url && s.logo_url.trim()) ? s.logo_url : 'assets/logo.png';
  document.querySelectorAll('#navName,#footerName').forEach(x=>x.textContent=name);
  document.querySelectorAll('#navLogo,#heroLogo').forEach(x=>{
    x.src=logo;
    x.onerror=()=>{x.src='assets/logo.png'};
  });
  document.querySelectorAll('#inviteTop,#inviteHero,#inviteBottom').forEach(x=>x.href=s.invite_url||'#');
  const sup=document.getElementById('supportLink'); if(sup)sup.href=s.support_url||'#';
  const t=document.getElementById('heroTitle');if(t)t.textContent=s.hero_title||'Make your server gravity-powered.';
  const p=document.getElementById('heroDescription');if(p)p.textContent=s.hero_description||'';
  const grid=document.getElementById('categoryGrid');
  if(grid)grid.innerHTML=(d.categories||[]).map(c=>`<article><div class="icon">${esc(c.icon)}</div><h3>${esc(c.name)}</h3><p>${esc(c.description)}</p></article>`).join('');
 }catch(e){}
}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
loadSite();