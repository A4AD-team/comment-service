# Comment Service

Сервис комментариев и истории обсуждения заявок.

[![NestJS](https://img.shields.io/badge/NestJS-10+-E0234E?logo=nestjs)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7+-47A248?logo=mongodb)](https://www.mongodb.com/)

## Технологический стек

- NestJS 10+
- TypeScript
- Mongoose / @nestjs/mongoose
- MongoDB 7+
- Kafka consumer / producer (@nestjs/microservices)

## Структура

```
comment-service/
├── src/
│   ├── comments/
│   ├── common/
│   └── main.ts
├── test/
├── Dockerfile
└── docker-compose.yml
```

## Запуск

```bash
docker compose up -d mongo

npm run start:dev
```
