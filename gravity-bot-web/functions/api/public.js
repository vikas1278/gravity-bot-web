export async function onRequestGet({ env }) {
  const settings  = await env.DB.prepare("SELECT * FROM settings WHERE id=1").first();
  const cats      = await env.DB.prepare("SELECT * FROM categories ORDER BY sort_order,id").all();
  const cmds      = await env.DB.prepare("SELECT * FROM commands ORDER BY sort_order,id").all();

  const categories = (cats.results || []).map(c => ({
    ...c,
    commands: (cmds.results || []).filter(x => x.category_id === c.id)
  }));

  const cleanSettings = settings
    ? {
        ...settings,
        logo_url:        (settings.logo_url && settings.logo_url.trim()) ? settings.logo_url : 'assets/logo.png',
        terms_content:   settings.terms_content   || '',
        privacy_content: settings.privacy_content || ''
      }
    : {
        bot_name:        'Gravity Bot',
        logo_url:        'assets/logo.png',
        terms_content:   '',
        privacy_content: ''
      };

  return Response.json(
    { settings: cleanSettings, categories },
    { headers: { "Cache-Control": "no-store" } }
  );
}