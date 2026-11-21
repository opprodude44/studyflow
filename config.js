// StudyFlow settings. Fill these in after creating your Supabase project (see README.md, step 2).
// Both values are safe to publish: the anon key only allows what the database rules allow.
window.STUDYFLOW_CONFIG = {
  supabaseUrl: "https://qieluzgwwxfxlppxtgrd.supabase.co",
  supabaseAnonKey: "sb_publishable_EbZKtBLjhpgix2iWTYZYvA_a-1Ai1_0",

  // Sign-in buttons to show, once each is switched on in Supabase (README step 4).
  // Options: "google", "azure" (Microsoft / Outlook / school Microsoft accounts), "apple".
  providers: [],

  // Youngest age allowed to sign up.
  minimumAge: 13,

  // Flo's AI features (assistant, quizzes, reading files, marking). Needs the "ai" server function and an API key.
  aiEnabled: false,
  // Where Flo's AI server runs (Cloudflare Worker, free tier).
  aiUrl: "AI_URL_HERE",
  // Draft marking (IA/EE/TOK) stays off until a stronger AI model is connected.
  markingEnabled: false,
  // Reading photos needs a vision model; off for now.
  photosEnabled: false
};
