const admin = require('firebase-admin');

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  // Fix for PEM keys in .env (removes quotes and handles newlines)
  privateKey: process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '') 
    : undefined,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

const isPlaceholder = (val) => !val || val.includes('your-') || val.includes('_HERE');

if (
  firebaseConfig.projectId && !isPlaceholder(firebaseConfig.projectId) &&
  firebaseConfig.privateKey && !isPlaceholder(firebaseConfig.privateKey) &&
  firebaseConfig.clientEmail && !isPlaceholder(firebaseConfig.clientEmail)
) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
    });
    console.log('[Firebase] Admin SDK initialized');
  } catch (error) {
    console.error('[Firebase] Initialization error:', error.message);
  }
} else {
  console.warn('[Firebase] Missing or placeholder credentials in .env. Push notifications will be disabled.');
}

module.exports = admin;
