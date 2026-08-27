# 📻 Radio Auto Recorder

Automatyczny system nagrywania audycji radiowych działający w chmurze z wykorzystaniem **GitHub Actions** oraz **Supabase Storage**. Projekt jest w 100% darmowy i nie wymaga podawania karty płatniczej.

## 🚀 Funkcje
- **Automatyczne nagrywanie:** Cykliczne nagrywanie strumienia audio (MP3/AAC) przez `ffmpeg` uruchamiane w GitHub Actions.
- **Darmowy magazyn plików:** Przechowywanie nagrań w Supabase Storage (1 GB w darmowym planie bez karty).
- **Automatyczna retencja:** Samoczynne czyszczenie nagrań starszych niż określona liczba dni (domyślnie 7 dni).
- **Nowy standard API Supabase:** Pełna obsługa nowych kluczy API (`Publishable key` oraz `Secret key`).
- **Panel WWW:** Lekka strona HTML/Tailwind z odtwarzaczem audio i możliwością bezpośredniego pobierania plików.

## 📁 Struktura projektu
```text
├── .github/
│   └── workflows/
│       └── record.yml          # Harmonogram cron i definicja zadania GitHub Actions
├── public/
│   └── index.html              # Panel WWW z odtwarzaczem (GitHub Pages / Vercel)
├── scripts/
│   └── record.js               # Skrypt Node.js (nagrywanie, upload i czyszczenie bazy)
├── .gitignore
├── package.json
└── README.md
