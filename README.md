# Radio Recorder

Automatyczne nagrywanie audycji radiowych z automatyczną retencją plików.

## Struktura projektu
- `.github/workflows/record.yml` – Zadanie GitHub Actions uruchamiane automatycznie z podaną retencją danych.
- `scripts/record.js` – Skrypt Node.js nagrywający audio przez ffmpeg, czyszczący przestarzałe nagrania z Supabase i publikujący nowe.
- `public/index.html` – Frontend HTML/Tailwind CSS pobierający listę audycji z Supabase Storage.

## Instrukcja konfiguracji

### 1. Supabase (Baza i Magazyn Plików)
1. Zarejestruj się na [supabase.com](https://supabase.com) (darmowe konto, bez podawania karty).
2. Utwórz nowy projekt (np. `radio-recorder`).
3. Wejdź w zakładkę **Storage** z lewego menu, kliknij **New bucket**:
   - Nazwa: `recordings`
   - Zaznacz **Public bucket** (wymagane do odtwarzania na stronie WWW).
4. Przejdź do **Project Settings > API** i skopiuj wartości:
   - `Project URL`
   - `anon` `public` key
   - `service_role` `secret` key

### 2. Edycja `public/index.html`
W pliku `public/index.html` podmień stałe:
- `SUPABASE_URL` -> Twój Project URL
- `SUPABASE_ANON_KEY` -> Twój klucz `anon` `public`

### 3. GitHub Secrets
W swoim repozytorium GitHub przejdź do **Settings > Secrets and variables > Actions** i dodaj sekrety:
- `SUPABASE_URL` -> Twój Project URL
- `SUPABASE_SERVICE_ROLE_KEY` -> Twój klucz `service_role` `secret`
- `RADIO_STREAM_URL` -> Bezpośredni URL do strumienia audio radia (np. `http://stream.../radio.mp3`)

### 4. Publikacja Strony (Vercel / GitHub Pages)
Wskaż folder `public` jako katalog główny aplikacji na Vercel lub GitHub Pages.
