import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { S3Client, 
        PutObjectCommand,
        ListObjectsV2Command, 
        DeleteObjectsCommand} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const B2_ENDPOINT = process.env.B2_ENDPOINT;
const B2_REGION = process.env.B2_REGION;
const B2_KEY_ID = process.env.B2_KEY_ID;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY;
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME || 'recordings';
const RADIO_STREAM_URL = process.env.RADIO_STREAM_URL;
const RECORD_DURATION_SECONDS = process.env.RECORD_DURATION_SECONDS || "3600";
const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS || "7", 10);

if (!B2_ENDPOINT || !B2_REGION || !RADIO_STREAM_URL || !B2_KEY_ID || !B2_APPLICATION_KEY) {
  console.error("Błąd: Brak wymaganych zmiennych środowiskowych w GitHub Secrets!");
  process.exit(1);
}

const s3Client = new S3Client({
  endpoint: B2_ENDPOINT,
  region: B2_REGION,
  credentials: {
    accessKeyId: B2_KEY_ID,
    secretAccessKey: B2_APPLICATION_KEY
  }
});

async function cleanupOldRecordings() {
  console.log(`[Czyszczenie] Sprawdzam nagrania starsze niż ${RETENTION_DAYS} dni...`);

  try {
    // 1. Pobranie listy plików bezpośrednio z S3
    const { Contents } = await s3Client.send(new ListObjectsV2Command({
      Bucket: B2_BUCKET_NAME,
      MaxKeys: 1000
    }));

    if (!Contents || Contents.length === 0) {
      console.log("[Czyszczenie] Bucket jest pusty.");
      return;
    }

    const now = Date.now();
    const maxAgeMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

    // 2. Filtrowanie przestarzałych plików MP3
    const filesToDelete = Contents
      .filter(item => item.Key.endsWith('.mp3'))
      .filter(item => (now - new Date(item.LastModified).getTime()) > maxAgeMs)
      .map(item => item.Key);

    if (filesToDelete.length === 0) {
      console.log("[Czyszczenie] Brak nagrań kwalifikujących się do usunięcia.");
      return;
    }

    // 3. Masowe usunięcie plików
    console.log(`[Czyszczenie] Usuwam ${filesToDelete.length} przestarzałych plików:`, filesToDelete);

    await s3Client.send(new DeleteObjectsCommand({
      Bucket: B2_BUCKET_NAME,
      Delete: {
        Objects: filesToDelete.map(Key => ({ Key }))
      }
    }));

    console.log("[Czyszczenie] Stare nagrania zostały pomyślnie usunięte.");

  } catch (error) {
    console.error("[Czyszczenie] Wystąpił błąd podczas czyszczenia nagrań:", error);
  }
}

async function main() {
  await cleanupOldRecordings();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `nagranie_${timestamp}.mp3`;
  const tempPath = path.join('/tmp', fileName);

  try {
    console.log(`[1/2] Nagrywanie strumienia: ${RADIO_STREAM_URL} (${RECORD_DURATION_SECONDS} s)...`);
    execSync(`ffmpeg -y -i "${RADIO_STREAM_URL}" -t ${RECORD_DURATION_SECONDS} -c copy "${tempPath}"`, { stdio: 'inherit' });

    console.log(`[2/2] Wysyłanie ${fileName} do S3 Storage...`);
    await s3Client.send(new PutObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: fileName,
      Body: fs.createReadStream(tempPath),
      ContentType: 'audio/mpeg'
    }));

    console.log("Sukces! Nowe nagranie zostało wrzucone:", fileName);
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
}

main().catch((err) => {
  console.error("Błąd podczas przetwarzania:", err);
  process.exit(1);
});
