import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

// Użyj głównego klucza (tego z record.js / GitHub Secrets), który posiada uprawnienia do edycji bucketa
const s3 = new S3Client({
  endpoint: "https://s3.eu-central-003.backblazeb2.com",
  region: "eu-central-003",
  credentials: {
    accessKeyId: "bed35bf33529",
    secretAccessKey: "00367875236c221fb7c33f665a97b1c8bb1861993b"
  }
});

async function applyCors() {
  try {
    const command = new PutBucketCorsCommand({
      Bucket: "radio-recordings-7777",
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "HEAD"],
            AllowedOrigins: ["*"],
            ExposeHeaders: ["ETag"]
          }
        ]
      }
    });

    await s3.send(command);
    console.log("✅ Reguły CORS zostały pomyślnie zapisane w Backblaze B2!");
  } catch (err) {
    console.error("❌ Błąd zapisu CORS:", err);
  }
}

applyCors();
