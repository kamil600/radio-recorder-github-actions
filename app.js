import { S3Client, ListObjectsV2Command, GetObjectCommand } from 'https://esm.sh/@aws-sdk/client-s3?bundle';
import { getSignedUrl } from 'https://esm.sh/@aws-sdk/s3-request-presigner?bundle';

// --- KONFIGURACJA BACKBLAZE B2 (S3 API) ---
const CONFIG = {
  endpoint: "https://s3.eu-central-003.backblazeb2.com",
  region: "eu-central-003",
  bucketName: "radio-recordings-7777",
  keyId: "003bed35bf335290000000009",
  applicationKey: "K003RnwSy6FvOUtog5NM+wQBFXXTARs",
  urlExpirationSeconds: 3600
};

// --- FORMATOWANIE NAZWY PLIKU ---
// Przekształca nazwę pliku (lub datę modyfikacji) w format: "[dzień tygodnia] [data dd.mm.rrrr], [godzina:minuta]"
function formatRecordingName(fileKey, lastModified) {
  let date;

  // Próba odczytania daty z nazwy pliku ISO: nagranie_YYYY-MM-DDTHH-mm-ss-sssZ.mp3
  const isoMatch = fileKey.match(/nagranie_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
  if (isoMatch) {
    const formattedIso = isoMatch[1].replace(
      /(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})/,
      '$1T$2:$3:$4Z'
    );
    date = new Date(formattedIso);
  } else {
    // Fallback do daty ostatniej modyfikacji pliku z B2
    date = new Date(lastModified);
  }

  if (isNaN(date.getTime())) {
    return fileKey; // Zwróć surowy klucz, jeśli data nie da się sparsować
  }

  return date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// --- ZARZĄDZANIE MOTYWEM (LIGHT / DARK MODE) ---
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
    updateThemeUI(true);
  } else {
    document.documentElement.classList.remove('dark');
    updateThemeUI(false);
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeUI(isDark);
}

function updateThemeUI(isDark) {
  const icon = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  if (icon && label) {
    icon.innerText = isDark ? '☀️' : '🌙';
    label.innerText = isDark ? 'Jasny' : 'Ciemny';
  }
}

// Inicjalizacja motywu
initTheme();

// --- INICJALIZACJA I REJESTRACJA ZDARZEŃ ---
document.addEventListener('DOMContentLoaded', () => {
  // Po załadowaniu DOM zaktualizuj wygląd przycisku (ikonkę i napis)
  updateThemeUI(document.documentElement.classList.contains('dark'));
  
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadRecordings);
  }
  
  loadRecordings();
});

// Inicjalizacja klienta S3
let s3Client;
try {
  s3Client = new S3Client({
    endpoint: CONFIG.endpoint,
    region: CONFIG.region,
    credentials: {
      accessKeyId: CONFIG.keyId,
      secretAccessKey: CONFIG.applicationKey
    }
  });
} catch (e) {
  console.error("Błąd inicjalizacji S3Client:", e);
}

// --- ŁADOWANIE NAGRAŃ Z BACKBLAZE B2 ---
async function loadRecordings() {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const listEl = document.getElementById('list');

  loadingEl?.classList.remove('hidden');
  errorEl?.classList.add('hidden');
  listEl?.classList.add('hidden');

  try {
    if (!s3Client) {
      throw new Error("Nie udało się utworzyć klienta S3Client.");
    }
    // 1. Pobranie listy obiektów z bucketa
    const command = new ListObjectsV2Command({
      Bucket: CONFIG.bucketName,
      MaxKeys: 1000
    });

    const response = await s3Client.send(command);
    const files = response.Contents || [];

    loadingEl?.classList.add('hidden');
    listEl?.classList.remove('hidden');

    // 2. Filtrowanie plików MP3 oraz sortowanie od najnowszych
    const mp3Files = files
      .filter(f => f.Key.endsWith('.mp3'))
      .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));

    if (!listEl) return;

    if (mp3Files.length === 0) {
      const emptyNotice = document.createElement('div');
      emptyNotice.className = 'text-center py-8 text-gray-500 dark:text-gray-400';
      emptyNotice.textContent = 'Brak zarejestrowanych nagrań w bazie.';
      listEl.replaceChildren(emptyNotice);
      return;
    }

    // 3. Generowanie podpisanych linków dostępowych i kart nagrań
    const cardsHtml = await Promise.all(mp3Files.map(async (file) => {
      const getCommand = new GetObjectCommand({
        Bucket: CONFIG.bucketName,
        Key: file.Key
      });

      // Podpisany link ważny przez 1 godzinę (3600 sekund)
      const audioUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: CONFIG.urlExpirationSeconds });
      const displayName = formatRecordingName(file.Key, file.LastModified);

      return `
        <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm md:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
          <div>
            <div class="font-semibold text-lg text-gray-900 dark:text-white capitalize">${displayName}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Plik: ${file.Key}</div>
          </div>
          <div class="flex items-center gap-3">
            <audio controls preload="none" class="h-10">
              <source src="${audioUrl}" type="audio/mpeg">
              Twoja przeglądarka nie wspiera odtwarzacza.
            </audio>
            <a href="${audioUrl}" download="${file.Key}" target="_blank" class="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition">
              Pobierz
            </a>
          </div>
        </div>
      `;
    }));

    // Konwersja szablonów HTML na fragment DOM i podmiana zawartości poprzez replaceChildren()
    const fragment = document.createRange().createContextualFragment(cardsHtml.join(''));
    listEl.replaceChildren(fragment);

  } catch (err) {
    loadingEl?.classList.add('hidden');
    if (errorEl) {
      errorEl.classList.remove('hidden');
      errorEl.innerText = "Błąd: " + err.message;
    }
  }
}
