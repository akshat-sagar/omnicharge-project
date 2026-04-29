# Dockerization Guide for OmniCharge

## 1. Purpose

This document describes how to containerize the current `OmniCharge` application step by step before changing the codebase.

The project is a Spring Boot microservices system with these application services:

- `EurekaServer` on `8761`
- `OmniCharge-config-server` on `9999`
- `APIGateway` on `8087`
- `UserManagement` on `8081`
- `RechargeProcessing` on `8083`
- `PaymentService` on `8084`
- `notification-service` on `8085`
- `OperatorPlanManagement` on `8086`
- `AuthService` on `8089`

The system also depends on infrastructure services:

- PostgreSQL
- Redis
- RabbitMQ
- Zipkin

## 2. Current State of the Project

All services are Java 17 Spring Boot applications built with Maven.

At the moment, the application properties are written for local execution on the host machine. Most services currently use `localhost` for infrastructure dependencies, for example:

- PostgreSQL at `localhost:5432`
- Redis at `localhost:6379`
- RabbitMQ at `localhost:5672`
- Eureka at `localhost:8761`
- Config Server at `localhost:9999`
- Zipkin at `localhost:9411`

This is the main reason the project is not yet container-ready. Inside Docker, `localhost` points to the container itself, not to sibling containers.

## 3. What Must Change Before Docker Works Properly

Before adding Dockerfiles and Compose, the application should be adjusted to use container-friendly hostnames.

Typical examples:

- Replace `localhost:8761` with `eureka-server:8761`
- Replace `localhost:9999` with `config-server:9999`
- Replace `localhost:5432` with `postgres:5432`
- Replace `localhost:6379` with `redis:6379`
- Replace `localhost:5672` with `rabbitmq:5672`
- Replace `localhost:9411` with `zipkin:9411`

The safest way is not to hardcode Docker names directly. Instead, externalize them with environment variables.

Example pattern:

```properties
spring.datasource.url=jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/userservicedb
eureka.client.service-url.defaultZone=http://${EUREKA_HOST:localhost}:${EUREKA_PORT:8761}/eureka/
spring.data.redis.host=${REDIS_HOST:localhost}
spring.rabbitmq.host=${RABBITMQ_HOST:localhost}
management.zipkin.tracing.endpoint=http://${ZIPKIN_HOST:localhost}:9411/api/v2/spans
spring.config.import=optional:file:.env[.properties],optional:file:../.env[.properties],optional:configserver:http://${CONFIG_HOST:localhost}:${CONFIG_PORT:9999}/config
```

That keeps local execution working while also supporting Docker.

## 4. Recommended Docker Strategy

Use `docker compose` for local development and system integration.

Recommended structure:

- One `Dockerfile` per Spring Boot service
- One root `docker-compose.yml`
- One `.dockerignore` per service or a shared simple version
- Continue using `.env` for secrets and runtime configuration

## 5. Suggested Container Names

Use predictable service names in Compose because those names become internal DNS names:

- `postgres`
- `redis`
- `rabbitmq`
- `zipkin`
- `eureka-server`
- `config-server`
- `api-gateway`
- `user-management`
- `recharge-processing`
- `payment-service`
- `notification-service`
- `operator-plan-management`
- `auth-service`

## 6. PostgreSQL Database Planning

From the current configuration, these databases are needed:

- `userservicedb`
- `rechargeprocessingdb`
- `paymentservicedb`
- `operatorPlan`

Notes:

- `AuthService` currently points to `userservicedb`
- `UserManagement` also points to `userservicedb`

You need to decide whether:

1. both services should intentionally share the same database, or
2. `AuthService` should get its own database

That decision should be made before finalizing Compose.

## 7. Recommended Order of Work

### Step 1. Clean up configuration

Update all application property files so hostnames and ports come from environment variables with local defaults.

Files that will need review:

- `APIGateway/src/main/resources/application.properties`
- `AuthService/src/main/resources/application.properties`
- `EurekaServer/src/main/resources/application.properties`
- `notification-service/src/main/resources/application.properties`
- `OmniCharge-config-server/src/main/resources/application.properties`
- `OperatorPlanManagement/src/main/resources/application.properties`
- `PaymentService/src/main/resources/application.properties`
- `RechargeProcessing/src/main/resources/application.properties`
- `UserManagement/src/main/resources/application.properties`

### Step 2. Add Dockerfiles

Create one Dockerfile for each Spring Boot service.

Recommended multi-stage Dockerfile pattern:

```dockerfile
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Adjust `EXPOSE` per service port.

### Step 3. Add `.dockerignore`

Each service should ignore:

```text
target
.idea
*.iml
logs
bin
```

### Step 4. Add `docker-compose.yml`

The compose file should define:

- infrastructure services
- microservices
- networks
- volumes
- health checks
- startup dependencies

### Step 5. Add database initialization

If using one PostgreSQL container with multiple databases, add an init script such as:

- `docker/postgres/init-multiple-dbs.sh`

That script can create:

- `userservicedb`
- `rechargeprocessingdb`
- `paymentservicedb`
- `operatorPlan`

### Step 6. Verify boot order

Suggested dependency order:

1. `postgres`, `redis`, `rabbitmq`, `zipkin`
2. `eureka-server`
3. `config-server`
4. business services
5. `api-gateway`

### Step 7. Validate from the gateway

After startup, verify:

- Eureka dashboard loads
- Config server responds
- services register with Eureka
- gateway routes work
- database-backed services connect successfully
- RabbitMQ consumers start
- Redis cache connection succeeds
- Zipkin receives traces

## 8. Example Compose Design

This is a reference design, not the final file for this repo yet.

```yaml
services:
  postgres:
    image: postgres:16
    container_name: postgres
    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    container_name: redis
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management
    container_name: rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USERNAME}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    ports:
      - "5672:5672"
      - "15672:15672"

  zipkin:
    image: openzipkin/zipkin:latest
    container_name: zipkin
    ports:
      - "9411:9411"

  eureka-server:
    build: ./EurekaServer
    ports:
      - "8761:8761"

  config-server:
    build: ./OmniCharge-config-server
    ports:
      - "9999:9999"
    depends_on:
      - eureka-server
```

The remaining services follow the same pattern, but each must receive the correct environment variables.

## 9. Environment Variables You Should Standardize

Add or keep these in `.env`:

```env
DB_USERNAME=postgres
DB_PASSWORD=your_password

DB_HOST=postgres
DB_PORT=5432

REDIS_HOST=redis
REDIS_PORT=6379

RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest

EUREKA_HOST=eureka-server
EUREKA_PORT=8761

CONFIG_HOST=config-server
CONFIG_PORT=9999

ZIPKIN_HOST=zipkin
ZIPKIN_PORT=9411
```

Application-specific secrets should remain there as well:

- `JWT_SECRET`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

## 10. Service-Specific Notes

### Config Server

The config server currently pulls configuration from a GitHub repository:

- `https://github.com/nityam10000/omniCharge-cloud-config.git`

That means Docker startup of the config server depends on external Git access. If the environment has no internet access, config server startup may fail.

### Notification Service

This service requires email and Twilio credentials. It can start without a database, but it still depends on:

- Eureka
- Config Server
- RabbitMQ
- Redis
- Zipkin

### Gateway

The gateway uses service discovery and routes to registered services, so it should start after service discovery and config are stable.

### Logging

Most services write logs to a `logs` directory. In Docker, prefer either:

- console logging only, or
- bind-mounted log directories

For local Compose development, console logging is simpler.

## 11. Validation Checklist

Before writing Docker files, verify:

- every `localhost` dependency is externalized
- every service can read config from environment variables
- secrets are not hardcoded into Dockerfiles
- ports do not conflict
- health checks are defined for core infra
- PostgreSQL database creation is automated
- config server dependency on remote Git is acceptable

After writing Docker files, verify:

- `docker compose build` succeeds
- `docker compose up` starts all infra
- every Spring service becomes healthy
- Eureka shows all expected registrations
- gateway requests resolve correctly
- DB migrations or schema creation work
- Redis and RabbitMQ connections succeed
- Zipkin traces are visible

## 12. Recommended Next Change

The next implementation step should be:

1. parameterize all hostnames and ports in the Spring configuration
2. add Dockerfiles for each service
3. add `docker-compose.yml`
4. test the full stack

This order is important. If Docker files are added before configuration cleanup, most services will still fail because they currently point to `localhost`.
