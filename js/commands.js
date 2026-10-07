let data=[];
async function init(){
 const r=await fetch('/api/public'); if(!r.ok)return;
 const d=await r.json();data=d.categories||[];
 const s=d.settings||{};document.querySelectorAll('#navName').forEach(x=>x.textContent=s.bot_name||'Gravity Bot');
 const logo=(s.logo_url && s.logo_url.trim()) ? s.logo_url : 'assets/logo.png';
 document.querySelectorAll('#navLogo').forEach(x=>{
  x.src=logo;
  x.onerror=()=>{x.src='assets/logo.png'};
 });
 document.getElementById('inviteTop').href=s.invite_url||'#';
 const sel=document.getElementById('category');data.forEach(c=>sel.insertAdjacentHTML('beforeend',`<option value="${esc(c.id)}">${esc(c.icon)} ${esc(c.name)}</option>`));
 render();
}
function render(){
 const q=(document.getElementById('search').value||'').toLowerCase(),cat=document.getElementById('category').value;
 document.getElementById('commandList').innerHTML=data.filter(c=>!cat||String(c.id)===cat).map(c=>{
  const rows=(c.commands||[]).filter(x=>(x.command_name+' '+x.description+' '+x.usage_text).toLowerCase().includes(q));
  if(!rows.length)return '';
  return `<section class="command-category"><header><strong>${esc(c.icon)} ${esc(c.name)}</strong><span>${rows.length} commands</span><p>${esc(c.description)}</p></header>${rows.map(x=>`<div class="command-row"><div><code>${esc(x.command_name)}</code><p>${esc(x.description)}</p></div>${x.usage_text?`<small>${esc(x.usage_text)}</small>`:''}</div>`).join('')}</section>`;
 }).join('');
}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
document.getElementById('search').addEventListener('input',render);document.getElementById('category').addEventListener('change',render);init();