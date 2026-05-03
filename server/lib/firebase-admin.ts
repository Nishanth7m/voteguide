import { initializeApp, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import firebaseConfig from "../../firebase-applet-config.json" assert { type: "json" };

// Initialize the Admin SDK app
// In AI Studio, we prefer using the provided config but allowing for environment defaults
let app: App;
if (getApps().length === 0) {
  app = initializeApp({
    projectId: firebaseConfig.projectId,
  });
} else {
  app = getApps()[0];
}

export const getSessionCollection = () => {
  const databaseId = firebaseConfig.firestoreDatabaseId;
  
  if (!databaseId || databaseId === "(default)") {
    console.warn("[FirebaseAdmin] No specific firestoreDatabaseId found in config. Defaulting to (default) instance.");
    // Note: This will fail if the default database is in Datastore mode.
    return getFirestore(app).collection("sessions");
  }

  console.log(`[FirebaseAdmin] Explicitly targeting Firestore database: ${databaseId}`);
  
  try {
    const db = getFirestore(app, databaseId);
    return db.collection("sessions");
  } catch (err: any) {
    console.error(`[FirebaseAdmin] Error initializing Firestore for database ${databaseId}:`, err.message);
    // If it fails to sogar initialize, we might be on an older SDK or have bad config.
    // We try one last fallback to the default db instance.
    return getFirestore(app).collection("sessions");
  }
};
