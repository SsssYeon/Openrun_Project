package com.openrun.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private InputStream credentialsStream() throws IOException {
        String path = System.getenv("FIREBASE_CRED_PATH"); // 배포용(Secret Files 경로)
        if (path != null && !path.isBlank()) return new FileInputStream(path);
        ClassPathResource res = new ClassPathResource("firebase-service-key.json"); // 로컬용
        if (res.exists()) return res.getInputStream();
        throw new IllegalStateException("Firebase 서비스 키를 찾을 수 없음(FIREBASE_CRED_PATH 또는 classpath 확인 필요)");
    }

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            try (InputStream is = credentialsStream()) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(is))
                        // 버킷 이름은 보통 "<project-id>.appspot.com"
                        .setStorageBucket(System.getenv().getOrDefault(
                                "FIREBASE_STORAGE_BUCKET",
                                "openrun-8e238.appspot.com"
                        ))
                        .build();
                return FirebaseApp.initializeApp(options);
            }
        }
        return FirebaseApp.getInstance();
    }

    @Bean
    public Firestore firestore(FirebaseApp app) {
        return FirestoreClient.getFirestore(app);
    }

    @Bean
    public FirebaseAuth firebaseAuth(FirebaseApp app) {
        return FirebaseAuth.getInstance(app);
    }

    @Bean
    public StorageClient storageClient(FirebaseApp app) {
        return StorageClient.getInstance(app);
    }
}