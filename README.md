# 📻 Archiwum Nagrań Radiowych (Radio Recorder)

Automatyczny system do rejestrowania audycji radiowych w chmurze przy użyciu **GitHub Actions** oraz **Supabase Storage**, wyposażony w nowoczesny i responsywny panel webowy.

## 🚀 Główne Funkcjonalności

- 🎙️ **Automatyczne nagrywanie strumienia audio:** Skrypt Node.js nagrywa audycję radiową bezpośrednio ze strumienia URL i zapisuje gotowy plik `.mp3`.
- ⏰ **Harmonogram GitHub Actions:** Automatyczne wyzwalanie nagrywania o określonych godzinach (za pomocą składni `cron`) lub na żądanie (`workflow_dispatch`), bez konieczności utrzymywania własnego serwera 24/7.
- ☁️ **Supabase Storage:** Bezpieczne i wydajne przechowywanie zarejestrowanych plików nagrań w chmurze.
- 💻 **Nowoczesny Panel Frontendowy:**
  - Dynamiczny **Tryb Jasny / Ciemny (Light / Dark Mode)** zapamiętywany w `localStorage`.
  - Wbudowany odtwarzacz audio do odsłuchiwania audycji wprost z przeglądarki.
  - Szybkie pobieranie plików MP3 na urządzenie.
  - Pełna separacja struktury HTML (`index.html`) i logiki aplikacji (`app.js`).
  - Responsywny design zrealizowany w **Tailwind CSS**.

## 📁 Struktura Projektu

```text
├── .github/
│   └── workflows/
│       └── record.yml       # Konfiguracja automatycznych zadań w GitHub Actions
├── scripts/
│   └── record.js          # Skrypt Node.js pobierający strumień i wysyłający nagranie do Supabase
├── app.js                 # Logika front-endu (pobieranie listy nagrań, zmiana motywu)
├── index.html             # Interfejs użytkownika (HTML5 + Tailwind CSS)
├── package.json           # Zależności i skrypty Node.js
├── package-lock.json      # Zablokowane wersje pakietów Node.js
└── .gitignore             # Wykluczenia z repozytorium Git
```

## 🛠️ Konfiguracja i Wdrożenie

### 1. Konfiguracja Supabase
1. Zaloguj się na [Supabase](https://supabase.com/) i utwórz nowy projekt.
2. Przejdź do sekcji **Storage** i utwórz nowy zasobnik (bucket) o nazwie `recordings`.
3. Ustaw widoczność bucketu jako **Public** (aby pliki nagrań były dostępne do odsłuchu/pobrania).
4. Pobierz dane dostępowe z panelu (*Project Settings > API*):
   - `Project URL`
   - `anon / publishable key`
   - `service_role key` (używany przez GitHub Actions do zapisu plików).

---

### 2. Konfiguracja GitHub Secrets
W repozytorium na GitHubie przejdź do **Settings > Secrets and variables > Actions** i dodaj wymagane zmienne środowiskowe:

- `SUPABASE_URL` – URL Twojego projektu w Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` – Klucz z uprawnieniami zapisu do Storage.
- *(Opcjonalnie)* `RADIO_STREAM_URL` – Adres strumienia radiowego, jeśli jest parametryzowany.

---

### 3. Konfiguracja Front-endu (`app.js`)
Otwórz plik `app.js` i wklej swoje publiczne klucze dostępowe Supabase:

```javascript
const SUPABASE_URL = "https://TWÓJ_PROJECT_ID.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "TWÓJ_PUBLISHABLE_KEY";
const BUCKET_NAME = "recordings";
```

---

### 4. Publikacja Front-endu (GitHub Pages)
1. W ustawieniach repozytorium GitHub przejdź do **Settings > Pages**.
2. W sekcji **Build and deployment** wybierz źródło: `Deploy from a branch`.
3. Wybierz gałąź `main` (lub `master`) oraz katalog `/ (root)`.
4. Po chwili panel audycji będzie dostępny pod adresem `https://<twoj-nick>.github.io/<nazwa-repozytorium>/`.

## 💻 Uruchamianie Lokalne

Jeśli chcesz przetestować lub rozwijać projekt lokalnie:

1. Klonowanie repozytorium:
   ```bash
   git clone https://github.com/twój-nick/radio-recorder.git
   cd radio-recorder
   ```

2. Instalacja zależności Node.js:
   ```bash
   npm install
   ```

3. Testowe uruchomienie nagrywania:
   ```bash
   SUPABASE_URL="https://twój-id.supabase.co" \
   SUPABASE_SERVICE_ROLE_KEY="twój-klucz" \
   node scripts/record.js
   ```

4. Podgląd frontendu:
   Otwórz plik `index.html` w przeglądarce lub użyj rozszerzenia typu *Live Server* w VS Code.

## 📝 Licencja

Projekt udostępniany na licencji MIT.
