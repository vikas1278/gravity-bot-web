CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id=1),
  bot_name TEXT NOT NULL DEFAULT 'Gravity Bot',
  logo_url TEXT NOT NULL DEFAULT 'assets/logo.png',
  invite_url TEXT NOT NULL DEFAULT '#',
  support_url TEXT NOT NULL DEFAULT '#',
  hero_title TEXT NOT NULL DEFAULT 'Make your server gravity-powered.',
  hero_description TEXT NOT NULL DEFAULT 'Moderation, music, AutoMod and utilities — packed into one fast, clean and powerful Discord bot.',
  terms_content TEXT NOT NULL DEFAULT '',
  privacy_content TEXT NOT NULL DEFAULT '',
  client_id TEXT NOT NULL DEFAULT '',
  commands_title TEXT NOT NULL DEFAULT 'Every command, organized.',
  commands_subtitle TEXT NOT NULL DEFAULT 'Explore every slash command — from moderation to Logs, all in one place.'
);

INSERT OR IGNORE INTO settings
(id,bot_name,logo_url,invite_url,support_url,hero_title,hero_description,terms_content,privacy_content,client_id,commands_title,commands_subtitle)
VALUES
(1,'Gravity Bot','assets/logo.png',
'https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot%20applications.commands&permissions=8',
'https://discord.gg/YOUR_SUPPORT_SERVER',
'Make your server gravity-powered.',
'Moderation, music, AutoMod and utilities — packed into one fast, clean and powerful Discord bot.',
'',
'',
'',
'Every command, organized.',
'Explore every slash command — from moderation to Logs, all in one place.');

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '⚙️',
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS commands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  command_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  usage_text TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO categories(name,icon,description,sort_order) VALUES
('Moderation','🛡️','Keep your community safe and manageable.',1),
('AutoMod','🤖','Automated protection for your server.',3),
('Utility','⚙️','Useful everyday server commands.',4);
