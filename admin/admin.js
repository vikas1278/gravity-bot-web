// ============================================================================
// GRAVITY BOT — LIQUID GLASS ADMIN CONTROLLER
// ============================================================================

let ADMIN_USER = sessionStorage.getItem('gravity_admin_user') || 'admin';
let ADMIN_PASS = sessionStorage.getItem('gravity_admin_pass') || '';
let state = {
  settings: {},
  categories: [],
  commands: []
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// ============================================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================================
let toastTimer = null;
function showToast(msg, isError = false) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'liquid-toast show ' + (isError ? 'error' : 'success');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.className = 'liquid-toast';
  }, 3500);
}

// ============================================================================
// API CLIENT
// ============================================================================
function api(action, body) {
  return fetch('/api/admin?action=' + encodeURIComponent(action), {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-User': ADMIN_USER,
      'X-Admin-Pass': ADMIN_PASS
    },
    body: body ? JSON.stringify(body) : undefined
  }).then(async r => {
    const text = await r.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error('Server returned invalid response');
    }
    if (!r.ok) throw new Error(json.error || 'Request failed');
    return json;
  });
}

// ============================================================================
// AUTH & DATA LOADER
// ============================================================================
async function load(quiet = false) {
  try {
    state = await api('');
    const loginEl = $('#login');
    const appEl = $('#app');
    if (loginEl) {
      loginEl.hidden = true;
      loginEl.style.display = 'none';
    }
    if (appEl) {
      appEl.hidden = false;
      appEl.style.display = 'block';
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    render();
    if (!quiet) showToast('Logged in successfully!');
  } catch (e) {
    const loginEl = $('#login');
    const appEl = $('#app');
    if (loginEl) {
      loginEl.hidden = false;
      loginEl.style.display = 'flex';
    }
    if (appEl) {
      appEl.hidden = true;
      appEl.style.display = 'none';
    }
    const msg = $('#loginMsg');
    if (msg) {
      msg.textContent = e.message;
      msg.className = 'err';
    }
  }
}

// Sign in handler
$('#loginBtn').onclick = () => {
  const user = $('#adminUser').value.trim();
  const pass = $('#adminPass').value.trim();
  if (!user || !pass) {
    const msg = $('#loginMsg');
    msg.textContent = 'Please enter both Admin ID and Password';
    msg.className = 'err';
    return;
  }
  ADMIN_USER = user;
  ADMIN_PASS = pass;
  sessionStorage.setItem('gravity_admin_user', ADMIN_USER);
  sessionStorage.setItem('gravity_admin_pass', ADMIN_PASS);
  load();
};

[$('#adminUser'), $('#adminPass')].forEach(input => {
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') $('#loginBtn').click();
    });
  }
});

// Logout handler
const logoutBtn = $('#logoutBtn');
if (logoutBtn) {
  logoutBtn.onclick = () => {
    sessionStorage.removeItem('gravity_admin_user');
    sessionStorage.removeItem('gravity_admin_pass');
    ADMIN_PASS = '';
    const appEl = $('#app');
    const loginEl = $('#login');
    if (appEl) {
      appEl.hidden = true;
      appEl.style.display = 'none';
    }
    if (loginEl) {
      loginEl.hidden = false;
      loginEl.style.display = 'flex';
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    $('#adminPass').value = '';
    const msg = $('#loginMsg');
    if (msg) msg.textContent = '';
    showToast('Logged out of admin session');
  };
}

// ============================================================================
// TAB NAVIGATION
// ============================================================================
$$('.tab-btn').forEach(btn => {
  btn.onclick = () => {
    const target = btn.dataset.tab;
    $$('.tab-btn').forEach(b => b.classList.remove('active'));
    $$('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const pane = document.getElementById(target);
    if (pane) pane.classList.add('active');
  };
});

// ============================================================================
// MAIN RENDER ENGINE
// ============================================================================
function render() {
  const s = state.settings || {};
  const cats = state.categories || [];
  const cmds = state.commands || [];

  // 1. Update Stats Bar
  if ($('#statBotName')) $('#statBotName').textContent = s.bot_name || 'Gravity Bot';
  if ($('#statCatCount')) $('#statCatCount').textContent = cats.length;
  if ($('#badgeCatCount')) $('#badgeCatCount').textContent = cats.length;
  if ($('#catListCount')) $('#catListCount').textContent = `${cats.length} Categories`;

  if ($('#statCmdCount')) $('#statCmdCount').textContent = cmds.length;
  if ($('#badgeCmdCount')) $('#badgeCmdCount').textContent = cmds.length;
  if ($('#cmdListCount')) $('#cmdListCount').textContent = `${cmds.length} Commands`;

  // Update dynamic bot logos across admin UI
  const logoSrc = (s.logo_url && s.logo_url.trim()) ? s.logo_url : '../assets/logo.png';
  ['#loginLogo', '#adminNavLogo', '#statBotLogo'].forEach(sel => {
    const img = $(sel);
    if (img) {
      img.src = logoSrc;
      img.onerror = () => { img.src = '../assets/logo.png'; };
    }
  });

  // 2. Render Website Settings
  const settingsForm = $('#settings');
  if (settingsForm) {
    settingsForm.innerHTML = `
      <div class="settings-grid-2">
        <div class="form-field">
          <label>Bot Display Name</label>
          <input name="bot_name" value="${esc(s.bot_name)}" placeholder="e.g. Gravity Bot" required>
          <small>The public name shown in navigation and hero banners.</small>
        </div>

        <div class="form-field">
          <label>Logo URL (Avatar)</label>
          <input name="logo_url" value="${esc(s.logo_url)}" placeholder="assets/logo.png">
          <small>Default is <code>assets/logo.png</code>. Leave empty to use local default.</small>
        </div>
      </div>

      <div class="settings-grid-2">
        <div class="form-field">
          <label>Discord Bot Invite URL</label>
          <input name="invite_url" value="${esc(s.invite_url)}" placeholder="https://discord.com/oauth2/authorize?..." required>
          <small>Target link for all "Invite Bot" buttons across the site.</small>
        </div>

        <div class="form-field">
          <label>Support Server URL</label>
          <input name="support_url" value="${esc(s.support_url)}" placeholder="https://discord.gg/your-server" required>
          <small>Target link for "Support Server" buttons.</small>
        </div>
      </div>

      <div class="form-field">
        <label>Hero Title (Main Tagline)</label>
        <input name="hero_title" value="${esc(s.hero_title)}" placeholder="Make your server gravity-powered.">
      </div>

      <div class="form-field">
        <label>Hero Description</label>
        <textarea name="hero_description" rows="3" placeholder="Explain your bot's standout features...">${esc(s.hero_description)}</textarea>
      </div>

      <!-- Hidden inputs to preserve legal fields during settings update -->
      <input type="hidden" name="terms_content" value="${esc(s.terms_content || '')}">
      <input type="hidden" name="privacy_content" value="${esc(s.privacy_content || '')}">

      <div class="form-actions-bar">
        <button type="submit" class="btn-liquid-primary">
          <span>Save Website Settings</span>
          <span class="btn-arrow">✓</span>
        </button>
      </div>
    `;

    settingsForm.onsubmit = async e => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      const data = Object.fromEntries(new FormData(e.target));
      const ok = await save('settings', data, 'Website settings updated successfully!');
      btn.disabled = false;
      if (ok) await load(true);
    };
  }

  // 3. Render Legal Policies Form
  const legalTerms = $('#legalTerms');
  const legalPrivacy = $('#legalPrivacy');
  if (legalTerms) legalTerms.value = s.terms_content || '';
  if (legalPrivacy) legalPrivacy.value = s.privacy_content || '';

  const legalForm = $('#legalForm');
  if (legalForm) {
    legalForm.onsubmit = async e => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;

      // Merge current settings with updated legal content
      const payload = {
        ...s,
        terms_content: legalTerms.value,
        privacy_content: legalPrivacy.value
      };

      const ok = await save('settings', payload, 'Terms & Privacy policies saved successfully!');
      btn.disabled = false;
      if (ok) await load(true);
    };
  }

  // 4. Render Categories List
  const catsContainer = $('#cats');
  if (catsContainer) {
    if (cats.length === 0) {
      catsContainer.innerHTML = `
        <div class="glass-card" style="padding: 30px; text-align: center; color: var(--text-muted);">
          No categories found. Use the form above to add your first category!
        </div>
      `;
    } else {
      catsContainer.innerHTML = cats.map(c => `
        <div class="liquid-item-card">
          <form data-cat="${c.id}" class="liquid-item-form cat-item-grid">
            <div>
              <span class="field-caption">Category Name</span>
              <input name="name" value="${esc(c.name)}" placeholder="Category Name" required>
            </div>
            <div>
              <span class="field-caption">Icon</span>
              <input name="icon" value="${esc(c.icon)}" placeholder="🛡️" style="text-align: center;">
            </div>
            <div>
              <span class="field-caption">Description</span>
              <input name="description" value="${esc(c.description)}" placeholder="Category summary">
            </div>
            <div>
              <span class="field-caption">Sort Order</span>
              <input name="sort_order" type="number" value="${c.sort_order}">
            </div>
            <button type="submit" class="btn-item-update">Update</button>
            <button type="button" class="btn-item-delete" data-del-action="category_delete" data-id="${c.id}" data-name="${esc(c.name)}">Delete</button>
          </form>
        </div>
      `).join('');

      // Bind category update forms
      document.querySelectorAll('form[data-cat]').forEach(f => {
        f.onsubmit = async e => {
          e.preventDefault();
          const btn = f.querySelector('.btn-item-update');
          btn.disabled = true;
          const data = Object.fromEntries(new FormData(f));
          data.id = f.dataset.cat;
          const ok = await save('category_update', data, `Category "${data.name}" updated!`);
          btn.disabled = false;
          if (ok) await load(true);
        };
      });
    }
  }

  // 5. Populate Category Select in "Add Command" form & Command Filter
  const cmdCatSelect = $('#cmdCat');
  if (cmdCatSelect) {
    cmdCatSelect.innerHTML = cats.map(c => `
      <option value="${c.id}">${esc(c.icon)} ${esc(c.name)}</option>
    `).join('');
  }

  const cmdCategoryFilter = $('#cmdCategoryFilter');
  if (cmdCategoryFilter) {
    const currentFilter = cmdCategoryFilter.value || 'all';
    cmdCategoryFilter.innerHTML = `
      <option value="all">All Categories (${cmds.length})</option>
      ${cats.map(c => {
        const count = cmds.filter(x => x.category_id === c.id).length;
        return `<option value="${c.id}" ${currentFilter == c.id ? 'selected' : ''}>${esc(c.icon)} ${esc(c.name)} (${count})</option>`;
      }).join('')}
    `;
  }

  // 6. Render Commands List
  renderFilteredCommands();

  // Attach delete buttons
  attachDeleteHandlers();
}

// ============================================================================
// FILTERED COMMANDS RENDER ENGINE
// ============================================================================
function renderFilteredCommands() {
  const cmdsContainer = $('#cmds');
  if (!cmdsContainer) return;

  const searchQuery = ($('#cmdSearchInput')?.value || '').toLowerCase().trim();
  const filterCatId = $('#cmdCategoryFilter')?.value || 'all';

  const cats = state.categories || [];
  let filtered = state.commands || [];

  if (filterCatId !== 'all') {
    filtered = filtered.filter(c => String(c.category_id) === String(filterCatId));
  }

  if (searchQuery) {
    filtered = filtered.filter(c =>
      (c.command_name || '').toLowerCase().includes(searchQuery) ||
      (c.description || '').toLowerCase().includes(searchQuery) ||
      (c.usage_text || '').toLowerCase().includes(searchQuery)
    );
  }

  if ($('#cmdListCount')) {
    $('#cmdListCount').textContent = `${filtered.length} of ${(state.commands || []).length} Commands`;
  }

  if (filtered.length === 0) {
    cmdsContainer.innerHTML = `
      <div class="glass-card" style="padding: 30px; text-align: center; color: var(--text-muted);">
        No matching commands found.
      </div>
    `;
    return;
  }

  cmdsContainer.innerHTML = filtered.map(c => `
    <div class="liquid-item-card">
      <form data-cmd="${c.id}" class="liquid-item-form cmd-item-grid">
        <div>
          <span class="field-caption">Category</span>
          <select name="category_id">
            ${cats.map(g => `
              <option value="${g.id}" ${g.id === c.category_id ? 'selected' : ''}>${esc(g.icon)} ${esc(g.name)}</option>
            `).join('')}
          </select>
        </div>
        <div>
          <span class="field-caption">Command</span>
          <input name="command_name" value="${esc(c.command_name)}" placeholder="/command" required style="font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #c4b5fd;">
        </div>
        <div>
          <span class="field-caption">Description</span>
          <input name="description" value="${esc(c.description)}" placeholder="Command purpose" required>
        </div>
        <div>
          <span class="field-caption">Usage Syntax</span>
          <input name="usage_text" value="${esc(c.usage_text || '')}" placeholder="Usage: /cmd @user" style="font-family: 'JetBrains Mono', monospace; font-size: 12px;">
        </div>
        <div>
          <span class="field-caption">Sort</span>
          <input name="sort_order" type="number" value="${c.sort_order}">
        </div>
        <button type="submit" class="btn-item-update">Update</button>
        <button type="button" class="btn-item-delete" data-del-action="command_delete" data-id="${c.id}" data-name="${esc(c.command_name)}">Delete</button>
      </form>
    </div>
  `).join('');

  // Bind command update forms
  document.querySelectorAll('form[data-cmd]').forEach(f => {
    f.onsubmit = async e => {
      e.preventDefault();
      const btn = f.querySelector('.btn-item-update');
      btn.disabled = true;
      const data = Object.fromEntries(new FormData(f));
      data.id = f.dataset.cmd;
      const ok = await save('command_update', data, `Command "${data.command_name}" updated!`);
      btn.disabled = false;
      if (ok) await load(true);
    };
  });

  attachDeleteHandlers();
}

// Bind search and filter events
const cmdSearchInput = $('#cmdSearchInput');
if (cmdSearchInput) {
  cmdSearchInput.addEventListener('input', () => {
    renderFilteredCommands();
  });
}

const cmdCategoryFilter = $('#cmdCategoryFilter');
if (cmdCategoryFilter) {
  cmdCategoryFilter.addEventListener('change', () => {
    renderFilteredCommands();
  });
}

// ============================================================================
// ADD CATEGORY & ADD COMMAND HANDLERS
// ============================================================================
const catAddForm = $('#catAdd');
if (catAddForm) {
  catAddForm.onsubmit = async e => {
    e.preventDefault();
    const btn = catAddForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    const data = Object.fromEntries(new FormData(catAddForm));
    const ok = await save('category_add', data, `Category "${data.name}" added successfully!`);
    btn.disabled = false;
    if (ok) {
      catAddForm.reset();
      const iconInput = catAddForm.querySelector('[name="icon"]');
      if (iconInput) iconInput.value = '⚙️';
      await load(true);
    }
  };
}

const cmdAddForm = $('#cmdAdd');
if (cmdAddForm) {
  cmdAddForm.onsubmit = async e => {
    e.preventDefault();
    const btn = cmdAddForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    const data = Object.fromEntries(new FormData(cmdAddForm));
    const ok = await save('command_add', data, `Command "${data.command_name}" added successfully!`);
    btn.disabled = false;
    if (ok) {
      cmdAddForm.reset();
      await load(true);
    }
  };
}

// ============================================================================
// DELETE HANDLERS
// ============================================================================
function attachDeleteHandlers() {
  document.querySelectorAll('[data-del-action]').forEach(btn => {
    btn.onclick = async () => {
      const action = btn.dataset.delAction;
      const id = btn.dataset.id;
      const name = btn.dataset.name || 'item';
      if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
      btn.disabled = true;
      const ok = await save(action, { id }, `Deleted "${name}" successfully!`);
      if (ok) await load(true);
    };
  });
}

// ============================================================================
// SAVE MUTATION HELPER
// ============================================================================
async function save(action, body, successMsg = 'Saved successfully!') {
  try {
    await api(action, body);
    showToast(successMsg, false);
    return true;
  } catch (e) {
    showToast(e.message, true);
    return false;
  }
}

// ============================================================================
// ESCAPE HELPER
// ============================================================================
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
}

// Auto-login check on page boot
if (ADMIN_USER && ADMIN_PASS) {
  if ($('#adminUser')) $('#adminUser').value = ADMIN_USER;
  if ($('#adminPass')) $('#adminPass').value = ADMIN_PASS;
  load(true);
}