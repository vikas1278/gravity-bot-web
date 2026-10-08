function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

async function auth(request, env) {
  const user = request.headers.get("X-Admin-User") || "";
  const pass = request.headers.get("X-Admin-Pass") || "";
  const expectedUser = env.ADMIN_USER || "admin";
  const expectedPass = env.ADMIN_PASS || "123";
  return user === expectedUser && pass === expectedPass;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (!await auth(request, env)) {
    return json({ error: "Invalid Admin ID or Password" }, 401);
  }

  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  // GET — return all data
  if (request.method === "GET") {
    const settings = await env.DB.prepare("SELECT * FROM settings WHERE id=1").first();
    const cats = await env.DB.prepare("SELECT * FROM categories ORDER BY sort_order,id").all();
    const cmds = await env.DB.prepare("SELECT * FROM commands ORDER BY sort_order,id").all();
    return json({
      settings: settings || {},
      categories: cats.results || [],
      commands: cmds.results || []
    });
  }

  // POST — mutations
  const body = await request.json();
  try {
    if (action === "settings") {
      await env.DB.prepare(
        "UPDATE settings SET bot_name=?,logo_url=?,invite_url=?,support_url=?,hero_title=?,hero_description=?,terms_content=?,privacy_content=?,client_id=?,commands_title=?,commands_subtitle=? WHERE id=1"
      ).bind(
        body.bot_name         || '',
        body.logo_url         || '',
        body.invite_url       || '',
        body.support_url      || '',
        body.hero_title       || '',
        body.hero_description || '',
        body.terms_content    || '',
        body.privacy_content  || '',
        body.client_id        || '',
        body.commands_title   || 'Every command, organized.',
        body.commands_subtitle|| ''
      ).run();

    } else if (action === "category_add") {
      await env.DB.prepare(
        "INSERT INTO categories(name,icon,description,sort_order) VALUES(?,?,?,?)"
      ).bind(
        body.name,
        body.icon        || '⚙️',
        body.description || '',
        Number(body.sort_order) || 0
      ).run();

    } else if (action === "category_update") {
      await env.DB.prepare(
        "UPDATE categories SET name=?,icon=?,description=?,sort_order=? WHERE id=?"
      ).bind(
        body.name,
        body.icon        || '⚙️',
        body.description || '',
        Number(body.sort_order) || 0,
        Number(body.id)
      ).run();

    } else if (action === "category_delete") {
      await env.DB.prepare("DELETE FROM commands WHERE category_id=?").bind(Number(body.id)).run();
      await env.DB.prepare("DELETE FROM categories WHERE id=?").bind(Number(body.id)).run();

    } else if (action === "command_add") {
      await env.DB.prepare(
        "INSERT INTO commands(category_id,command_name,description,usage_text,sort_order) VALUES(?,?,?,?,?)"
      ).bind(
        Number(body.category_id),
        body.command_name,
        body.description || '',
        body.usage_text  || '',
        Number(body.sort_order) || 0
      ).run();

    } else if (action === "command_update") {
      await env.DB.prepare(
        "UPDATE commands SET category_id=?,command_name=?,description=?,usage_text=?,sort_order=? WHERE id=?"
      ).bind(
        Number(body.category_id),
        body.command_name,
        body.description || '',
        body.usage_text  || '',
        Number(body.sort_order) || 0,
        Number(body.id)
      ).run();

    } else if (action === "command_delete") {
      await env.DB.prepare("DELETE FROM commands WHERE id=?").bind(Number(body.id)).run();

    } else {
      return json({ error: "Unknown action" }, 400);
    }

    return json({ ok: true });

  } catch (e) {
    return json({ error: e.message }, 500);
  }
}