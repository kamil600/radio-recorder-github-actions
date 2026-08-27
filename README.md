# 📻 Radio Auto Recorder (Supabase Storage Edition)

Automatyczny system nagrywania audycji radiowych działający w chmurze z wykorzystaniem **GitHub Actions** oraz **Supabase Storage**. Projekt jest w 100% darmowy i nie wymaga podawania karty płatniczej.

## 🚀 Funkcje
- **Automatyczne nagrywanie:** Cykliczne nagrywanie strumienia audio (MP3/AAC) przez ffmpeg uruchamiane w GitHub Actions.
- **Darmowy magazyn plików:** Przechowywanie nagrań w Supabase Storage (1 GB w darmowym planie bez karty).
- **Automatyczna retencja:** Samoczynne czyszczenie nagrań starszych niż określona liczba dni (domyślnie 7 dni).
- **Nowy standard API Supabase:** Pełna obsługa nowych kluczy API (Publishable key oraz Secret key).
- **Panel WWW:** Lekka strona HTML/Tailwind z odtwarzaczem audio i możliwością bezpośredniego pobierania plików.

## 📁 Struktura projektu

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

## 🛠️ Instrukcja konfiguracji krok po kroku

### 1. Konfiguracja Supabase
1. Zarejestruj się na supabase.com (darmowe konto, bez podawania karty).
2. Utwórz nowy projekt (np. radio-recorder).
3. Przejdź do zakładki Storage w lewym menu i kliknij New bucket:
   - Nazwa bucketu: recordings
   - Zaznacz opcję Public bucket (wymagane do odtwarzania i pobierania plików na stronie WWW).
4. Przejdź do Project Settings > API Keys i skopiuj trzy wartości:
   - Project URL (np. https://xyz.supabase.co)
   - Publishable key (sb_publishable_...)
   - Secret key (sb_secret_...)

### 2. Konfiguracja GitHub Secrets
W swoim repozytorium na GitHubie przejdź do Settings > Secrets and variables > Actions i dodaj sekrety:
- SUPABASE_URL – Twój adres Project URL z Supabase.
- SUPABASE_SECRET_KEY – Twój klucz Secret key (sb_secret_...) z Supabase.
- RADIO_STREAM_URL – bezpośredni link do strumienia radia (np. http://stream.example.com/radio.mp3).

### 3. Konfiguracja Frontendu (public/index.html)
Otwórz plik public/index.html i w sekcji <script> podmień stałe:

    const SUPABASE_URL = "https://TWÓJ_PROJECT_ID.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_TWÓJ_KEY";

### 4. Wdrożenie panelu WWW na GitHub Pages
1. W repozytorium przejdź do Settings > Pages.
2. W sekcji Build and deployment ustaw:
   - Source: Deploy from a branch
   - Branch: main oraz folder /public
3. Kliknij Save. Po minucie strona będzie dostępna pod adresem https://twój-nick.github.io/nazwa-repo/.

## ⚙️ Zaawansowana konfiguracja (Zmienne środowiskowe)

Parametry działania skryptu możesz modyfikować bezpośrednio w pliku .github/workflows/record.yml w sekcji env:

| Zmienna | Opis | Domyślna wartość |
| :--- | :--- | :--- |
| RECORD_DURATION_SECONDS | Czas trwania pojedynczego nagrania w sekundach. | "3600" (60 minut) |
| RETENTION_DAYS | Czas przechowywania plików. Nagrania starsze niż ta liczba dni zostaną usunięte przed nowym nagraniem. | "7" (7 dni) |
| cron | Harmonogram automatycznego uruchamiania w strefie UTC (sekcja schedule). | '0 18 * * *' (codziennie o 18:00 UTC) |
