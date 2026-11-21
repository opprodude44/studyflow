/* StudyFlow AI bridge.
   The app was first built inside Claude, where `window.claude.use("sample")` asks Claude directly.
   On the real website the same calls go to our own server function (supabase/functions/ai),
   which keeps the Anthropic API key secret, checks the user is signed in, and applies daily limits.
   This file recreates that same interface so the app code works unchanged. */
(function () {
  "use strict";
  window.SF_WEB = true;
  const CFG = window.STUDYFLOW_CONFIG || {};
  const fnUrl = () => `${CFG.supabaseUrl}/functions/v1/ai`;

  function mergeTurns(input) {
    const turns = typeof input === "string" ? [{ role: "user", content: input }] : input.map(t => ({ role: t.role, content: t.content }));
    const out = [];
    for (const t of turns) {
      const last = out[out.length - 1];
      if (last && last.role === t.role && typeof last.content === "string" && typeof t.content === "string") last.content += "\n\n" + t.content;
      else out.push({ ...t });
    }
    return out;
  }

  async function imageBlock(blob) {
    const bmp = await createImageBitmap(blob);
    const scale = Math.min(1, 1568 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    const data = c.toDataURL("image/jpeg", 0.85).split(",")[1];
    return { type: "image", source: { type: "base64", media_type: "image/jpeg", data } };
  }

  async function post(body, signal) {
    const session = await window.AUTH?.getSession?.();
    if (!session) throw { code: "not_granted", message: "Not signed in" };
    let res;
    try {
      res = await fetch(fnUrl(), {
        method: "POST", signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, apikey: CFG.supabaseAnonKey },
        body: JSON.stringify(body)
      });
    } catch (e) {
      if (e?.name === "AbortError") throw { code: "cancelled", message: "Stopped" };
      throw { code: "upstream_error", message: "Network error" };
    }
    let data = null; try { data = await res.json(); } catch (e) {}
    if (res.status === 401) throw { code: "session_expired", message: "Sign in again" };
    if (res.status === 429) throw { code: "rate_limited", message: data?.error || "Limit reached" };
    if (res.status === 413) throw { code: "prompt_too_large", message: "Too much text" };
    if (!res.ok || !data) throw { code: "upstream_error", message: data?.error || `HTTP ${res.status}` };
    return data;
  }

  function makeSample() {
    async function sample(input, opts = {}) {
      const messages = mergeTurns(input);
      if (opts.images) {
        const list = Array.from(opts.images instanceof Blob ? [opts.images] : opts.images).slice(0, 4);
        const blocks = await Promise.all(list.map(imageBlock));
        const last = messages[messages.length - 1];
        last.content = [...blocks, { type: "text", text: last.content }];
      }
      const tools = Array.isArray(opts.tools) ? opts.tools : null;
      const toolDefs = tools && tools.map(t => ({ name: t.name, description: t.description, input_schema: t.inputSchema || { type: "object", properties: {} } }));
      let all = "";
      for (let round = 0; round < 6; round++) {
        if (opts.signal?.aborted) throw { code: "cancelled", message: "Stopped", text: all || undefined };
        let msg;
        try { msg = await post({ tier: opts.modelTier || "default", messages, tools: toolDefs || undefined, json: !!opts.__json }, opts.signal); }
        catch (e) { if (all) e.text = all; throw e; }
        const text = (msg.content || []).filter(c => c.type === "text").map(c => c.text).join("");
        if (text) { all += (all ? "\n\n" : "") + text; try { opts.onText?.({ text: all, delta: text }); } catch (e) { console.error(e); } }
        const uses = (msg.content || []).filter(c => c.type === "tool_use");
        if (!uses.length || !tools) {
          if (!all) throw { code: "empty_completion", message: "No answer" };
          return { text: all, truncated: msg.stop_reason === "max_tokens", modelTierApplied: opts.modelTier || "default" };
        }
        messages.push({ role: "assistant", content: msg.content });
        const results = await Promise.all(uses.map(async u => {
          const t = tools.find(x => x.name === u.name);
          try {
            if (!t) throw new Error("Unknown tool");
            const r = await t.execute(u.input || {}, { signal: opts.signal || new AbortController().signal });
            return { type: "tool_result", tool_use_id: u.id, content: typeof r === "string" ? r : JSON.stringify(r ?? "") };
          } catch (e) { return { type: "tool_result", tool_use_id: u.id, content: "Error: " + (e?.message || String(e)), is_error: true }; }
        }));
        messages.push({ role: "user", content: results });
      }
      return { text: all, truncated: true, modelTierApplied: opts.modelTier || "default" };
    }
    sample.json = async function (input, opts = {}) {
      const { text } = await sample(input, { ...opts, __json: true });
      const tryParse = s => { try { return JSON.parse(s); } catch (e) { return undefined; } };
      let v = tryParse(text.trim());
      if (v === undefined) { const m = text.match(/```(?:json)?\s*([\s\S]*?)```/); if (m) v = tryParse(m[1]); }
      if (v === undefined) { const a = text.search(/[\[{]/), b = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]")); if (a >= 0 && b > a) v = tryParse(text.slice(a, b + 1)); }
      if (v === undefined) throw { code: "invalid_json", message: "Reply was not JSON", text };
      return v;
    };
    sample.limits = async () => ({ maxPromptBytes: 262144, tools: { maxCount: 10 }, images: { maxCount: 4, maxInputBytes: 20e6, mediaTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] } });
    return sample;
  }

  window.__sfSample = makeSample();
})();
