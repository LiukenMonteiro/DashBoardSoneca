"use client";

import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, set, Database } from "firebase/database";

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

let _db: Database | null = null;

export function getDb(): Database | null {
  if (typeof window === "undefined") return null;
  if (!API_KEY || !DB_URL) return null;
  if (!_db) {
    const app =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            apiKey: API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            databaseURL: DB_URL,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          });
    _db = getDatabase(app);
  }
  return _db;
}

export { ref, onValue, set };
