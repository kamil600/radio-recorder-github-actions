import { execSync } from 'child_process';
import { fs } from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

// Konfiguracja klientów i zmiennych środowiskowych
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const RADIO_URL = process.env.RADIO_STREAM_URL;
const DURATION_SECONDS = process.env.RECORD_DURATION_SECONDS || "3600"; // domyślnie 1 godzina

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dateStr = new Date().toLocaleDateString('pl-PL');
  const fileName = `nagranie_${timestamp}.mp3`;
  const tempPath = path.join('/tmp', fileName);

  console.log(`[1/4] Rozpoczynam nagrywanie strumienia: ${RADIO_URL} (${DURATION_SECONDS} s)...`);
  
  // Nagrywanie audio za pomocą ffmpeg bez rekompresji (c copy)
  execSync(`ffmpeg -y -i "${RADIO_URL}" -t ${DURATION_SECONDS} -c copy "${tempPath}"`, { stdio: 'inherit' });

  console.log(`[2/4] Wysyłam nagranie ${fileName} do Cloudflare R2...`);
  const fileStream = fs.createReadStream(tempPath);
  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `recordings/${fileName}`,
    Body: fileStream,
    ContentType: 'audio/mpeg',
  }));

  console.log(`[3/4] Aktualizuję manifest.json...`);
  let manifest = [];
  try {
    const getManifestCmd = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: 'manifest.json' });
    const response = await s3Client.send(getManifestCmd);
    const manifestData = await response.Body.transformToString();
    manifest = JSON.parse(manifestData);
  } catch (e) {
    console.log("Brak istniejącego manifest.json, tworzę nowy.");
  }

  // Dodanie nowego nagrania na początek listy
  manifest.unshift({
    id: timestamp,
    date: dateStr,
    fileName: fileName,
    url: `recordings/${fileName}`,
    createdAt: new Date().toISOString()
  });

  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: 'manifest.json',
    Body: JSON.stringify(manifest, null, 2),
    ContentType: 'application/json',
  }));

  console.log(`[4/4] Zakończono pomyślnie!`);
}

main().catch((err) => {
  console.error("Błąd podczas procesowania:", err);
  process.exit(1);
});
