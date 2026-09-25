import { S3Client, ListObjectsV2Command, GetObjectCommand } from 'https://esm.sh/@aws-sdk/client-s3?bundle';
import { getSignedUrl } from 'https://esm.sh/@aws-sdk/s3-request-presigner?bundle';

// --- KONFIGURACJA BACKBLAZE B2 (S3 API) ---
const B2_ENDPOINT = "https://s3.eu-central-003.backblazeb2.com"; 
const B2_REGION = "eu-central-003";
const B2_BUCKET_NAME = "radio-recordings-7777";
const B2_KEY_ID = "003bed35bf335290000000008";
const B2_APPLICATION_KEY = "K003S6MBMQLA+B3i2lgZAOxTgAPKxTw";

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

// Inicjalizacja motywu i zdarzeń interfejsu
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
    endpoint: B2_ENDPOINT,
    region: B2_REGION,
    credentials: {
      accessKeyId: B2_KEY_ID,
      secretAccessKey: B2_APPLICATION_KEY
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

  loadingEl.classList.remove('hidden');
  errorEl.classList.add('hidden');
  listEl.classList.add('hidden');

  try {
    if (!s3Client) {
      throw new Error("Nie udało się utworzyć klienta S3Client.");
    }
    // 1. Pobranie listy obiektów z bucketa
    const command = new ListObjectsV2Command({
      Bucket: B2_BUCKET_NAME,
      MaxKeys: 1000
    });

    const response = await s3Client.send(command);
    const files = response.Contents || [];

    loadingEl.classList.add('hidden');
    listEl.classList.remove('hidden');

    // 2. Filtrowanie plików MP3 oraz sortowanie od najnowszych
    const mp3Files = files
      .filter(f => f.Key.endsWith('.mp3'))
      .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));

    if (mp3Files.length === 0) {
      listEl.innerHTML = '<div class="text-center py-8 text-gray-500 dark:text-gray-400">Brak zarejestrowanych nagrań w bazie.</div>';
      return;
    }

    // 3. Generowanie podpisanych linków dostępowych i kart nagrań
    const cardsHtml = await Promise.all(mp3Files.map(async (file) => {
      const getCommand = new GetObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: file.Key
      });

      // Podpisany link ważny przez 1 godzinę (3600 sekund)
      const audioUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
      const dateStr = new Date(file.LastModified).toLocaleString('pl-PL');

      return `
        <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm md:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
          <div>
            <div class="font-semibold text-lg text-gray-900 dark:text-white">${file.Key}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Data nagrania: ${dateStr}</div>
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

    listEl.innerHTML = cardsHtml.join('');

  } catch (err) {
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
    errorEl.innerText = "Błąd: " + err.message;
  }
}
