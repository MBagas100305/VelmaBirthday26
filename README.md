# Velma Birthday Digital Invite

One-page digital birthday website built with Next.js App Router, Tailwind CSS, Framer Motion, and Gemini API.

## 1. Install

```bash
npm install
```

## 2. Configure environment

Copy `.env.example` to `.env.local`.

Set:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
NEXT_PUBLIC_EVENT_DATE=YYYY-MM-DDTHH:MM:SS+07:00
```

The sample date in `.env.example` is only a placeholder. Replace it with the real birthday date/time.

## 3. Run

```bash
npm run dev
```

Open http://localhost:3000.

## Notes

- RSVP and wishes are stored in browser `localStorage` for this starter implementation.
- Gemini is called server-side through `/api/ai-wish`, so the API key is not exposed to the browser.
- For production, connect RSVP persistence to Supabase, Firebase, PostgreSQL, Google Sheets, or another backend.
