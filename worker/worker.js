// StudyFlow AI server (Cloudflare Worker + Workers AI, free tier).
// Checks the person is signed in to StudyFlow, applies a daily limit, then asks an open model.
// Paste into the Cloudflare dashboard editor. Needs a Workers AI binding called "AI".
const SUPABASE_URL = "https://qieluzgwwxfxlppxtgrd.supabase.co";
const SUPABASE_KEY = "sb_publishable_EbZKtBLjhpgix2iWTYZYvA_a-1Ai1_0"; // public key, safe to include
const ALLOWED_ORIGINS = ["https://opprodude44.github.io"];
const DAILY_LIMIT = 40;
const MODELS = { quick: "@cf/meta/llama-3.1-8b-instruct-fast", default: "@cf/meta/llama-3.3-70b-instruct-fp8-fast", complex: "@cf/meta/llama-3.3-70b-instruct-fp8-fast" };
const SAFETY = `You are Flo, the study assistant inside StudyFlow, a study planner used by students aged 13 and over, many of them under 18.
- You are an AI. Never claim to be human.
- Help with studying and planning only. Keep everything age-appropriate. Refuse sexual, violent, hateful or dangerous content.
- Never write graded work (IA, EE, essays, coursework) for the student: explain, give feedback and examples instead.
- If a student seems distressed or at risk, respond kindly, encourage them to talk to a trusted adult or school counsellor, and in an emergency to call local emergency services (999 in the UAE).
- Don't ask for personal information such as addresses, phone numbers or passwords.
- Be accurate. If you're not sure, say so.
- NEVER say you added, moved, deleted, scheduled, changed or marked anything unless a tool result in this conversation confirms it. If you can't do something, say so plainly and suggest how the student can do it.`;

function cors(origin) {
  const ok = ALLOWED_ORIGINS.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin || "");
  return { "Access-Control-Allow-Origin": ok ? origin : ALLOWED_ORIGINS[0], "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Max-Age": "86400", "Vary": "Origin" };
}
const json = (body, status, origin) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors(origin) } });

function toText(content) {
  if (Array.isArray(content) && content.some(b => b.type === "tool_use")) {
    const t = content.filter(b => b.type === "text").map(b => b.text).join("\n");
    const calls = content.filter(b => b.type === "tool_use").map(b => `[I called ${b.name} with ${JSON.stringify(b.input || {})}]`).join("\n");
    return [t, calls].filter(Boolean).join("\n");
  }
  if (Array.isArray(content) && content.some(b => b.type === "tool_result")) {
    return "Tool results (these are what actually happened):\n" + content.filter(b => b.type === "tool_result").map(b => `- ${b.is_error ? "FAILED: " : ""}${typeof b.content === "string" ? b.content : JSON.stringify(b.content)}`).join("\n") + "\nNow reply to the student in 1-3 short sentences, saying only what the tool results confirm.";
  }
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.map(b => b.type === "text" ? b.text : b.type === "tool_result" ? `Result: ${typeof b.content === "string" ? b.content : JSON.stringify(b.content)}` : "").filter(Boolean).join("\n");
}

// ---------- reading web pages (for "Add from a website" and link checks) ----------
function blockedHost(h) {
  h = h.toLowerCase();
  return h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.)/.test(h) || h.includes(":") || /^\d+$/.test(h);
}
function decodeEntities(t) {
  return t.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => { try { return String.fromCodePoint(+n); } catch { return ""; } });
}
function htmlToText(html) {
  const title = decodeEntities((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim()).slice(0, 200);
  let body = (html.match(/<article[\s\S]*?<\/article>/i) || html.match(/<main[\s\S]*?<\/main>/i) || html.match(/<body[\s\S]*?<\/body>/i) || [html])[0];
  body = body.replace(/<(script|style|noscript|svg|nav|footer|header|aside|form|iframe)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(br|\/p|\/div|\/h[1-6]|\/li|\/tr)[^>]*>/gi, "\n").replace(/<h([1-6])[^>]*>/gi, "\n## ").replace(/<li[^>]*>/gi, "\n- ").replace(/<[^>]+>/g, " ");
  const text = decodeEntities(body).replace(/[ \t]+/g, " ").replace(/\n\s*\n\s*/g, "\n\n").trim();
  return { title, text };
}
async function fetchPage(raw) {
  let u; try { u = new URL(raw); } catch { return { ok: false, error: "That isn't a valid link." }; }
  if (!/^https?:$/.test(u.protocol) || blockedHost(u.hostname)) return { ok: false, error: "That link can't be opened." };
  if (/(^|\.)(youtube\.com|youtu\.be)$/i.test(u.hostname)) return { ok: false, error: "Videos can't be read yet. Paste the notes or transcript instead." };
  try {
    const r = await fetch(u.toString(), { redirect: "follow", headers: { "User-Agent": "StudyFlowBot/1.0 (+https://opprodude44.github.io/studyflow/)", "Accept": "text/html,text/plain;q=0.9,*/*;q=0.5" }, signal: AbortSignal.timeout(12000) });
    if (!r.ok) return { ok: false, status: r.status, error: `That page returned an error (${r.status}).` };
    const type = r.headers.get("content-type") || "";
    if (!/text\/html|text\/plain|application\/xhtml/i.test(type)) return { ok: false, error: "Only web pages can be read. For a PDF, download it and add it as a file." };
    const raw2 = (await r.text()).slice(0, 2_000_000);
    const { title, text } = /text\/plain/i.test(type) ? { title: u.hostname, text: raw2 } : htmlToText(raw2);
    if (text.length < 200) return { ok: false, error: "I couldn't find readable text on that page." };
    return { ok: true, url: r.url, title: title || u.hostname, text: text.slice(0, 40000) };
  } catch (e) { return { ok: false, error: "That page didn't load. Check the link." }; }
}
async function checkLink(raw) {
  try {
    const u = new URL(raw); if (!/^https?:$/.test(u.protocol) || blockedHost(u.hostname)) return { url: raw, status: 0 };
    const r = await fetch(u.toString(), { method: "GET", redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (compatible; StudyFlowLinkCheck/1.0)" }, signal: AbortSignal.timeout(10000) });
    const html = (r.headers.get("content-type") || "").includes("html") ? (await r.text()).slice(0, 200000) : "";
    return { url: raw, status: r.status, final: r.url, title: (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim().slice(0, 140) };
  } catch (e) { return { url: raw, status: 0, error: String(e?.message || e).slice(0, 80) }; }
}
async function signedIn(auth) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, Authorization: auth } });
  return r.ok;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (request.method !== "POST") return json({ error: "Not found" }, 404, origin);
    if (!ALLOWED_ORIGINS.includes(origin) && !/^http:\/\/localhost(:\d+)?$/.test(origin)) return json({ error: "Not allowed" }, 403, origin);

    const auth = request.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) return json({ error: "Sign in again" }, 401, origin);
    const path = new URL(request.url).pathname;
    if (path === "/read" || path === "/check") {
      if (!(await signedIn(auth))) return json({ error: "Sign in again" }, 401, origin);
      let q; try { q = await request.json(); } catch { return json({ error: "Bad request" }, 400, origin); }
      if (path === "/read") return json(await fetchPage(String(q.url || "")), 200, origin);
      const urls = (Array.isArray(q.urls) ? q.urls : []).slice(0, 40).map(String);
      return json({ results: await Promise.all(urls.map(checkLink)) }, 200, origin);
    }
    // Counts this call for the signed-in person (and proves the sign-in is real).
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/bump_ai_usage`, { method: "POST", headers: { apikey: SUPABASE_KEY, Authorization: auth, "Content-Type": "application/json" }, body: "{}" });
    if (r.status === 401 || r.status === 403) return json({ error: "Sign in again" }, 401, origin);
    if (!r.ok) return json({ error: "Couldn't check your account" }, 502, origin);
    const used = Number(await r.json());
    if (used > DAILY_LIMIT) return json({ error: `You've used today's ${DAILY_LIMIT} AI requests. They reset tomorrow.` }, 429, origin);

    let body;
    try { body = await request.json(); } catch { return json({ error: "Bad request" }, 400, origin); }
    const raw = JSON.stringify(body || {});
    if (raw.length > 120000) return json({ error: "Too much text" }, 413, origin);
    if (raw.includes('"type":"image"')) return json({ error: "Reading photos is coming soon. Paste the text instead." }, 400, origin);

    let msgs = (Array.isArray(body.messages) ? body.messages : []).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: toText(m.content).slice(0, 40000) })).filter(m => m.content);
    // Chats start with the app's long briefing ("You are Flo...") merged with the student's first message.
    // Move the briefing into the system prompt so the model treats it as background and answers the student.
    let appRules = "";
    if (msgs.length > 1 && msgs[0].role === "user" && /^You are Flo/.test(msgs[0].content)) {
      const c0 = msgs[0].content, br = c0.lastIndexOf("\n\n");
      if (br > 0 && c0.length - br < 4000) { appRules = c0.slice(0, br); msgs[0] = { role: "user", content: c0.slice(br + 2) }; }
      else { appRules = c0; msgs.shift(); }
    }
    // The model reads about 24k tokens, so keep the newest messages within ~40k characters.
    let total = 0; const kept = [];
    for (let i = msgs.length - 1; i >= 0; i--) { total += msgs[i].content.length; if (total > 40000 && kept.length) break; kept.unshift(msgs[i]); }
    msgs = kept;
    if (msgs[0]?.role === "assistant") msgs.unshift({ role: "user", content: "(earlier conversation)" });
    if (!msgs.length) return json({ error: "Bad request" }, 400, origin);
    const last = body.messages?.[body.messages.length - 1];
    const afterTools = Array.isArray(last?.content) && last.content.some(b => b.type === "tool_result");
    const tools = !afterTools && Array.isArray(body.tools) && body.tools.length ? body.tools.slice(0, 12).map(t => ({ name: t.name, description: String(t.description || "").slice(0, 600), parameters: t.input_schema || { type: "object", properties: {} } })) : null;
    if (!msgs.length) return json({ error: "Bad request" }, 400, origin);
    const system = SAFETY + (appRules ? "\n\nBackground about the student and how StudyFlow works:\n" + appRules.slice(0, 20000) + "\n\nAlways answer the student's LATEST message directly. Don't repeat earlier replies." : "") + (body.json ? "\nReply with ONLY valid JSON, no other text and no code fences." : "\nKeep replies short and clear. Use simple Markdown when it helps.");
    const model = MODELS[body.tier] || MODELS.default;
    try {
      const input = { messages: [{ role: "system", content: system + (tools ? "\nYou can change the student's plan with the tools provided. Use a tool when they ask for a change; otherwise just answer." : "") }, ...msgs], max_tokens: body.json ? 2048 : 1024, temperature: 0.3 };
      if (tools) input.tools = tools;
      const out = await env.AI.run(tools ? MODELS.default : model, input);
      const calls = Array.isArray(out?.tool_calls) ? out.tool_calls : [];
      const content = [];
      const text = typeof out?.response === "string" ? out.response.trim() : out?.response && typeof out.response === "object" ? JSON.stringify(out.response) : "";
      if (text) content.push({ type: "text", text });
      calls.slice(0, 4).forEach((c, i) => {
        const name = c.name || c.function?.name; let args = c.arguments ?? c.function?.arguments ?? {};
        if (typeof args === "string") { try { args = JSON.parse(args); } catch { args = {}; } }
        if (name && tools?.some(t => t.name === name)) content.push({ type: "tool_use", id: `tu_${Date.now()}_${i}`, name, input: args || {} });
      });
      if (!content.length) return json({ error: "No answer" }, 502, origin);
      return json({ content, stop_reason: content.some(c => c.type === "tool_use") ? "tool_use" : "end_turn" }, 200, origin);
    } catch (e) {
      const msg = String(e?.message || e);
      if (/limit|quota|neuron|429/i.test(msg)) return json({ error: "Flo is very busy today. Try again tomorrow." }, 429, origin);
      return json({ error: "AI error. Try again." }, 502, origin);
    }
  }
};
