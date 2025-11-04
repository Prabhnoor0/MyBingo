const admin = require('firebase-admin');



let serviceAccount = null;


if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || "welly-df3f6",
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };
} else {
 
  try {
    serviceAccount = require('../../serviceAccountKey.json');
  } catch (error) {
    console.warn('No Firebase service account credentials found. Please set up Firebase Admin SDK credentials.');
   
  }
}


if (serviceAccount && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.projectId
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
  }
}

module.exports = admin;