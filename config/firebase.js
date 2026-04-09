const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// For local development, run: gcloud auth application-default login
// This uses application default credentials instead of service account key

admin.initializeApp({
  projectId: 'payments-43e57',
  storageBucket: 'payments-43e57.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
const auth = admin.auth();

module.exports = { admin, db, bucket, auth };