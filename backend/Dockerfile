# ============================================
# Stage 1: Build
# ============================================
FROM maven:3.9-eclipse-temurin-25-alpine AS build
WORKDIR /app

# Dependency cache layer
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Source build
COPY src src
RUN mvn clean package -DskipTests -B

# ============================================
# Stage 2: Runtime (production-hardened)
# ============================================
FROM eclipse-temurin:25-jre-alpine

# Guvenlik: non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Saglik kontrolu icin curl
RUN apk add --no-cache curl

COPY --from=build /app/target/*.jar app.jar

# Non-root olarak calistir
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
