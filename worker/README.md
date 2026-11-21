# StudyFlow AI server

Cloudflare Worker that powers Flo's AI on the free Workers AI tier. It checks the person is signed in to StudyFlow (via Supabase), applies a daily limit per person (`DAILY_LIMIT`), and asks an open model (Llama 3.3 70B).

Deployed by Cloudflare from this folder (root directory `worker`).
