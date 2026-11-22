/* StudyFlow live calendars.
   People paste a calendar link once (ManageBac, iSAMS, Google, Apple, Outlook, Canvas…).
   StudyFlow re-checks every link whenever the app is opened (and every 10 minutes while it's open),
   so new tests and moved deadlines appear without re-uploading. */
(function () {
  "use strict";
  const CFG = window.STUDYFLOW_CONFIG || {};
  let FEEDS = [], busy = false, loaded = false;
  const db = () => window.AUTH?.client;
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const ago = iso => { if (!iso) return "not yet"; const m = Math.round((Date.now() - Date.parse(iso)) / 60000); return m < 1 ? "just now" : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };
  const SRC = u => /managebac/i.test(u) ? "ManageBac" : /isams/i.test(u) ? "iSAMS" : /google\.com/i.test(u) ? "Google Calendar" : /icloud|apple/i.test(u) ? "Apple Calendar" : /outlook|office|live\.com|microsoft/i.test(u) ? "Outlook" : /instructure|canvas/i.test(u) ? "Canvas" : /toddle/i.test(u) ? "Toddle" : /schoology/i.test(u) ? "Schoology" : "Calendar";

  // Each linked calendar is fetched through StudyFlow's server whenever the app opens or comes back into view.
  const hashOf = t => { let h = 5381; for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return String(h >>> 0); };
  async function fetchFeed(url) {
    const s = await window.AUTH?.getSession?.(); if (!s || !CFG.aiUrl) return { ok: false, error: "Not signed in" };
    try {
      const r = await fetch(CFG.aiUrl.replace(/\/$/, "") + "/ics", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${s.access_token}` }, body: JSON.stringify({ url }) });
      return await r.json();
    } catch (e) { return { ok: false, error: "Couldn't reach StudyFlow's server." }; }
  }
  async function syncOne(f) {
    const k = "feed-" + f.id, res = await fetchFeed(f.url);
    f.fetched_at = new Date().toISOString();
    if (!res.ok) { f.status = "error"; f.error = res.error; return; }
    f.status = "ok"; f.error = null;
    const h = hashOf(res.ics);
    if (state.ext?.[k]?.hash !== h) importICS(res.ics, f.label || f.source, null, { key: k, name: f.label || f.source, quiet: !!state.ext?.[k], hash: h });
  }
  let lastAll = 0;
  async function refresh(force) {
    if (!window.AUTH?.user || busy || !db()) return; busy = true;
    try {
      const { data, error } = await db().from("calendar_feeds").select("id,url,label,source,created_at").order("created_at");
      if (error) throw error;
      const prev = Object.fromEntries(FEEDS.map(f => [f.id, f]));
      FEEDS = (data || []).map(f => ({ ...prev[f.id], ...f })); loaded = true;
      if (force || Date.now() - lastAll > 10 * 60000) { lastAll = Date.now(); for (const f of FEEDS) await syncOne(f); }
      Object.keys(state.ext || {}).filter(k => k.startsWith("feed-") && !FEEDS.some(f => "feed-" + f.id === k)).forEach(k => { delete state.ext[k]; state.tasks = state.tasks.filter(t => t.ext !== k); });
      if (!document.querySelector("#overlay").innerHTML) render();
    } catch (e) { console.warn("calendar sync", e); }
    finally { busy = false; }
  }

  window.SF_addFeed = async function (url) {
    if (!window.AUTH?.user) return toast("Create a free account to link a calendar.");
    url = String(url || "").trim();
    if (!/^(webcal|https):\/\/\S+$/i.test(url)) return toast("That doesn't look like a calendar link. It should start with https:// or webcal://");
    const source = SRC(url);
    closeOverlay(); toast(`Linking ${source}…`);
    const test = await fetchFeed(url);
    if (!test.ok) return toast(`${source}: ${test.error}`);
    const { data, error } = await db().from("calendar_feeds").insert({ user_id: window.AUTH.user.id, url, source, label: source }).select("id").single();
    if (error) return toast(/up to 10/i.test(error.message) ? "You can link up to 10 calendars." : "Couldn't save that link. Try again.");
    const f = { id: data.id, url, source, label: source }; FEEDS.push(f);
    importICS(test.ics, source, null, { key: "feed-" + data.id, name: source, quiet: false, hash: hashOf(test.ics) });
    f.status = "ok"; f.fetched_at = new Date().toISOString();
    toast(`${source} linked. StudyFlow checks it for changes every time you open the app.`);
    await refresh(false);
  };
  async function removeFeed(id) {
    await db().from("calendar_feeds").delete().eq("id", id);
    await refresh(false); toast("Calendar unlinked. Its events were removed from your plan.");
  }

  window.openAddFeed = function () {
    showModal(`<div class="label">Link a calendar</div><h2>Paste your calendar link</h2>
      <p class="muted">Do this once. StudyFlow checks the link every time you open it, so new tests, homework and changes show up by themselves.</p>
      <div class="f"><label for="feedUrl">Calendar link</label><input id="feedUrl" placeholder="webcal://… or https://….ics" autocomplete="off" inputmode="url"></div>
      <details class="feedhelp"><summary>Where do I find my link?</summary><ul>
        <li><b>ManageBac:</b> Calendar, then the Subscribe option. Copy the link it shows.</li>
        <li><b>Google Calendar:</b> Settings, then click your calendar, then “Secret address in iCal format”.</li>
        <li><b>Apple Calendar (iCloud):</b> share the calendar, turn on Public Calendar, and copy the link.</li>
        <li><b>Outlook:</b> Settings, Calendar, Shared calendars, Publish a calendar, then copy the ICS link.</li>
        <li><b>iSAMS, Canvas, Toddle, Schoology:</b> look for “Subscribe”, “iCal” or “Calendar feed”.</li>
      </ul></details>
      <div class="row"><button class="btn primary" data-feed="add">Link it</button><button class="btn ghost" data-act="close">Cancel</button></div>`);
    setTimeout(() => document.querySelector("#feedUrl")?.focus(), 40);
  };
  window.SF_feedsCard = function () {
    if (!window.AUTH?.user) return "";
    return `<div class="card"><div class="group-h"><h3>Live calendars</h3>${FEEDS.length ? `<button class="btn small ghost" data-feed="sync">Check now</button>` : ""}</div>
      <p class="muted" style="font-size:14px">Linked calendars update by themselves whenever you open StudyFlow.</p>
      ${FEEDS.length ? `<ul class="feeds">${FEEDS.map(f => `<li><i class="dot ${f.status === "error" ? "err" : ""}"></i><span><b>${esc(f.label || f.source)}</b><small>${f.status === "error" ? esc(f.error || "Couldn't reach this calendar") : `Updated ${ago(f.fetched_at)}`}${state.ext?.["feed-" + f.id]?.counts ? ` · ${plural(state.ext["feed-" + f.id].counts.tasks || 0, "deadline")}, ${plural(state.ext["feed-" + f.id].counts.lessons || 0, "lesson")}` : ""}</small></span><button class="btn small ghost" data-feed="remove" data-id="${f.id}">Unlink</button></li>`).join("")}</ul>` : ""}
      <div class="row"><button class="btn small primary" data-feed="open">+ Link a calendar</button></div></div>`;
  };
  window.SF_feedNudge = function () {
    if (!window.AUTH?.user || !loaded || FEEDS.length || state.feedNudgeOff) return "";
    return `<div class="consent"><span class="ic">🔗</span><div style="display:flex;flex-direction:column;gap:8px"><b>Link your school calendar</b><p class="muted" style="font-size:14px">Paste your ManageBac, iSAMS, Google or Apple calendar link once. New tests and changes then flow in by themselves.</p><div class="row"><button class="btn small primary" data-feed="open">Link a calendar</button><button class="btn small ghost" data-feed="later">Not now</button></div></div></div>`;
  };

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-feed]"); if (!b) return;
    const k = b.dataset.feed;
    if (k === "open") return window.openAddFeed();
    if (k === "add") return window.SF_addFeed(document.querySelector("#feedUrl")?.value);
    if (k === "remove") return removeFeed(b.dataset.id);
    if (k === "later") { state.feedNudgeOff = true; return render(); }
    if (k === "sync") { toast("Checking your calendars…"); return refresh(true); }
  });
  document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.id === "feedUrl") { e.preventDefault(); window.SF_addFeed(e.target.value); } });
  window.addEventListener("sf:booted", () => refresh(false));
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") refresh(false); });
  setInterval(() => refresh(false), 10 * 60000);
})();
