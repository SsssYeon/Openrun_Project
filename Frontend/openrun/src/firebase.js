import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 🚨🚨🚨 여기에 본인의 Firebase 프로젝트 설정을 넣어주세요 🚨🚨🚨
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "openrun-8e238",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

// 1. Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// 2. Auth 서비스 인스턴스 가져오기
export const auth = getAuth(app); // ⬅️ **이 부분이 중요! `auth` 객체를 `export` 해야 합니다.**

// 만약 다른 서비스도 사용한다면:
// export const db = getFirestore(app);

// 3. 앱 인스턴스 자체를 내보낼 수도 있습니다.
export default app;