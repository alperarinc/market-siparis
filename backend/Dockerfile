# ============================================
# Stage 1: Build
# ============================================
FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /app

# Dependency cache layer
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Source build
COPY src src
RUN ./mvnw clean package -DskipTests -B

# ============================================
# Stage 2: Runtime (production-hardened)
# ============================================
FROM eclipse-temurin:25-jre-alpine

# Güvenlik: non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Sağlık kontrolü için curl
RUN apk add --no-cache curl

COPY --from=build /app/target/*.jar app.jar

# Non-root olarak çalıştır
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

# JVM Enterprise Tuning
ENV JAVA_OPTS="-XX:+UseZGC \
    -XX:MaxRAMPercentage=75.0 \
    -XX:+UseStringDeduplication \
    -Djava.security.egd=file:/dev/./urandom \
    -Dspring.output.ansi.enabled=NEVER"

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD curl -f http://localhost:8080/api/actuator/health/liveness || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar app.jar"]
