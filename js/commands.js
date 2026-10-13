// ============================================================================
// GRAVITY BOT — COMMANDS DIRECTORY (INSTANT CACHE & REAL-TIME SYNC)
// ============================================================================

const PUBLIC_CACHE_KEY = 'gravity_public_data';
let data = [];

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
}

function applyCommandsData(d) {
  if (!d) return;
  data = d.categories || [];
  const s = d.settings || {};

  // 1. Branding
  const name = s.bot_name || 'Gravity Bot';
  document.querySelectorAll('#navName').forEach(x => {
    x.textContent = name.toUpperCase();
  });

  const logo = (s.logo_url && s.logo_url.trim()) ? s.logo_url : 'assets/logo.png';
  document.querySelectorAll('#navLogo').forEach(x => {
    if (x.getAttribute('src') !== logo) {
      x.src = logo;
    }
    x.onerror = () => { x.src = 'assets/logo.png'; };
  });

  const inviteTop = document.getElementById('inviteTop');
  if (inviteTop && s.invite_url) {
    inviteTop.href = s.invite_url;
  }

  // 2. Page Hero Tagline
  const titleEl = document.getElementById('cmdPageTitle');
  if (titleEl && s.commands_title) {
    const parts = s.commands_title.split(',');
    const html = parts.length > 1
      ? esc(parts[0]) + ',<br><span>' + esc(parts.slice(1).join(',').trim()) + '</span>'
      : '<span>' + esc(s.commands_title) + '</span>';
    if (titleEl.innerHTML !== html) {
      titleEl.innerHTML = html;
    }
  }

  const subEl = document.getElementById('cmdPageSubtitle');
  if (subEl && s.commands_subtitle) {
    if (subEl.textContent !== s.commands_subtitle) {
      subEl.textContent = s.commands_subtitle;
    }
  }

  // 3. Category Filter Dropdown
  const sel = document.getElementById('category');
  if (sel) {
    const currentVal = sel.value;
    const optionsHtml = '<option value="">All categories</option>' + data.map(c =>
      `<option value="${esc(c.id)}">${esc(c.icon)} ${esc(c.name)}</option>`
    ).join('');
    if (sel.innerHTML !== optionsHtml) {
      sel.innerHTML = optionsHtml;
      sel.value = currentVal;
    }
  }

  render();
}

function render() {
  const searchInput = document.getElementById('search');
  const catSelect = document.getElementById('category');
  const list = document.getElementById('commandList');
  if (!list) return;

  const q = (searchInput ? searchInput.value || '' : '').toLowerCase().trim();
  const cat = catSelect ? catSelect.value : '';

  const filteredCats = data.filter(c => !cat || String(c.id) === cat);
  const html = filteredCats.map(c => {
    const rows = (c.commands || []).filter(x =>
      (x.command_name + ' ' + x.description + ' ' + (x.usage_text || '')).toLowerCase().includes(q)
    );
    if (!rows.length) return '';
    return `
      <section class="command-category">
        <header>
          <strong>${esc(c.icon)} ${esc(c.name)}</strong>
          <span>${rows.length} commands</span>
          <p>${esc(c.description)}</p>
        </header>
        ${rows.map(x => `
          <div class="command-row">
            <div>
              <code>${esc(x.command_name)}</code>
              <p>${esc(x.description)}</p>
            </div>
            ${x.usage_text ? `<small>${esc(x.usage_text)}</small>` : ''}
          </div>
        `).join('')}
      </section>
    `;
  }).join('');

  if (!html && data.length > 0) {
    list.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--muted);">
        <p style="font-size: 18px; font-weight: 700; color: var(--text);">No matching commands found</p>
        <p style="margin-top: 8px;">Try searching with a different keyword or category filter.</p>
      </div>
    `;
  } else {
    list.innerHTML = html;
  }
}

// Event Listeners
const searchEl = document.getElementById('search');
const catEl = document.getElementById('category');
if (searchEl) searchEl.addEventListener('input', render);
if (catEl) catEl.addEventListener('change', render);

// STEP 1: Instant Cache Read (0ms delay)
try {
  const cachedRaw = localStorage.getItem(PUBLIC_CACHE_KEY);
  if (cachedRaw) {
    applyCommandsData(JSON.parse(cachedRaw));
  }
} catch (e) {}

// STEP 2: Background Fetch for latest commands & categories
async function init() {
  try {
    const r = await fetch('/api/public');
    if (!r.ok) return;
    const d = await r.json();
    applyCommandsData(d);
    try {
      localStorage.setItem(PUBLIC_CACHE_KEY, JSON.stringify(d));
    } catch (e) {}
  } catch (e) {}
}

init();