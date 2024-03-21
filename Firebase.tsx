// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth"
import AsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK vs7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "",
  authDomain: "avy-viz.firebaseapp.com",
  projectId: "avy-viz",
  storageBucket: "avy-viz.appspot.com",
  messagingSenderId: "196493451574",
  appId: "1:196493451574:web:fb4b73c1fa46caf71d1397",
  measurementId: "G-ZC2WZ469NZ"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage)});
const db = getFirestore(app);

export { app, db, auth }
