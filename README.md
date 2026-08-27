# Radio Recorder (GitHub Actions + Cloudflare R2 + Vercel)

Automatyczny recorder audycji radiowych działający w chmurze za darmo.

## Struktura projektu
- `.github/workflows/record.yml` - Zadanie cron na GitHub Actions nagrywające strumień radia i wrzucające plik na R2.
- `scripts/record.js` - Skrypt Node.js obsługujący uruchomienie `ffmpeg` oraz komunikację z S3 API Cloudflare R2.
- `public/index.html` - Strona WWW z odtwarzaczem nagrań do wdrożenia np. na Vercel / Cloudflare Pages.

## Instrukcja konfiguracji

### 1. Cloudflare R2
1. Zaloguj się na Cloudflare -> **R2 Storage**.
2. Utwórz bucket o nazwie np. `radio-recordings`.
3. W ustawieniach bucketu włącz **Public Development URL** (lub podepnij własną domenę). Skopiuj uzyskany adres URL (`https://pub-xxxx.r2.dev`).
4. W pliku `public/index.html` podmień stałą `R2_PUBLIC_URL` na swój publiczny adres.
5. Przejdź do **R2 > Manage R2 API Tokens**, utwórz token z uprawnieniami **Edit** i zapisz:
   - Account ID
   - Access Key ID
   - Secret Access Key

### 2. GitHub Repository
1. Wypchnij ten projekt na swoje repozytorium GitHub.
2. Wejdź w **Settings > Secrets and variables > Actions** i dodaj sekrety:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME` (np. `radio-recordings`)
   - `RADIO_STREAM_URL` (direct URL do streamu MP3/AAC)

### 3. Hosting Panelu WWW (Vercel / Cloudflare Pages)
1. Podepnij repozytorium pod **Vercel** lub **Cloudflare Pages**.
2. Jako **Root Directory** / **Build Output** wskaż katalog `public`.
3. Po zdeployowaniu strona wyświetli listę wszystkich nagranych audycji z możliwością ich odsłuchania i pobrania!
4. # radio-recorder-github-actions
