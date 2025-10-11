# syntax=docker/dockerfile:1

# --- Build stage ---
FROM eclipse-temurin:17-jdk AS build
WORKDIR /src

# Gradle wrapper & settings
COPY gradlew gradlew.bat settings.gradle build.gradle ./
COPY gradle gradle
RUN chmod +x gradlew

# App sources
COPY src src

# Build fat jar
RUN ./gradlew --no-daemon clean bootJar

# --- Run stage ---
FROM eclipse-temurin:17-jre
WORKDIR /app

# copy built jar (단일 jar만 생성된다는 가정; 여러 개면 정확한 파일명으로 바꿔주세요)
COPY --from=build /src/build/libs/*.jar app.jar

# Render가 제공하는 $PORT로 바인딩
ENV PORT=8080
EXPOSE 8080
CMD ["sh","-c","java -Dserver.port=${PORT} -jar app.jar"]