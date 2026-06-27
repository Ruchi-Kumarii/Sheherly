import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAYIk99HQzk7AnyJBdaLsvyj2YbJsh2kI4",
  authDomain: "sheherly-09b.firebaseapp.com",
  projectId: "sheherly-09b",
  storageBucket: "sheherly-09b.firebasestorage.app",
  messagingSenderId: "258596208797",
  appId: "1:258596208797:web:75861dba5a91605168d474"
};

// Prevent duplicate app initialization on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app);

export const auth = getApps().length === 1
  ? initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  : getAuth(app);
