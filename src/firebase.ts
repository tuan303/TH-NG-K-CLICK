import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, OAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2-owGm_ni2lY_q_jRlvrKbOeM5uP0gjI",
  authDomain: "click-link-36dc3.firebaseapp.com",
  projectId: "click-link-36dc3",
  storageBucket: "click-link-36dc3.firebasestorage.app",
  messagingSenderId: "286159813774",
  appId: "1:286159813774:web:2f212649ae74f8746e5ddf",
  measurementId: "G-K99TVB85FV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);

// Configure Microsoft Provider
const microsoftProvider = new OAuthProvider('microsoft.com');
// Tùy chọn: Thêm tenant id để giới hạn duy nhất tổ chức của bạn
microsoftProvider.setCustomParameters({
  tenant: 'af9ef20a-3158-43a0-a1ab-ad72a03eb4c5'
});

export { app, analytics, db, auth, microsoftProvider };
