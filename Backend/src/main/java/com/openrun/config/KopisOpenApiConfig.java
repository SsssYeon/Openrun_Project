// src/main/java/com/openrun/config/KopisOpenApiConfig.java
package com.openrun.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.web.client.RestTemplate;

@Configuration
public class KopisOpenApiConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    // 프로퍼티에서 주입 받아 사용할 수 있도록 빈 노출 (선택)
    @Bean
    public String kopisApiKey(@Value("${kopis.api.key}") String key) {
        return key;
    }
}