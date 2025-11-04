
# ADS — Cuballama Realtime (Next.js + Supabase)

**Solo Cuballama per ora**, ma architettura aperta per futuri fornitori.
- Griglia Combo realtime (Supabase Realtime)
- Admin con login (Supabase Auth) e upload immagini su Storage
- Endpoint `/api/cron/cuballama` che legge le offerte pubbliche dalla pagina Cuballama (Iré a Santiago) e aggiorna il DB
- SQL: tabelle `combos`, `famiglie`, `provider_offers` + RLS policies

## Avvio rapido
1) Supabase (EU) → esegui in ordine i file in `/sql`: `schema.sql`, poi `policies.sql`  
2) Storage → crea bucket **public** `combo-images`  
3) Auth → abilita **email/password** e aggiungi un utente admin  
4) Crea `.env.local` partendo da `.env.example` (compila URL, chiavi e `CRON_SECRET`)  
5) `npm i` • `npm run dev` • apri http://localhost:3000  
6) (Cron manuale) da terminale:
   ```
   curl -X POST "http://localhost:3000/api/cron/cuballama?token=YOUR_CRON_SECRET"
   ```
   oppure configura una **Vercel/Netlify Cron** che colpisce quell'URL ogni 2–3 ore.

## Nota legale
- Rispetta robots.txt e condizioni d’uso di Cuballama.  
- Usiamo **soltanto** pagine pubbliche; nessun login.  
- Mostra sempre il link “Vai all’offerta” verso la pagina sorgente.
