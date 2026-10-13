// ============================================================================
// GRAVITY BOT — SITE ENGINE (INSTANT CACHE & REAL-TIME SYNC)
// ============================================================================

const PUBLIC_CACHE_KEY = 'gravity_public_data';

const DEFAULT_TERMS = `
<h2>1. Acceptance of Terms</h2>
<p>By inviting or using Gravity Bot in your Discord server, you agree to these Terms and must comply with Discord's Terms of Service and Community Guidelines.</p>

<h2 style="margin-top: 25px;">2. Permitted Use</h2>
<p>Do not use Gravity Bot for any illegal activities, abuse, fraud, harassment, unauthorized access, or sending spam.</p>

<h2 style="margin-top: 25px;">3. Availability &amp; Changes</h2>
<p>Features may change or be temporarily unavailable during maintenance. The Bot is provided on an "as-is" and "as-available" basis.</p>

<h2 style="margin-top: 25px;">4. Updates to Terms</h2>
<p>These terms may be updated from time to time. Continued use of the bot signifies acceptance of updated terms.</p>
`.trim();

const DEFAULT_PRIVACY = `
<h2>1. Information We Collect</h2>
<p>Depending on enabled features, Gravity Bot may process Discord identifiers such as user IDs, server IDs, channel IDs, role IDs, and bot configuration data.</p>

<h2 style="margin-top: 25px;">2. Purpose of Data</h2>
<p>Data is strictly used to execute commands, save server configurations, provide bot features, troubleshoot technical issues, and prevent abuse.</p>

<h2 style="margin-top: 25px;">3. Data Sharing</h2>
<p>We do not sell or monetize personal information. Data is only processed through necessary infrastructure (such as Cloudflare D1) to operate the service.</p>

<h2 style="margin-top: 25px;">4. Retention &amp; Deletion</h2>
<p>We aim to retain only information reasonably required for bot operations. Server data can be removed when the bot is removed from the server.</p>
`.trim();

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
}

// Apply settings and content to DOM immediately
function applySiteData(data) {
  if (!data) return;
  const s = data.settings || {};
  const name = s.bot_name || 'Gravity Bot';
  const logo = (s.logo_url && s.logo_url.trim()) ? s.logo_url : 'assets/logo.png';

  // 1. Navigation & Footer branding
  document.querySelectorAll('#navName').forEach(el => {
    el.textContent = name.toUpperCase();
  });
  document.querySelectorAll('#footerName').forEach(el => {
    el.textContent = name.toUpperCase();
  });

  document.querySelectorAll('#navLogo, #heroLogo').forEach(img => {
    if (img.getAttribute('src') !== logo) {
      img.src = logo;
    }
    img.onerror = () => { img.src = 'assets/logo.png'; };
  });

  // 2. Invite Buttons
  if (s.invite_url) {
    document.querySelectorAll('#inviteTop, #inviteHero, #inviteBottom').forEach(el => {
      el.href = s.invite_url;
    });
  }

  // 3. Support Links
  if (s.support_url) {
    const sup = document.getElementById('supportLink');
    if (sup) sup.href = s.support_url;
    const supBtn = document.getElementById('support');
    if (supBtn) supBtn.href = s.support_url;
  }

  // 4. Hero Section
  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle && s.hero_title) {
    heroTitle.textContent = s.hero_title;
  }

  const heroDesc = document.getElementById('heroDescription');
  if (heroDesc && s.hero_description) {
    heroDesc.textContent = s.hero_description;
  }

  // 5. Capabilities / Categories Grid
  const grid = document.getElementById('categoryGrid');
  if (grid && data.categories && data.categories.length) {
    const html = data.categories.map(c => `
      <article>
        <div class="icon">${esc(c.icon)}</div>
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.description)}</p>
      </article>
    `).join('');
    if (grid.innerHTML !== html) {
      grid.innerHTML = html;
    }
  }

  // 6. Terms of Service Page
  const termsEl = document.getElementById('termsContent');
  if (termsEl) {
    const customTerms = (s.terms_content || '').trim();
    const finalTerms = customTerms || DEFAULT_TERMS;
    if (termsEl.innerHTML.trim() !== finalTerms) {
      termsEl.innerHTML = finalTerms;
      termsEl.classList.add('legal-content-fade');
    }
  }

  // 7. Privacy Policy Page
  const privacyEl = document.getElementById('privacyContent');
  if (privacyEl) {
    const customPrivacy = (s.privacy_content || '').trim();
    const finalPrivacy = customPrivacy || DEFAULT_PRIVACY;
    if (privacyEl.innerHTML.trim() !== finalPrivacy) {
      privacyEl.innerHTML = finalPrivacy;
      privacyEl.classList.add('legal-content-fade');
    }
  }
}

// STEP 1: Apply cached data immediately (0 milliseconds delay — NO FLASH)
try {
  const cachedRaw = localStorage.getItem(PUBLIC_CACHE_KEY);
  if (cachedRaw) {
    applySiteData(JSON.parse(cachedRaw));
  }
} catch (e) {}

// STEP 2: Fetch fresh data from D1 Database in the background and update cache silently
async function loadSite() {
  try {
    const r = await fetch('/api/public');
    if (!r.ok) return;
    const d = await r.json();
    applySiteData(d);
    try {
      localStorage.setItem(PUBLIC_CACHE_KEY, JSON.stringify(d));
    } catch (e) {}
  } catch (e) {}
}

loadSite();