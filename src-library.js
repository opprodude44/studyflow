/* ================= Library: free resources, StudyFlow guides, material from any website ================= */
/* Every resource link was checked on 22 Nov 2026. Keep descriptions factual. */
const RES = [
  // general
  {id:"ka", name:"Khan Academy", url:"https://www.khanacademy.org/", kind:"Course", tags:["all"], desc:"Free lessons and practice for almost every school subject."},
  {id:"ls", name:"The Learning Scientists", url:"https://www.learningscientists.org/downloadable-materials", kind:"Study skills", tags:["study"], desc:"Free posters and guides on study methods backed by research, like retrieval practice and spacing.", read:true},
  {id:"os", name:"OpenStax textbooks", url:"https://openstax.org/subjects", kind:"Textbooks", tags:["all"], desc:"Free, peer-reviewed university and AP-level textbooks from Rice University."},
  {id:"desmos", name:"Desmos graphing calculator", url:"https://www.desmos.com/calculator", kind:"Tool", tags:["math","physics","economics","sat"], desc:"Free online graphing calculator. The digital SAT has a Desmos calculator built in."},
  {id:"gg", name:"GeoGebra calculator suite", url:"https://www.geogebra.org/calculator", kind:"Tool", tags:["math"], desc:"Free graphing, geometry and 3D calculators."},
  {id:"phet", name:"PhET simulations", url:"https://phet.colorado.edu/en/simulations/browse", kind:"Simulations", tags:["physics","chemistry","biology","math"], desc:"Free interactive science and maths simulations from the University of Colorado Boulder."},
  // maths
  {id:"ka-math", name:"Khan Academy: Math", url:"https://www.khanacademy.org/math", kind:"Course", tags:["math"], desc:"Lessons and practice from algebra to calculus and statistics."},
  {id:"lamar", name:"Paul's Online Math Notes", url:"https://tutorial.math.lamar.edu/", kind:"Notes", tags:["math"], desc:"Clear notes and worked examples for algebra and calculus.", read:true},
  {id:"3b1b", name:"3Blue1Brown", url:"https://www.3blue1brown.com/", kind:"Videos", tags:["math"], desc:"Visual explanations of calculus, linear algebra and more."},
  {id:"mif", name:"Math is Fun", url:"https://www.mathsisfun.com/", kind:"Reference", tags:["math","middle"], desc:"Simple explanations of maths ideas, good for quick refreshers.", read:true},
  {id:"os-calc", name:"OpenStax: Calculus Volume 1", url:"https://openstax.org/details/books/calculus-volume-1", kind:"Textbook", tags:["math"], desc:"Free calculus textbook: limits, derivatives and integrals."},
  // physics
  {id:"ka-phys", name:"Khan Academy: Physics", url:"https://www.khanacademy.org/science/physics", kind:"Course", tags:["physics"], desc:"Videos and practice across mechanics, waves, electricity and more."},
  {id:"pc", name:"The Physics Classroom", url:"https://www.physicsclassroom.com/", kind:"Notes", tags:["physics"], desc:"Plain-English tutorials and concept checks for school physics.", read:true},
  {id:"hp", name:"HyperPhysics", url:"http://hyperphysics.phy-astr.gsu.edu/hbase/index.html", kind:"Reference", tags:["physics"], desc:"A huge map of physics concepts from Georgia State University.", read:true},
  {id:"os-phys", name:"OpenStax: College Physics 2e", url:"https://openstax.org/details/books/college-physics-2e", kind:"Textbook", tags:["physics"], desc:"Free algebra-based physics textbook."},
  // chemistry
  {id:"ka-chem", name:"Khan Academy: Chemistry", url:"https://www.khanacademy.org/science/chemistry", kind:"Course", tags:["chemistry"], desc:"Lessons and practice from atoms to equilibrium and kinetics."},
  {id:"cg", name:"Chemguide", url:"https://www.chemguide.co.uk/", kind:"Notes", tags:["chemistry"], desc:"Detailed explanations of A-level and IB-level chemistry topics.", read:true},
  {id:"os-chem", name:"OpenStax: Chemistry 2e", url:"https://openstax.org/details/books/chemistry-2e", kind:"Textbook", tags:["chemistry"], desc:"Free general chemistry textbook."},
  // biology
  {id:"ka-bio", name:"Khan Academy: Biology", url:"https://www.khanacademy.org/science/biology", kind:"Course", tags:["biology"], desc:"Lessons and practice from cells to ecology."},
  {id:"os-bio", name:"OpenStax: Biology 2e", url:"https://openstax.org/details/books/biology-2e", kind:"Textbook", tags:["biology"], desc:"Free biology textbook."},
  {id:"amoeba", name:"Amoeba Sisters", url:"https://www.youtube.com/@AmoebaSisters", kind:"Videos", tags:["biology"], desc:"Short, friendly biology explainer videos."},
  // economics, business, psychology
  {id:"ka-econ", name:"Khan Academy: Economics", url:"https://www.khanacademy.org/economics-finance-domain", kind:"Course", tags:["economics","business"], desc:"Micro, macro and finance lessons with practice."},
  {id:"os-econ", name:"OpenStax: Principles of Economics 3e", url:"https://openstax.org/details/books/principles-economics-3e", kind:"Textbook", tags:["economics"], desc:"Free economics textbook covering micro and macro."},
  {id:"inv", name:"Investopedia", url:"https://www.investopedia.com/", kind:"Reference", tags:["economics","business"], desc:"Definitions and explainers for economics and business terms.", read:true},
  {id:"owid", name:"Our World in Data", url:"https://ourworldindata.org/", kind:"Data", tags:["economics","geography","history","biology"], desc:"Charts and data on global issues, great for real-world examples."},
  {id:"os-bus", name:"OpenStax: Introduction to Business", url:"https://openstax.org/details/books/introduction-business", kind:"Textbook", tags:["business"], desc:"Free introductory business textbook."},
  {id:"os-psych", name:"OpenStax: Psychology 2e", url:"https://openstax.org/details/books/psychology-2e", kind:"Textbook", tags:["psychology"], desc:"Free introductory psychology textbook."},
  {id:"sp", name:"Simply Psychology", url:"https://www.simplypsychology.org/", kind:"Notes", tags:["psychology"], desc:"Summaries of key studies, theories and research methods.", read:true},
  // humanities
  {id:"ka-hist", name:"Khan Academy: World History", url:"https://www.khanacademy.org/humanities/world-history", kind:"Course", tags:["history"], desc:"Lessons from ancient civilisations to the 20th century."},
  {id:"cgeo", name:"Coolgeography", url:"https://www.coolgeography.co.uk/", kind:"Notes", tags:["geography"], desc:"Notes and case studies for GCSE, A-level and IB geography.", read:true},
  {id:"bitesize", name:"BBC Bitesize", url:"https://www.bbc.co.uk/bitesize", kind:"Notes", tags:["middle","igcse","all"], desc:"Free revision guides for UK school subjects."},
  {id:"crash", name:"CrashCourse", url:"https://www.youtube.com/@crashcourse", kind:"Videos", tags:["history","biology","chemistry","psychology","economics","literature","tok"], desc:"Fast, engaging video courses across many subjects."},
  // english and writing
  {id:"owl", name:"Purdue OWL: Writing", url:"https://owl.purdue.edu/owl/general_writing/index.html", kind:"Writing", tags:["english","writing","ee","ia","tok"], desc:"How to plan, structure and polish essays.", read:true},
  {id:"owl-mla", name:"Purdue OWL: MLA format", url:"https://owl.purdue.edu/owl/research_and_citation/mla_style/mla_formatting_and_style_guide/mla_general_format.html", kind:"Writing", tags:["writing","ee","ia"], desc:"How to format and cite sources in MLA style.", read:true},
  {id:"poetry", name:"Poetry Foundation", url:"https://www.poetryfoundation.org/", kind:"Reference", tags:["english"], desc:"Thousands of poems, poet biographies and glossary terms."},
  {id:"scholar", name:"Google Scholar", url:"https://scholar.google.com/", kind:"Research", tags:["ee","ia","writing"], desc:"Search academic papers and books for your EE or IA."},
  {id:"zotero", name:"Zotero", url:"https://www.zotero.org/", kind:"Tool", tags:["ee","ia","writing"], desc:"Free tool that collects your sources and formats citations."},
  // languages
  {id:"sd", name:"SpanishDict", url:"https://www.spanishdict.com/", kind:"Reference", tags:["spanish"], desc:"Dictionary, verb conjugations and grammar guides."},
  {id:"lawsp", name:"Lawless Spanish", url:"https://www.lawlessspanish.com/", kind:"Notes", tags:["spanish"], desc:"Free Spanish grammar and vocabulary lessons.", read:true},
  // computing
  {id:"cs50", name:"Harvard CS50", url:"https://cs50.harvard.edu/x/", kind:"Course", tags:["computer"], desc:"Harvard's free introduction to computer science."},
  {id:"ka-cs", name:"Khan Academy: Computing", url:"https://www.khanacademy.org/computing", kind:"Course", tags:["computer"], desc:"Programming, algorithms and how computers work."},
  // official
  {id:"ib-dp", name:"IB: Diploma Programme", url:"https://www.ibo.org/programmes/diploma-programme/", kind:"Official", tags:["ib"], desc:"The IB's own overview of the Diploma Programme."},
  {id:"ib-tok", name:"IB: Theory of knowledge", url:"https://www.ibo.org/programmes/diploma-programme/curriculum/dp-core/theory-of-knowledge/", kind:"Official", tags:["tok","ib"], desc:"The IB's official page about TOK."},
  {id:"ib-ee", name:"IB: Extended essay", url:"https://www.ibo.org/programmes/diploma-programme/curriculum/dp-core/extended-essay/", kind:"Official", tags:["ee","ib"], desc:"The IB's official page about the Extended Essay."},
  {id:"ib-cas", name:"IB: Creativity, activity, service", url:"https://www.ibo.org/programmes/diploma-programme/curriculum/dp-core/creativity-activity-and-service/", kind:"Official", tags:["cas","ib"], desc:"The IB's official page about CAS."},
  {id:"cb-sat", name:"College Board: SAT practice", url:"https://satsuite.collegeboard.org/practice", kind:"Official", tags:["sat"], desc:"Official full-length digital SAT practice tests and question banks."},
  {id:"bluebook", name:"Bluebook", url:"https://bluebook.collegeboard.org/", kind:"Official", tags:["sat"], desc:"The app you take the digital SAT in. Practise in it before test day."}
];

/* Original StudyFlow guides. Facts are kept to what is stable and well established; anything that varies by school says so. */
const GUIDES = [
  {id:"g-recall", title:"How to actually remember things", mins:4, tags:["study"], icon:"🧠", body:`Re-reading notes feels productive, but it's one of the weakest ways to learn. Two habits beat it by a long way.

## 1. Active recall: test yourself
Close the book and try to bring the idea back from memory, then check. The effort of retrieving is what makes it stick.
- Turn headings into questions and answer them out loud.
- Write everything you remember on a blank page, then fill the gaps in a different colour.
- Use flashcards, but say the answer before you flip.

## 2. Spacing: come back later
Reviewing a topic over several days works better than cramming it in one long session.
- Review new material after about 1 day, then 3 days, then a week.
- StudyFlow does this for you: recall quizzes and flashcards come back on a schedule.

## Put it together
1. Learn the topic in class or from a resource.
2. The same day, write 5 questions about it.
3. Answer them tomorrow without notes. Anything you miss becomes a flashcard.

**Try it now:** pick one topic from today and explain it to Flo. Flo turns your gaps into flashcards.`},
  {id:"g-focus", title:"Focus: the 25-minute method", mins:3, tags:["study"], icon:"⏱", body:`If starting is the hardest part, make the task smaller and the time shorter.

## The Pomodoro method
- Work on one thing for **25 minutes**, phone in another room.
- Take a **5-minute** break: stand up, drink water, no scrolling.
- After four rounds, take a longer break of 15 to 30 minutes.

## Make it work
- Decide the goal before you start: "6 practice questions", not "do chemistry".
- Keep a scrap of paper for distracting thoughts. Write them down and get back to work.
- Longer sessions (45 to 90 minutes) suit deep work like essays once you're in flow.

StudyFlow's guided sessions do this for you: Flo suggests a length, sets one goal, and goes full screen if you choose "Lock in".`},
  {id:"g-command", title:"IB command terms, decoded", mins:5, tags:["ib","exam"], icon:"🔑", body:`Command terms tell you exactly what an answer needs. Most lost marks come from answering a different command term than the one asked. These are plain-English summaries; your subject guide has the IB's official definitions.

## Short answers
- **State / Identify:** give the answer, no explanation.
- **Define:** give the precise meaning of a term.
- **Outline:** give a brief account or summary.
- **Calculate:** work out a numerical answer, showing working.

## Explaining
- **Describe:** give a detailed account of what something is or does.
- **Explain:** give reasons or causes. Use "because" and "so".
- **Suggest:** propose a likely answer or explanation, often for an unfamiliar situation.

## Higher-level thinking
- **Analyse:** break something into parts and show how they connect.
- **Compare / Compare and contrast:** give similarities (and differences), referring to both throughout.
- **Discuss:** consider different points of view or arguments, with evidence.
- **Evaluate:** weigh strengths and limitations, then make a judgement.
- **To what extent:** argue how far something is true, and finish with a clear conclusion.
- **Justify:** give valid reasons or evidence that support an answer.

**Tip:** underline the command term in every question before you write anything.`},
  {id:"g-exam", title:"Exam technique: marks and minutes", mins:4, tags:["exam"], icon:"📝", body:`Knowing the content is half of it. The other half is using the exam time well.

## Before the exam
- Find out each paper's length and total marks, and work out **minutes per mark** (total minutes ÷ total marks).
- Do at least one past paper under timed conditions.

## In the exam
- Read the command term and the number of marks. A 4-mark "explain" usually needs four clear points or steps.
- Spend roughly minutes-per-mark × marks on each question. If you're stuck, move on and come back.
- Show working in calculations. Method marks can be earned even if the final answer is wrong.
- Leave a few minutes at the end to check units, signs and that you answered every part.

## After a practice paper
- Mark it with the markscheme, then sort mistakes into: didn't know it, misread the question, ran out of time.
- Each "didn't know it" becomes a flashcard. StudyFlow's exam-style questions do this automatically.`},
  {id:"g-ee", title:"The Extended Essay: a calm plan", mins:5, tags:["ee","ib"], icon:"📚", body:`The Extended Essay is an independent research project of up to 4,000 words. It's long, so the trick is to start early and work in small steps. Your school sets the exact deadlines, so check them with your supervisor.

## 1. Choose a subject and topic
- Pick a subject you enjoy and are doing well in.
- Narrow a broad interest into something you can research properly in 4,000 words.

## 2. Write a focused research question
- A good question is specific and arguable, not a fact you can look up.
- Ask your supervisor to check it before you go further.

## 3. Research and keep track of sources
- Use Google Scholar, your school library and reliable websites.
- Save every source as you go (Zotero is free) so citations are easy later.

## 4. Draft, then improve
- Write a full draft before polishing anything.
- Use your supervisor's feedback to restructure, then edit for clarity.

## 5. Reflect
- The IB asks for reflection on your process, so note what you tried, what changed and why.

StudyFlow plans EE milestones into your week automatically.`},
  {id:"g-ia", title:"Writing an Internal Assessment", mins:4, tags:["ia","ib"], icon:"🔬", body:`Internal Assessments are marked by your teacher against criteria in your subject guide, then checked by the IB. These steps work for most subjects.

## Pick the right question
- Choose something you're genuinely curious about. It shows in the writing.
- Keep it narrow enough to investigate properly in the word limit.

## Plan before you start
- Read the assessment criteria for your subject first, and plan how you'll meet each one.
- For experiments or data, plan exactly what you'll measure and control.

## Draft early
- Your teacher can usually give feedback on a draft. Check how your school handles this.
- Leave time to act on that feedback.

## Before you submit
- Check the word or page limit.
- Make sure every source is cited.
- The work must be your own. StudyFlow gives feedback and explanations but never writes it for you.`},
  {id:"g-tok", title:"TOK essay and exhibition basics", mins:4, tags:["tok","ib"], icon:"💭", body:`Theory of Knowledge asks how we know what we claim to know. It has two assessments.

## The TOK exhibition
- You choose **three objects** that link to **one** of the IB's prompts.
- You write a commentary (up to 950 words) explaining how each object connects to the prompt.
- Real, specific objects work best: a photo from your life beats a generic image.

## The TOK essay
- You answer one of the IB's prescribed titles for your exam session (up to 1,600 words).
- Strong essays explore knowledge questions with real examples, consider counterclaims and reach a clear conclusion.

## Tips
- Use examples from your own subjects and experience.
- Always explain *why* an example matters for knowledge, not just what it is.

Check the current prescribed titles and prompts with your TOK teacher.`},
  {id:"g-cas", title:"CAS without the stress", mins:3, tags:["cas","ib"], icon:"🌱", body:`CAS stands for Creativity, Activity and Service. It runs through the Diploma Programme alongside your subjects.

## The three strands
- **Creativity:** arts, music, design, writing, coding, anything that involves creative thinking.
- **Activity:** physical exertion, like sport, dance, hiking or gym.
- **Service:** unpaid work that helps a community, like tutoring, volunteering or organising a drive.

## Make it easy on yourself
- Turn things you already do into CAS experiences.
- Write short reflections regularly instead of all at the end. StudyFlow plans 15 minutes a week for this.
- Keep evidence as you go: photos, notes and supervisor confirmations.
- Plan a CAS project with others early. It needs to run over a period of time.

Your school's CAS coordinator sets the exact requirements and deadlines, so check their handbook.`},
  {id:"g-sat", title:"The digital SAT at a glance", mins:3, tags:["sat"], icon:"🎯", body:`The SAT is taken on a laptop or tablet in College Board's **Bluebook** app.

## Structure
- **Reading and Writing:** 2 modules, 64 minutes in total.
- **Math:** 2 modules, 70 minutes in total, with a built-in Desmos graphing calculator.
- About 2 hours 14 minutes of testing, plus a break.
- It's adaptive: how you do in the first module of each section sets the difficulty of the second.
- Scores range from 400 to 1600.

## How to prepare
- Take the official full-length practice tests in Bluebook, under timed conditions.
- Keep an error log: for each mistake, write why you missed it.
- Learn to use Desmos for math questions. It saves a lot of time.

StudyFlow plans weekly SAT practice and full practice tests if you add the SAT during setup.`},
  {id:"g-procrastination", title:"Beating procrastination", mins:3, tags:["study"], icon:"⚡", body:`Procrastination is usually about a feeling (boredom, stress, not knowing where to start), not laziness.

## Shrink the first step
- "Write the essay" is scary. "Write the first sentence of the introduction" isn't.
- Commit to just 5 minutes. Starting is the hard part; continuing is easier.

## Remove the friction
- Phone in another room, one tab open.
- Have everything ready before you sit down.

## Make it concrete
- Decide *when* and *where* you'll study, not just *what*. StudyFlow puts it in your plan.
- If something comes up, press "Can't now" and StudyFlow finds another time, so one missed session doesn't snowball.

## Be kind to yourself
Missing a day is normal. What matters is getting back on track the next day.`}
];

const SUBJ_TAGS = [
  [/math|calculus|statistics|further/i, "math"], [/physic/i, "physics"], [/chem/i, "chemistry"], [/bio|science/i, "biology"],
  [/econ/i, "economics"], [/business|account/i, "business"], [/psych/i, "psychology"], [/histor|individuals|societies|global/i, "history"],
  [/geog/i, "geography"], [/english|literature|lang/i, "english"], [/spanish|español/i, "spanish"], [/computer|comput|ict/i, "computer"]
];
function subjTag(name){ return (SUBJ_TAGS.find(([re]) => re.test(name)) || [, null])[1]; }
function resFor(tag){ return RES.filter(r => r.tags.includes(tag)); }
function myResourceGroups(){
  const P = state.profile, groups = [];
  P.subjects.forEach(s => { const t = subjTag(s.name); if (t) groups.push({title:s.name, items:resFor(t)}); });
  if (P.curriculum === "ibdp") groups.push({title:"IB core: EE, TOK and CAS", items:RES.filter(r => ["ee","tok","cas"].some(t => r.tags.includes(t)) && r.kind !== "Writing").concat(RES.filter(r => r.id === "owl-mla"))});
  if ((P.tests || []).includes("SAT")) groups.push({title:"SAT", items:resFor("sat")});
  groups.push({title:"For every subject", items:RES.filter(r => r.tags.includes("all") || r.tags.includes("study"))});
  return groups.filter(g => g.items.length);
}

let libFilter = "", libTab = "foryou";
function viewLibrary(){
  const P = state.profile, q = libFilter.trim().toLowerCase();
  const match = (...s) => !q || s.join(" ").toLowerCase().includes(q);
  const guides = GUIDES.filter(g => (P.curriculum === "ibdp" || !g.tags.includes("ib")) && match(g.title, g.body));
  const files = state.docs.filter(d => match(d.name, d.text || ""));
  const groups = myResourceGroups().map(g => ({...g, items:g.items.filter(r => match(r.name, r.desc, r.kind, g.title))})).filter(g => g.items.length);
  const allRes = q ? RES.filter(r => match(r.name, r.desc, r.kind, r.tags.join(" "))) : [];
  const resCard = r => `<div class="res"><div class="res-top"><span class="kind">${esc(r.kind)}</span>${r.read && sampleFn ? `<button class="linkbtn small" data-act="libreadurl" data-v="${esc(r.url)}">Read with Flo</button>` : ""}</div><a class="res-name" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.name)} <span aria-hidden="true">↗</span></a><p>${esc(r.desc)}</p><span class="res-host">${esc(new URL(r.url).hostname.replace(/^www\./, ""))}</span></div>`;
  const tabs = [["foryou","For you"],["guides","Guides"],["files",`Your files${state.docs.length ? ` · ${state.docs.length}` : ""}`]];
  return `<div class="lib">
    <div class="page-h"><div><div class="label">Library</div><h1>Everything you need to study</h1></div></div>
    <div class="lib-add">
      <div class="lib-add-in">${flo("idle", 40)}<div><b>Add study material from anywhere</b><span>Paste a link to an article or notes page, or add a PDF or Word file. Flo reads it and can turn it into notes, flashcards or a quiz.</span></div></div>
      <form class="lib-url" id="libUrlForm"><input id="libUrl" type="url" inputmode="url" placeholder="https://… paste a link" aria-label="Link to a web page"><button class="btn primary" type="submit">Add link</button><button class="btn" type="button" data-act="attachpick">Add a file</button></form>
    </div>
    <div class="lib-bar"><div class="seg2" role="tablist">${tabs.map(([k, l]) => `<button role="tab" data-act="libtab" data-v="${k}" aria-selected="${libTab === k}">${l}</button>`).join("")}</div>
      <input class="lib-search" id="libSearch" type="search" placeholder="Search the library" value="${esc(libFilter)}" aria-label="Search the library"></div>
    ${libTab === "guides" || (q && guides.length) ? `<div class="sect"><h3>StudyFlow guides</h3><div class="guides">${guides.map(g => `<button class="guide" data-act="guide" data-v="${g.id}"><span class="g-ic">${g.icon}</span><b>${esc(g.title)}</b><small>${g.mins} min read</small></button>`).join("") || `<p class="muted">No guides match.</p>`}</div></div>` : ""}
    ${libTab === "files" || (q && files.length) ? `<div class="sect"><h3>Your files</h3>${files.length ? `<div class="files">${files.map(d => `<button class="file" data-act="libdoc" data-v="${d.id}"><span class="f-ic">${d.url ? "🔗" : "📄"}</span><span class="f-t"><b>${esc(d.name)}</b><small>${esc(d.url ? new URL(d.url).hostname.replace(/^www\./, "") : d.status || d.summary || "File")}${d.added ? ` · added ${esc(rel(d.added))}` : ""}</small></span></button>`).join("")}</div>` : `<div class="empty"><p>Nothing here yet. Add a link or a file above, or save a guide.</p></div>`}</div>` : ""}
    ${libTab === "foryou" && !q ? `<div class="sect"><div class="group-h"><h3>Start with a guide</h3><button class="linkbtn" data-act="libtab" data-v="guides">All guides</button></div><div class="guides">${guides.slice(0, 4).map(g => `<button class="guide" data-act="guide" data-v="${g.id}"><span class="g-ic">${g.icon}</span><b>${esc(g.title)}</b><small>${g.mins} min read</small></button>`).join("")}</div></div>
      ${groups.map(g => `<div class="sect"><h3>${esc(g.title)}</h3><div class="resgrid">${g.items.map(resCard).join("")}</div></div>`).join("")}` : ""}
    ${q && allRes.length ? `<div class="sect"><h3>Free resources</h3><div class="resgrid">${allRes.map(resCard).join("")}</div></div>` : ""}
    ${q && !guides.length && !files.length && !allRes.length ? `<div class="empty"><p>Nothing matches “${esc(libFilter)}”. Try a subject name, or ask Flo.</p><button class="btn" data-act="libask">Ask Flo about it</button></div>` : ""}
    <p class="note lib-note">Links go to free resources from other organisations. StudyFlow isn't affiliated with them, and they may change. Guides are written by StudyFlow; always check the official requirements from your school and exam board.</p>
  </div>`;
}

let DOC_FOCUS = null;
function readerActions(kind, id){
  if (!sampleFn) return "";
  return `<div class="reader-acts"><button class="btn" data-act="rdcards" data-k="${kind}" data-v="${id}">🃏 Make flashcards</button><button class="btn" data-act="rdquiz" data-k="${kind}" data-v="${id}">❓ Quiz me</button><button class="btn" data-act="rdnotes" data-k="${kind}" data-v="${id}">✎ Make notes</button></div>`;
}
function openGuide(id){
  const g = GUIDES.find(x => x.id === id); if (!g) return;
  const saved = state.docs.some(d => d.guide === id);
  showModal(`<div class="reader"><div class="label">StudyFlow guide · ${g.mins} min read</div><h2>${g.icon} ${esc(g.title)}</h2><div class="md reader-body">${md(g.body)}</div>
    ${readerActions("guide", id)}
    <div class="row"><button class="btn ghost" data-act="guidesave" data-v="${id}" ${saved ? "disabled" : ""}>${saved ? "Saved to your files" : "Save to my files"}</button><button class="btn primary" data-act="close">Done</button></div></div>`);
  track("guide_open");
}
function openDoc(id){
  const d = state.docs.find(x => x.id === id); if (!d) return;
  const body = d.text ? d.text.slice(0, 12000) : "";
  showModal(`<div class="reader"><div class="label">${d.url ? `From ${esc(new URL(d.url).hostname.replace(/^www\./, ""))}` : "Your file"}</div><h2>${esc(d.name)}</h2>
    ${d.url ? `<a class="linkbtn" href="${esc(d.url)}" target="_blank" rel="noopener">Open the original ↗</a>` : ""}
    ${body ? `<div class="reader-body plain">${esc(body).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>").replace(/^/, "<p>")}</p>${d.text.length > 12000 ? `<p class="muted">Showing the first part. Flo uses all of it.</p>` : ""}</div>` : `<p class="muted">${esc(d.status || "No readable text in this file.")}</p>`}
    ${d.text ? readerActions("doc", id) : ""}
    <div class="row"><button class="btn ghost danger" data-act="libdel" data-v="${id}">Remove</button><button class="btn primary" data-act="close">Done</button></div></div>`);
}
function focusText(kind, id){
  if (kind === "guide") { const g = GUIDES.find(x => x.id === id); return g && {name:g.title, text:g.body, subject:"Study skills"}; }
  const d = state.docs.find(x => x.id === id); if (!d) return null;
  const subj = d.subject || state.profile.subjects.find(s => (d.name + " " + d.text.slice(0, 3000)).toLowerCase().includes(s.name.toLowerCase().split(" ")[0]))?.name || "General";
  return {name:d.name, text:d.text, subject:subj};
}
function readerDo(what, kind, id){
  const f = focusText(kind, id); if (!f) return;
  DOC_FOCUS = f; setTimeout(() => { if (DOC_FOCUS === f) DOC_FOCUS = null; }, 120000);
  if (what === "cards") return makeCards(f.subject, f.name);
  if (what === "quiz") return startQuiz({subject:f.subject, topic:f.name});
  closeOverlay(); DOC_FOCUS = f;
  openDrawer({title:`Notes: ${f.name.slice(0, 40)}`, subject:f.subject, kickoff:`Make me concise revision notes from "${f.name}". Key ideas first, then definitions or a worked example, then 3 "Check yourself" questions with answers at the end.`});
}
async function addFromUrl(raw){
  const url = String(raw || "").trim();
  if (!/^https?:\/\/\S+\.\S+/.test(url)) return toast("Paste a full link, starting with https://");
  if (!window.STUDYFLOW_CONFIG?.aiUrl || !window.AUTH?.getSession) return toast("Adding links needs a StudyFlow account.");
  if (state.docs.some(d => d.url === url)) { toast("That page is already in your files."); return; }
  const doc = {id:uid(), name:"Reading the page…", url, status:"Reading…", text:"", added:todayStr(), source:"web"};
  state.docs.unshift(doc); libTab = "files"; render();
  try {
    const s = await AUTH.getSession();
    const r = await fetch(STUDYFLOW_CONFIG.aiUrl.replace(/\/$/, "") + "/read", {method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${s.access_token}`}, body:JSON.stringify({url})});
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) throw new Error(j.error || "That page couldn't be read.");
    doc.name = (j.title || new URL(url).hostname).slice(0, 120); doc.text = j.text; doc.url = j.url || url; doc.status = `${(j.text.match(/\S+/g) || []).length.toLocaleString()} words`;
    track("web_added"); save(); render(); openDoc(doc.id);
  } catch (e) {
    state.docs = state.docs.filter(d => d !== doc); save(); render();
    toast(e.message || "That page couldn't be read.");
  }
}
function libClick(a){
  const act = a.dataset.act, v = a.dataset.v;
  if (act === "libtab") { libTab = v; libFilter = ""; render(); return true; }
  if (act === "guide") { openGuide(v); return true; }
  if (act === "libdoc") { openDoc(v); return true; }
  if (act === "libreadurl") { addFromUrl(v); return true; }
  if (act === "guidesave") { const g = GUIDES.find(x => x.id === v); if (g && !state.docs.some(d => d.guide === v)) { state.docs.unshift({id:uid(), name:g.title, text:g.body, guide:v, status:"StudyFlow guide", added:todayStr()}); save(); toast("Saved to your files."); openGuide(v); } return true; }
  if (act === "libdel") { state.docs = state.docs.filter(d => d.id !== v); save(); closeOverlay(); render(); toast("Removed from your files."); return true; }
  if (act === "rdcards") { readerDo("cards", a.dataset.k, v); return true; }
  if (act === "rdquiz") { readerDo("quiz", a.dataset.k, v); return true; }
  if (act === "rdnotes") { readerDo("notes", a.dataset.k, v); return true; }
  if (act === "libask") { openDrawer({title:libFilter.slice(0, 40), kickoff:`Help me study: ${libFilter}`}); return true; }
  return false;
}
document.addEventListener("submit", e => { if (e.target.id === "libUrlForm") { e.preventDefault(); addFromUrl($("#libUrl").value); } });
document.addEventListener("input", e => { if (e.target.id === "libSearch") { libFilter = e.target.value; clearTimeout(window.__libT); window.__libT = setTimeout(() => { const pos = e.target.selectionStart; render(); const el = $("#libSearch"); if (el) { el.focus(); el.setSelectionRange(pos, pos); } }, 250); } });
