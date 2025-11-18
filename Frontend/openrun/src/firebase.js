import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// 🚨🚨🚨 전화번호 인증을 위해 getAuth를 가져와야 합니다. 🚨🚨🚨
import { getAuth } from "firebase/auth"; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAErVisNsfOdX4SH-3WRI1Nf-X6WFn-AVI",
  authDomain: "openrun-8e238.firebaseapp.com",
  projectId: "openrun-8e238",
  storageBucket: "openrun-8e238.firebasestorage.app",
  messagingSenderId: "361222017407",
  appId: "1:361222017407:web:fb7f3eba1128749e768a4a",
  measurementId: "G-9CRJ2CB2PV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 🚨🚨🚨 1. 인증(Auth) 서비스 인스턴스를 가져와 export 합니다. 🚨🚨🚨
export const auth = getAuth(app); 

// (선택 사항) Firebase 앱 자체를 내보낼 수도 있습니다.
export default app;