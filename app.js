// --- KONFIGURACJA SUPABASE ---
// PODMIEŃ PONIŻSZE DANE Z PANELU SUPABASE (Project Settings > API Keys)
const SUPABASE_URL = "https://hydqdgnszhgfghrznncs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_oF-LfxAX6YYE7Xz8BHPsgA_bMIhDMJn";
const BUCKET_NAME = "recordings";

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

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

// --- ŁADOWANIE NAGRAŃ Z SUPABASE ---
async function loadRecordings() {
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const listEl = document.getElementById('list');

  loadingEl.classList.remove('hidden');
  errorEl.classList.add('hidden');
  listEl.classList.add('hidden');

  try {
    if (SUPABASE_URL.includes("TWÓJ_PROJECT_ID")) {
      throw new Error("Skonfiguruj zmienne SUPABASE_URL i SUPABASE_PUBLISHABLE_KEY.");
    }

    const { data: files, error } = await _supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) throw error;

    loadingEl.classList.add('hidden');
    listEl.classList.remove('hidden');

    const mp3Files = files.filter(f => f.name.endsWith('.mp3'));

    if (mp3Files.length === 0) {
      listEl.innerHTML = '<div class="text-center py-8 text-gray-500 dark:text-gray-400">Brak zarejestrowanych nagrań w bazie.</div>';
      return;
    }

    listEl.innerHTML = mp3Files.map(file => {
      const { data: publicUrlData } = _supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(file.name);

      const dateStr = new Date(file.created_at).toLocaleString('pl-PL');

      return `
        <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm md:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
          <div>
            <div class="font-semibold text-lg text-gray-900 dark:text-white">${file.name}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Data nagrania: ${dateStr}</div>
          </div>
          <div class="flex items-center gap-3">
            <audio controls preload="none" class="h-10">
              <source src="${publicUrlData ? publicUrlData.publicUrl : '#'}" type="audio/mpeg">
              Twoja przeglądarka nie wspiera odtwarzacza.
            </audio>
            <a href="${publicUrlData ? publicUrlData.publicUrl : '#'}" download target="_blank" class="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition">
              Pobierz
            </a>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
    errorEl.innerText = "Błąd: " + err.message;
  }
}

// --- INICJALIZACJA I REJESTRACJA ZDARZEŃ ---
document.addEventListener('DOMContentLoaded', () => {
  // Weryfikacja motywu oraz wczytanie nagrań przy starcie
  initTheme();
  loadRecordings();

  // Nasłuchiwanie kliknięć w przyciski (brak inline JS w HTML)
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadRecordings);
  }
});
