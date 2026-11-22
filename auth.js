/* StudyFlow accounts: sign up / sign in, and saving each person's plan to their account.
   Uses Supabase Auth (any email provider; optional Google, Microsoft and Apple) and one
   row per person in the `user_state` table, protected so people can only read their own. */
(function () {
  "use strict";
  const CFG = window.STUDYFLOW_CONFIG || {};
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const configured = /^https:\/\/.+/.test(CFG.supabaseUrl || "") && (CFG.supabaseAnonKey || "").length > 20 && !/YOUR-/.test(CFG.supabaseUrl + CFG.supabaseAnonKey);
  const sb = configured && window.supabase ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;
  const MIN_AGE = CFG.minimumAge || 13;
  const PROVIDERS = {
    google: ["Continue with Google", `<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 01-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.8A11 11 0 0012 23z"/><path fill="#FBBC05" d="M5.7 14.1a6.6 6.6 0 010-4.2V7.1H2.1a11 11 0 000 9.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 002.1 7.1l3.6 2.8C6.6 7.4 9.1 5.4 12 5.4z"/></svg>`],
    azure: ["Continue with Microsoft", `<svg viewBox="0 0 24 24"><path fill="#F25022" d="M2 2h9.5v9.5H2z"/><path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z"/><path fill="#00A4EF" d="M2 12.5h9.5V22H2z"/><path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z"/></svg>`],
    apple: ["Continue with Apple", `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.1zM13.9 4.9c.7-.9 1.2-2 1-3.2-1 .1-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5z"/></svg>`]
  };

  /* ---------- saving to the account ---------- */
  const AUTH = window.AUTH = {
    client: sb,
    user: null, guest: false, lastJson: null, pendingJson: null, timer: null, lastRemoteAt: null, saving: false,
    async getSession() { if (!sb) return null; const { data } = await sb.auth.getSession(); return data.session; },
    queueSave(json) {
      if (!this.user || json === this.lastJson || json === this.pendingJson) return;
      this.pendingJson = json; clearTimeout(this.timer); setSync("saving");
      this.timer = setTimeout(() => this.flush(), 1200);
    },
    async flush() {
      if (!this.pendingJson || !this.user || this.saving) return;
      const json = this.pendingJson; this.saving = true;
      const now = new Date().toISOString();
      const { error } = await sb.from("user_state").upsert({ user_id: this.user.id, state: JSON.parse(json), updated_at: now });
      this.saving = false;
      if (error) { setSync("offline"); clearTimeout(this.timer); this.timer = setTimeout(() => this.flush(), 15000); return; }
      this.lastJson = json; this.lastRemoteAt = now;
      if (this.pendingJson === json) { this.pendingJson = null; setSync("saved"); } else this.flush();
    },
    async signOut() {
      clearTimeout(this.timer); await this.flush();
      try { localStorage.removeItem("studyflow.v2:" + this.user?.id); } catch (e) {}
      await sb?.auth.signOut(); location.reload();
    },
    async deleteAccount() {
      const session = await this.getSession(); if (!session) return;
      const { error } = await sb.rpc("delete_my_account");
      if (error) throw error;
      try { localStorage.removeItem("studyflow.v2:" + this.user.id); } catch (e) {}
      await sb.auth.signOut(); location.reload();
    },
    async sendFeedback(message, kind) {
      const { error } = await sb.from("feedback").insert({ message: String(message).slice(0, 4000), kind, page: String(window.view || "").slice(0, 50) });
      if (error) throw error;
    },
    meta() { return this.user?.user_metadata || {}; },
    providerLabel() { const p = this.user?.app_metadata?.provider; return p === "google" ? "Google" : p === "azure" ? "Microsoft" : p === "apple" ? "Apple" : "email and password"; }
  };
  window.addEventListener("beforeunload", () => { if (AUTH.pendingJson) AUTH.flush(); });
  window.addEventListener("online", () => AUTH.flush());
  function setSync(st) {
    const el = $("#syncState"); if (!el) return;
    el.className = "sync " + st;
    el.innerHTML = `<i></i>${st === "saving" ? "Saving…" : st === "offline" ? "Offline. Will save when you're back." : AUTH.guest ? "Not saved to an account" : "Saved to your account"}`;
  }
  window.SF_setSync = setSync;

  /* Pick up changes made on another device when this tab comes back into view */
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState !== "visible" || !AUTH.user || AUTH.pendingJson) return;
    const { data } = await sb.from("user_state").select("updated_at").eq("user_id", AUTH.user.id).maybeSingle();
    if (data && AUTH.lastRemoteAt && data.updated_at > AUTH.lastRemoteAt) {
      const { data: row } = await sb.from("user_state").select("state,updated_at").eq("user_id", AUTH.user.id).maybeSingle();
      if (row) { AUTH.lastRemoteAt = row.updated_at; AUTH.lastJson = JSON.stringify(row.state); window.SF_replaceState(row.state); }
    }
  });

  /* ---------- screens ---------- */
  let mode = "signup", msg = null, busy = false, recovering = /type=recovery/.test(location.hash);
  const host = () => $("#auth");
  function show(html) { host().hidden = false; host().classList.remove("is-landing"); host().scrollTop = 0; host().innerHTML = `<div class="auth-in"><div class="logo"><i></i>StudyFlow</div>${html}</div>`; }
  function hide() { host().hidden = true; host().classList.remove("is-landing"); host().innerHTML = ""; }
  const errMsg = e => {
    const m = String(e?.message || e || "");
    if (/Invalid login credentials/i.test(m)) return "That email and password don't match. Try again, or reset your password.";
    if (/already registered|already been registered/i.test(m)) return "There's already an account with this email. Sign in instead.";
    if (/Email not confirmed/i.test(m)) return "Confirm your email first. We sent you a link.";
    if (/rate limit|too many/i.test(m)) return "Too many tries. Wait a minute and try again.";
    if (/Password should be/i.test(m)) return "Use at least 8 characters for your password.";
    if (/valid email|invalid email/i.test(m)) return "That doesn't look like an email address.";
    if (/Failed to fetch|NetworkError/i.test(m)) return "Can't reach StudyFlow. Check your internet connection.";
    return m || "Something went wrong. Try again.";
  };
  const years = () => { const y = new Date().getFullYear(); return Array.from({ length: 75 }, (_, i) => y - 6 - i); };
  const ageOK = by => new Date().getFullYear() - Number(by) - 1 >= MIN_AGE;
  const legal = `<label class="check"><input type="checkbox" id="a-terms" required><span>I agree to the <a href="terms.html" target="_blank" rel="noopener">Terms</a> and <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>, and I understand StudyFlow's assistant is an AI.</span></label>`;
  const yearSel = `<div class="f"><label for="a-year">Year you were born</label><select id="a-year" required><option value="">Choose…</option>${years().map(y => `<option>${y}</option>`).join("")}</select></div>`;
  const notice = () => msg ? `<p class="${msg.ok ? "ok" : "err"}" role="${msg.ok ? "status" : "alert"}">${esc(msg.text)}</p>` : "";

  function drawMain() {
    if (!sb) return show(`<h1>Almost ready</h1><div class="auth-card"><p>This copy of StudyFlow isn't connected to its database yet. Add your Supabase details to <code>config.js</code> (see the setup guide).</p><button class="btn" id="a-guest">Look around without an account</button></div>`);
    const prov = (CFG.providers || []).filter(p => PROVIDERS[p]);
    const up = mode === "signup";
    show(`<h1>${up ? "Create your account" : "Welcome back"}</h1>
      <p class="sub">${up ? "Your plan, quizzes and chats are saved to your account, on every device." : "Sign in to pick up where you left off."}</p>
      <div class="auth-card">
        <div class="seg" role="tablist"><button type="button" data-mode="signup" aria-pressed="${up}">Sign up</button><button type="button" data-mode="signin" aria-pressed="${!up}">Sign in</button></div>
        ${prov.length ? `<div class="oauth">${prov.map(p => `<button type="button" data-oauth="${p}">${PROVIDERS[p][1]}${PROVIDERS[p][0]}</button>`).join("")}</div><div class="or">or with email</div>` : ""}
        <form id="a-form" novalidate>
          ${up ? `<div class="f"><label for="a-name">First name</label><input id="a-name" autocomplete="given-name" required></div>` : ""}
          <div class="f"><label for="a-email">Email</label><input id="a-email" type="email" autocomplete="email" inputmode="email" required placeholder="you@example.com"></div>
          <div class="f"><label for="a-pw">Password</label><div class="pw"><input id="a-pw" type="password" autocomplete="${up ? "new-password" : "current-password"}" minlength="8" required style="width:100%"><button type="button" id="a-show">Show</button></div></div>
          ${up ? yearSel + legal : `<div style="text-align:right"><button type="button" class="linkbtn" id="a-forgot">Forgot password?</button></div>`}
          ${notice()}
          <button class="btn primary" id="a-go" ${busy ? "disabled" : ""}>${busy ? "One moment…" : up ? "Create account" : "Sign in"}</button>
        </form>
        <button type="button" class="linkbtn" id="a-magic" style="align-self:center">Email me a sign-in link instead</button>
      </div>
      <div class="emails" aria-label="Works with any email">${["Gmail", "Outlook", "Hotmail", "iCloud", "Yahoo", "School email"].map(e => `<span>${e}</span>`).join("")}</div>
      <p class="small">Works with any email address. <button type="button" class="linkbtn" id="a-guest">Look around first</button> · <button type="button" class="linkbtn" id="a-home">About StudyFlow</button></p>`);
    const f = $("#a-name") || $("#a-email"); if (f && !msg) f.focus();
  }

  /* ---------- public landing page (signed-out visitors) ---------- */
  const LAMP = `<svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true"><defs><radialGradient id="lg" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#FFD48A"/><stop offset="1" stop-color="#FFB648" stop-opacity="0"/></radialGradient></defs><circle cx="32" cy="30" r="26" fill="url(#lg)" opacity=".55"/><path d="M18 30c0-9 6-16 14-16s14 7 14 16z" fill="#FFB648"/><rect x="29" y="30" width="6" height="18" rx="3" fill="#7A6A55"/><rect x="20" y="48" width="24" height="6" rx="3" fill="#7A6A55"/><circle cx="27" cy="24" r="2.2" fill="#261600"/><circle cx="37" cy="24" r="2.2" fill="#261600"/><path d="M28 27.5q4 3 8 0" stroke="#261600" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>`;
  function drawLanding() {
    host().hidden = false;
    host().classList.add("is-landing");
    const feat = [
      ["🗓", "A timetable that plans itself", "Add your subjects, tests and activities once. StudyFlow plans study around school, sport and sleep, with prep before every test."],
      ["↻", "Plans change. So does yours.", "Can't do a session? Tap “Can't now” and it moves to the next free slot. Add a test and the prep appears by itself."],
      ["✦", "Flo, your study buddy", "Ask for explanations, notes or a plan for your week. Flo is an AI that can make real changes to your plan when you ask."],
      ["◎", "Guided study sessions", "Flo suggests what to study and for how long, sets one clear goal, and runs a calm focus timer."],
      ["🃏", "Quizzes and flashcards that come back", "Short quizzes and spaced flashcards bring topics back just before you'd forget them."],
      ["📚", "A library that knows your subjects", "Free resources for each subject, study guides, and any web page or PDF turned into notes, flashcards or a quiz."]
    ];
    const faq = [
      ["Is StudyFlow free?", "Yes. StudyFlow is free while it's in beta, and everything you see here is included."],
      ["Which students is it for?", "Students aged 13 and over, from middle school to university. It knows the IB Diploma, A-Levels, IGCSE/GCSE, AP, CBSE and more, and adapts its questions to your stage."],
      ["Is Flo always right?", "No. Flo is an AI and can make mistakes, so check important facts with your teacher or textbook. Flo never writes coursework for you."],
      ["What happens to my data?", "Your plan is saved privately to your account so it's on every device. We don't sell your data, and you can delete your account at any time. Read the <a href=\"privacy.html\">Privacy Policy</a>."],
      ["Does it work on my phone?", "Yes. Open it in your phone's browser and use “Add to Home Screen” to use it like an app."],
      ["Can I import my school calendar?", "Yes. Add a calendar file or link from ManageBac, iSAMS, Google, Apple, Outlook or Canvas, and tests and deadlines appear in your plan."]
    ];
    host().innerHTML = `<div class="lp">
      <header class="lp-nav"><div class="logo"><i></i>StudyFlow</div><div class="lp-nav-r"><button type="button" class="btn ghost" data-mode="signin">Sign in</button><button type="button" class="btn primary" data-mode="signup">Get started</button></div></header>
      <section class="lp-hero">
        <div class="lp-copy">
          <span class="lp-pill">Free during the beta</span>
          <h1>The study planner that <em>plans for you.</em></h1>
          <p>Tell StudyFlow about your subjects, tests and life once. It builds your timetable, reshuffles it when plans change, and helps you actually learn, with Flo, your AI study buddy.</p>
          <div class="lp-cta"><button type="button" class="btn primary big" data-mode="signup">Get started free</button><button type="button" class="btn big" id="a-guest">Look around first</button></div>
          <div class="lp-curr">${["IB Diploma", "A-Levels", "IGCSE / GCSE", "AP", "CBSE", "University"].map(c => `<span>${c}</span>`).join("")}</div>
        </div>
        <div class="lp-demo" aria-hidden="true">
          <div class="demo-card">
            <div class="demo-top"><span>Tuesday</span><b>Good evening, Sara</b></div>
            <div class="demo-flo">${LAMP}<p>Chemistry test is Friday and kinetics is your weak spot, so tonight is a 45-minute kinetics session. Saturday evening stays free.</p></div>
            <div class="demo-hero"><small>Today · 5:30 pm · 45 min</small><b>Chemistry</b><span>Rates of reaction: practice questions</span><div class="demo-btns"><i>▶ Start</i><em>Can't now</em></div></div>
            <div class="demo-days">${["Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => `<span class="${i === 0 ? "on" : ""}">${d}<b style="--h:${[60, 75, 40, 90, 25][i]}%"></b></span>`).join("")}</div>
            <div class="demo-mis"><span>✓ Finish a study session</span><span>✦ Explain a topic to Flo</span></div>
          </div>
        </div>
      </section>
      <section class="lp-steps"><h2>How it works</h2><ol>
        <li><b>Answer a few questions</b><span>About two minutes: your subjects, tests, activities and when you work best.</span></li>
        <li><b>Get your plan</b><span>Study sessions, test prep, weekly reviews and long projects, fitted around your life.</span></li>
        <li><b>Just follow it</b><span>Start sessions with one tap. If something comes up, StudyFlow moves things for you.</span></li>
      </ol></section>
      <section class="lp-feat"><h2>Everything in one place</h2><div class="lp-grid">${feat.map(([i, t, d]) => `<div class="lp-f"><span class="lp-ic">${i}</span><b>${t}</b><p>${d}</p></div>`).join("")}</div></section>
      <section class="lp-safe"><div><h2>Built for students, with care</h2><ul>
        <li><b>Private by default.</b> Only you can see your plan. We never sell your data.</li>
        <li><b>Honest AI.</b> Flo says it's an AI, can make mistakes, and won't write your coursework.</li>
        <li><b>Healthy limits.</b> Plans include breaks, protect sleep and cap daily study time.</li>
        <li><b>Ages 13+.</b> Under 18? Check with a parent or guardian before signing up.</li>
      </ul></div></section>
      <section class="lp-faq"><h2>Questions</h2>${faq.map(([q, ans]) => `<details><summary>${q}</summary><p>${ans}</p></details>`).join("")}</section>
      <section class="lp-end">${LAMP}<h2>Ready when you are.</h2><p>It takes about two minutes to set up.</p><button type="button" class="btn primary big" data-mode="signup">Get started free</button></section>
      <footer class="lp-foot"><div><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a></div>
        <p>© ${new Date().getFullYear()} StudyFlow. StudyFlow is an independent study tool. It isn't affiliated with or endorsed by the International Baccalaureate Organization, Cambridge, the College Board or any exam board. IB, SAT and other names are trademarks of their owners.</p></footer>
    </div>`;
  }
  function drawSimple(title, body) { show(`<h1>${title}</h1><div class="auth-card">${body}</div>`); }

  async function submit() {
    msg = null;
    const email = $("#a-email").value.trim(), pw = $("#a-pw").value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg = { text: "Enter your email address, like name@gmail.com." }; return keep(email); }
    if (pw.length < 8) { msg = { text: "Your password needs at least 8 characters." }; return keep(email); }
    if (mode === "signup") {
      const name = $("#a-name").value.trim(), by = $("#a-year").value;
      if (!name) { msg = { text: "Add your first name." }; return keep(email); }
      if (!by) { msg = { text: "Choose the year you were born." }; return keep(email); }
      if (!ageOK(by)) { msg = { text: `StudyFlow is for students aged ${MIN_AGE} and over.` }; return keep(email); }
      if (!$("#a-terms").checked) { msg = { text: "Tick the box to agree to the Terms and Privacy Policy." }; return keep(email); }
      busy = true; keep(email);
      const { data, error } = await sb.auth.signUp({ email, password: pw, options: { emailRedirectTo: location.origin + location.pathname, data: { name, birth_year: Number(by), accepted_terms_at: new Date().toISOString() } } });
      busy = false;
      if (error) { msg = { text: errMsg(error) }; return keep(email); }
      if (!data.session) return drawSimple("Check your inbox", `<p>We sent a confirmation link to <b>${esc(email)}</b>. Open it on this device to finish creating your account.</p><p class="small">Can't find it? Check spam or promotions.</p><button class="btn" id="a-back">Back to sign in</button>`);
    } else {
      busy = true; keep(email);
      const { error } = await sb.auth.signInWithPassword({ email, password: pw });
      busy = false;
      if (error) { msg = { text: errMsg(error) }; return keep(email); }
    }
  }
  function keep(email) { const name = $("#a-name")?.value, year = $("#a-year")?.value, terms = $("#a-terms")?.checked, pw = $("#a-pw")?.value; drawMain(); $("#a-email").value = email; if ($("#a-pw")) $("#a-pw").value = pw || ""; if ($("#a-name")) $("#a-name").value = name || ""; if ($("#a-year")) $("#a-year").value = year || ""; if ($("#a-terms")) $("#a-terms").checked = !!terms; }

  async function magic() {
    const email = $("#a-email")?.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "")) { msg = { text: "Type your email above first, then tap the link option." }; return drawMain(); }
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname, shouldCreateUser: true } });
    if (error) { msg = { text: errMsg(error) }; return keep(email); }
    drawSimple("Check your inbox", `<p>We sent a sign-in link to <b>${esc(email)}</b>. Open it on this device and you're in.</p><button class="btn" id="a-back">Back</button>`);
  }
  async function forgot() {
    const email = $("#a-email")?.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "")) { msg = { text: "Type your email above first." }; return drawMain(); }
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    if (error) { msg = { text: errMsg(error) }; return keep(email); }
    drawSimple("Check your inbox", `<p>If there's an account for <b>${esc(email)}</b>, we sent a link to set a new password.</p><button class="btn" id="a-back">Back to sign in</button>`);
  }
  function drawReset() {
    drawSimple("Set a new password", `<form id="a-reset"><div class="f"><label for="a-new">New password</label><input id="a-new" type="password" minlength="8" autocomplete="new-password" required></div>${notice()}<button class="btn primary">Save password</button></form>`);
  }
  function drawAgeGate(user) {
    const name = user.user_metadata?.full_name || user.user_metadata?.name || "";
    drawSimple("One more thing", `<p class="muted">Before we set up your plan${name ? `, ${esc(name.split(" ")[0])}` : ""}:</p><form id="a-age">${yearSel}${legal}${notice()}<button class="btn primary">Continue</button></form>`);
  }

  host()?.addEventListener("click", async e => {
    const t = e.target.closest("button,a"); if (!t || t.tagName === "A") return;
    if (t.dataset.mode) { mode = t.dataset.mode; msg = null; return drawMain(); }
    if (t.dataset.oauth) { const { error } = await sb.auth.signInWithOAuth({ provider: t.dataset.oauth, options: { redirectTo: location.origin + location.pathname } }); if (error) { msg = { text: errMsg(error) }; drawMain(); } return; }
    if (t.id === "a-show") { const i = $("#a-pw"); i.type = i.type === "password" ? "text" : "password"; t.textContent = i.type === "password" ? "Show" : "Hide"; return; }
    if (t.id === "a-magic") return magic();
    if (t.id === "a-forgot") return forgot();
    if (t.id === "a-back") { msg = null; mode = "signin"; return drawMain(); }
    if (t.id === "a-home") { msg = null; return drawLanding(); }
    if (t.id === "a-guest") { AUTH.guest = true; hide(); window.SF_boot(null, { guest: true }); setSync("saved"); }
  });
  host()?.addEventListener("submit", async e => {
    e.preventDefault();
    if (e.target.id === "a-form") return submit();
    if (e.target.id === "a-reset") {
      const pw = $("#a-new").value; if (pw.length < 8) { msg = { text: "Use at least 8 characters." }; return drawReset(); }
      const { error } = await sb.auth.updateUser({ password: pw });
      if (error) { msg = { text: errMsg(error) }; return drawReset(); }
      msg = null; recovering = false; history.replaceState(null, "", location.pathname); const { data } = await sb.auth.getSession(); if (data.session) enter(data.session.user);
    }
    if (e.target.id === "a-age") {
      const by = $("#a-year").value;
      if (!by) { msg = { text: "Choose the year you were born." }; return drawAgeGate(AUTH.user); }
      if (!ageOK(by)) { msg = { text: `StudyFlow is for students aged ${MIN_AGE} and over.` }; await sb.auth.signOut(); AUTH.user = null; return drawSimple("Sorry", `<p>StudyFlow is for students aged ${MIN_AGE} and over.</p>`); }
      if (!$("#a-terms").checked) { msg = { text: "Tick the box to continue." }; return drawAgeGate(AUTH.user); }
      const { data, error } = await sb.auth.updateUser({ data: { birth_year: Number(by), accepted_terms_at: new Date().toISOString() } });
      if (error) { msg = { text: errMsg(error) }; return drawAgeGate(AUTH.user); }
      msg = null; enter(data.user);
    }
  });

  /* ---------- after sign-in: load this person's saved plan ---------- */
  let entered = null;
  async function enter(user) {
    AUTH.user = user;
    if (!user.user_metadata?.birth_year) return drawAgeGate(user);
    if (entered === user.id) return; entered = user.id;
    show(`<h1>Loading your plan…</h1>`);
    const { data: row, error } = await sb.from("user_state").select("state,updated_at").eq("user_id", user.id).maybeSingle();
    hide();
    let remote = null, isNew = false;
    if (error) {
      let cached = null; try { cached = JSON.parse(localStorage.getItem("studyflow.v2:" + user.id) || "null"); } catch (e) {}
      remote = cached; setTimeout(() => setSync("offline"), 0);
    } else if (row) { remote = row.state; AUTH.lastRemoteAt = row.updated_at; AUTH.lastJson = JSON.stringify(row.state); }
    else {
      let legacy = null; try { legacy = JSON.parse(localStorage.getItem("studyflow.v2:guest") || "null"); } catch (e) {}
      if (legacy && !legacy.example) remote = legacy; else isNew = true;
    }
    window.SF_boot(remote, { isNew, name: (user.user_metadata?.name || user.user_metadata?.full_name || "").split(" ")[0] });
    setSync("saved");
  }

  async function start() {
    if (!host()) return;
    if (!sb) return drawMain();
    sb.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") { AUTH.user = session?.user || null; return drawReset(); }
      if (event === "SIGNED_IN" && session?.user && !AUTH.guest) { if (recovering) { AUTH.user = session.user; return drawReset(); } enter(session.user); }
      if (event === "SIGNED_OUT") { AUTH.user = null; }
    });
    const { data } = await sb.auth.getSession();
    if (data.session && recovering) { AUTH.user = data.session.user; drawReset(); }
    else if (data.session) enter(data.session.user); else drawLanding();
  }
  start();
})();
