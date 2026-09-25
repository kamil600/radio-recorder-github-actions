# Radio Recorder (Backblaze B2)

Aplikacja do automatycznego nagrywania strumieni radiowych za pomocą FFmpeg i zapisywania plików w chmurze Backblaze B2 (przez S3 API). Projekt zawiera skrypt wykonawczy Node.js oraz frontendowy odtwarzacz webowy z obsługą ciemnego motywu.

## Funkcje

* **Automatyczne nagrywanie:** Pobieranie strumienia audio (MP3/AAC/HLS) przez FFmpeg bez utraty jakości.
* **Przechowywanie w B2:** Wysyłanie nagrań do prywatnego bucketa Backblaze B2 przy użyciu AWS SDK v3.
* **Automatyczna retencja:** Czyszczenie nagrań starszych niż określona liczba dni.
* **Odtwarzacz Web:** Interfejs w HTML/Tailwind CSS z generatorem podpisanych linków dostępowych (`Pre-signed URLs`).

## Wymagania

* Node.js (wersja 18+)
* FFmpeg zainstalowany w systemie (domyślnie dostępny na runnerach GitHub Actions)
* Konto Backblaze B2 (prywatny bucket + Application Key)

## Zmienne środowiskowe

Skrypt `scripts/record.js` wymaga następujących zmiennych środowiskowych:

| Zmienna | Opis | Przykład |
| :--- | :--- | :--- |
| `RADIO_URL` | Adres URL strumienia radiowego | `https://stream.example.com/radio.mp3` |
| `DURATION_SECONDS` | Czas trwania pojedynczego nagrania (s) | `3600` |
| `RETENTION_DAYS` | Czas przechowywania nagrań (w dniach) | `7` |
| `B2_ENDPOINT` | Endpoint S3 z panelu Backblaze | `https://s3.us-west-004.backblazeb2.com` |
| `B2_REGION` | Region bucketa | `us-west-004` |
| `B2_BUCKET_NAME` | Nazwa bucketa B2 | `moje-nagrania` |
| `B2_KEY_ID` | Key ID z Backblaze | `004...` |
| `B2_APPLICATION_KEY` | Application Key z Backblaze | `K004...` |

## Instalacja i uruchomienie

1. Zainstaluj zależności:
   ```bash
   npm install
   ```

2. Uruchom skrypt nagrywający:
   ```bash
   npm run record
   ```

3. Podgląd odtwarzacza:
   Otwórz plik `index.html` w przeglądarce (lub wystaw go przez GitHub Pages / Vercel).
