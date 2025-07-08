import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(readFileSync(join(__dirname, '../serviceAccountKey.json')).toString());
const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
export default app;
