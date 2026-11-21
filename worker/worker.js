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
- Be accurate. If you're not sure, say so.`;

function cors(origin) {
  const ok = ALLOWED_ORIGINS.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin || "");
  return { "Access-Control-Allow-Origin": ok ? origin : ALLOWED_ORIGINS[0], "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Max-Age": "86400", "Vary": "Origin" };
}
const json = (body, status, origin) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors(origin) } });

function toText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.map(b => b.type === "text" ? b.text : b.type === "tool_result" ? `Result: ${typeof b.content === "string" ? b.content : JSON.stringify(b.content)}` : "").filter(Boolean).join("\n");
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (request.method !== "POST") return json({ error: "Not found" }, 404, origin);
    if (!ALLOWED_ORIGINS.includes(origin) && !/^http:\/\/localhost(:\d+)?$/.test(origin)) return json({ error: "Not allowed" }, 403, origin);

    const auth = request.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) return json({ error: "Sign in again" }, 401, origin);
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

    const msgs = (Array.isArray(body.messages) ? body.messages : []).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: toText(m.content).slice(0, 60000) })).filter(m => m.content);
    if (!msgs.length) return json({ error: "Bad request" }, 400, origin);
    const system = SAFETY + (body.json ? "\nReply with ONLY valid JSON, no other text and no code fences." : "\nKeep replies short and clear. Use simple Markdown when it helps.");
    const model = MODELS[body.tier] || MODELS.default;
    try {
      const out = await env.AI.run(model, { messages: [{ role: "system", content: system }, ...msgs], max_tokens: body.json ? 2048 : 1024, temperature: 0.4 });
      const text = typeof out?.response === "string" ? out.response : typeof out?.response === "object" ? JSON.stringify(out.response) : "";
      if (!text) return json({ error: "No answer" }, 502, origin);
      return json({ content: [{ type: "text", text }], stop_reason: "end_turn" }, 200, origin);
    } catch (e) {
      const msg = String(e?.message || e);
      if (/limit|quota|neuron|429/i.test(msg)) return json({ error: "Flo is very busy today. Try again tomorrow." }, 429, origin);
      return json({ error: "AI error. Try again." }, 502, origin);
    }
  }
};
