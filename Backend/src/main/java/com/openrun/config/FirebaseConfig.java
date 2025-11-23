// src/main/java/com/openrun/config/FirebaseConfig.java
package com.openrun.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    private static final ObjectMapper OM = new ObjectMapper();

    /* 환경변수만 사용 (파일/베이스64/ADC 미사용) */
    private static GoogleCredentials loadCredentialsFromEnvOnly() throws IOException {
        String rawJson = System.getenv("FIREBASE_CREDENTIALS_JSON");
        if (rawJson == null || rawJson.isBlank()) {
            throw new IllegalStateException(
                    "FIREBASE_CREDENTIALS_JSON 환경변수가 비어 있습니다. 서비스계정 JSON 원문을 넣어주세요."
            );
        }

        // 1) JSON 파싱
        JsonNode node = OM.readTree(rawJson);
        if (!node.isObject()) {
            throw new IllegalStateException("FIREBASE_CREDENTIALS_JSON 형식이 JSON 객체가 아닙니다.");
        }

        // 2) private_key 정규화: "\\n" → 실제 개행, CR 제거
        ObjectNode obj = (ObjectNode) node;
        JsonNode pkNode = obj.get("private_key");
        if (pkNode == null || pkNode.isNull()) {
            throw new IllegalStateException("서비스계정 JSON에 private_key가 없습니다.");
        }
        String pk = pkNode.asText();
        String pkFixed = pk.replace("\\n", "\n").replace("\r", "");
        obj.put("private_key", pkFixed);

        // 3) Firebase가 읽을 수 있게 바이트로 직렬화
        byte[] fixedJson = OM.writeValueAsBytes(obj);
        return GoogleCredentials.fromStream(new ByteArrayInputStream(fixedJson));
    }

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            String bucket = System.getenv("FIREBASE_STORAGE_BUCKET");
            if (bucket == null || bucket.isBlank()) {
                throw new IllegalStateException(
                        "FIREBASE_STORAGE_BUCKET 환경변수가 비어 있습니다"
                );
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(loadCredentialsFromEnvOnly())
                    .setStorageBucket(bucket)
                    .build();

            return FirebaseApp.initializeApp(options);
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