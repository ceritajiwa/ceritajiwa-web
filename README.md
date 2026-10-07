# Cerita Jiwa Web (Frontend)
Frontend Next.js untuk platform asesmen Cerita Jiwa.

## Deploy ke Vercel
1. Push folder ini ke repo GitHub (mis. `ceritajiwa-web`)
2. vercel.com -> Import Project -> pilih repo
3. Environment Variables: `NEXT_PUBLIC_API_URL` = URL backend Render (https://ceritajiwa-api.onrender.com)
4. Deploy

## Lokal
1. `cp .env.local.example .env.local` lalu isi URL API
2. `npm install` -> `npm run dev`
