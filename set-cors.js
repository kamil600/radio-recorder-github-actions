import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

// Użyj głównego klucza (tego z record.js / GitHub Secrets), który posiada uprawnienia do edycji bucketa
const s3 = new S3Client({
  endpoint: "https://s3.eu-central-003.backblazeb2.com",
  region: "eu-central-003",
  credentials: {
    accessKeyId: "003bed35bf33529000000000a",
    secretAccessKey: "K003C2B2qkoq9+ElF0q7/31DkpJB470"
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
