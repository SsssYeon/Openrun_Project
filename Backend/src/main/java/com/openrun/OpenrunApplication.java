package com.openrun;

import com.openrun.service.PfmRankingService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class OpenrunApplication {

	public static void main(String[] args) {
		SpringApplication.run(OpenrunApplication.class, args);
	}
/**
	@Bean
	CommandLineRunner run(PfmRankingService rankingService) { // <- Spring이 자동으로 주입
		return args -> {
			rankingService.generateWeeklyRanking(); // 서비스 메서드 호출
		};
	}
	**/
}
