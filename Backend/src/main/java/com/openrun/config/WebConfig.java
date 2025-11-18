// src/main/java/com/openrun/config/WebConfig.java
package com.openrun.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final List<String> ORIGIN_PATTERNS = List.of(
            "https://openrun.netlify.app",     // Netlify 프로덕션
            "https://*--openrun.netlify.app",  // Netlify 프리뷰(브랜치/PR)
            "http://localhost:3000",           // 로컬 React
            "http://localhost:8888"            // netlify dev (선택)
    );

    /** (MVC 핸들러에 직접 적용) */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                // 쿠키 사용 시 와일드카드(*) 불가 → 패턴 기반으로 정확히 지정
                .allowedOriginPatterns(ORIGIN_PATTERNS.toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                // 쿠키·세션 전송 허용
                .allowCredentials(true)
                // 프리플라이트(OPTIONS) 캐시
                .maxAge(3600);
    }

    /**
     * (Security를 사용하는 프로젝트일 때) http.cors() 가 이 Bean 을 자동 사용합니다.
     * Security를 쓰지 않아도 있어도 무해합니다.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowCredentials(true);
        c.setAllowedOriginPatterns(ORIGIN_PATTERNS);
        c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        // 필요 시 다운로드 파일명 노출 등
        // c.setExposedHeaders(List.of("Location","Content-Disposition"));
        c.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", c);
        return source;
    }
}

