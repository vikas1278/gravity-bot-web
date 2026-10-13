# Gravity Bot — Cloudflare Pages + Functions + D1

A modern, serverless Discord bot website and admin dashboard built with Cloudflare Pages, Pages Functions, and Cloudflare D1 (SQLite).

---

## ⚡ Architecture
- **Frontend**: HTML5, Vanilla CSS (Glassmorphism & modern UI), Vanilla JavaScript
- **API**: Cloudflare Pages Functions (`/api/public`, `/api/admin`)
- **Database**: Cloudflare D1 (Serverless SQLite)
- **Admin Panel**: `/admin/` (Hidden from public navigation for security)
- **No PHP / No MySQL / No Node.js server required**

---

## 🚀 Setup & Deployment

### 1. Create Cloudflare D1 Database
1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **D1 SQL Database**.
2. Click **Create Database**.
3. Name: `gravity-bot`.

### 2. Import Database Schema
- **For a fresh installation:**
  Run the contents of [schema.sql](file:///c:/Users/vikas/Downloads/gravity-bot-web/schema.sql) in the Cloudflare D1 SQL console or via Wrangler CLI:
  ```bash
  npx wrangler d1 execute gravity-bot --remote --file=schema.sql
  ```

- **If updating an existing database:**
  Run these migration queries in the D1 console:
  ```sql
  ALTER TABLE settings ADD COLUMN client_id TEXT NOT NULL DEFAULT '';
  ALTER TABLE settings ADD COLUMN commands_title TEXT NOT NULL DEFAULT 'Every command, organized.';
  ALTER TABLE settings ADD COLUMN commands_subtitle TEXT NOT NULL DEFAULT 'Explore every slash command — from moderation to Logs, all in one place.';
  ```

---

### 3. Bind D1 to Cloudflare Pages
1. In Cloudflare Pages project → **Settings** → **Functions** → **D1 Database bindings**.
2. Click **Add binding**:
   - **Variable name**: `DB` *(Must be exactly `DB`)*
   - **D1 Database**: Select `gravity-bot`

---

### 4. Admin Credentials & Environment Variables
In Cloudflare Pages project → **Settings** → **Variables and Secrets** → **Production**:
Add the following environment variables:
- `ADMIN_USER` — Your Admin Username (e.g., `admin`)
- `ADMIN_PASS` — Your Admin Password (e.g., strong custom password)

> **Local Development (`.dev.vars`):**
> Create a `.dev.vars` file in your root folder:
> ```env
> ADMIN_USER=admin
> ADMIN_PASS=your_secure_password
> ```

---

### 5. Local Development
Run the local Pages development server with Wrangler:
```bash
npx wrangler pages dev .
```
- **Main Website**: http://127.0.0.1:8788
- **Admin Panel**: http://127.0.0.1:8788/admin/

---

### 6. Admin Panel Overview (`/admin/`)
The admin panel allows managing the entire website dynamically:
- **Bot Settings**: Bot Name, Avatar/Logo URL, Client ID, Discord Invite URL, Support Server URL.
- **Hero Section**: Main Tagline (Hero Title), Hero Description.
- **Commands Page Banner**: Big Heading and Subtitle customization.
- **Categories Manager**: Add, edit, reorder, or delete command categories (with icons & descriptions).
- **Commands Manager**: Add, edit, filter, search, reorder, or delete commands (with syntax & usage examples).
- **Legal Policies**: Editable Terms of Service and Privacy Policy pages.

---

## 🔒 Security Note
- The `/admin/` URL is deliberately **not linked** in the public footer or navbar to prevent unauthorized discovery.
- The public API (`/api/public`) is strictly read-only.
- All admin mutations (`/api/admin`) require authentication via `X-Admin-User` and `X-Admin-Pass` headers.
- Never commit your `.dev.vars` file to GitHub or public repositories.
