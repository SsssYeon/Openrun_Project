package com.openrun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;

@EnableCaching
@EnableScheduling
@SpringBootApplication
public class OpenrunApplication {

	public static void main(String[] args) {
		SpringApplication.run(OpenrunApplication.class, args);
	}
}