import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || 'recordings';
const RADIO_URL = process.env.RADIO_STREAM_URL;
const DURATION_SECONDS = process.env.RECORD_DURATION_SECONDS || "3600";
const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS || "7", 10);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RADIO_URL) {
  console.error("Błąd: Brak wymaganych zmiennych środowiskowych w GitHub Secrets!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function cleanupOldRecordings() {
  console.log(`[Czyszczenie] Sprawdzam nagrania starsze niż ${RETENTION_DAYS} dni...`);
  
  const { data: files, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list('', { limit: 1000 });

  if (error) {
    console.error("Nie udało się pobrać listy plików do retencji:", error);
    return;
  }

  const now = Date.now();
  const maxAgeMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

  const filesToDelete = files
    .filter(f => f.name.endsWith('.mp3'))
    .filter(f => {
      const createdAt = new Date(f.created_at).getTime();
      return (now - createdAt) > maxAgeMs;
    })
    .map(f => f.name);

  if (filesToDelete.length > 0) {
    console.log(`[Czyszczenie] Usuwam ${filesToDelete.length} przestarzałych plików:`, filesToDelete);
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filesToDelete);

    if (deleteError) {
      console.error("Błąd podczas usuwania starych nagrań:", deleteError);
    } else {
      console.log("[Czyszczenie] Stare nagrania zostały pomyślnie usunięte.");
    }
  } else {
    console.log("[Czyszczenie] Brak nagrań kwalifikujących się do usunięcia.");
  }
}

async function main() {
  await cleanupOldRecordings();

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const fileName = `nagranie_${timestamp}.mp3`;
  const tempPath = path.join('/tmp', fileName);

  console.log(`[1/3] Rozpoczynam nagrywanie strumienia: ${RADIO_URL} (${DURATION_SECONDS} s)...`);
  execSync(`ffmpeg -y -i "${RADIO_URL}" -t ${DURATION_SECONDS} -c copy "${tempPath}"`, { stdio: 'inherit' });

  console.log(`[2/3] Odczytuję zapisany plik MP3...`);
  const fileBuffer = fs.readFileSync(tempPath);

  console.log(`[3/3] Wysyłam ${fileName} do Supabase Storage...`);
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, fileBuffer, {
      contentType: 'audio/mpeg',
      upsert: true
    });

  if (error) {
    throw error;
  }

  console.log("Sukces! Nowe nagranie zostało wrzucone:", data.path);
  fs.unlinkSync(tempPath);
}

main().catch((err) => {
  console.error("Błąd podczas przetwarzania:", err);
  process.exit(1);
});
