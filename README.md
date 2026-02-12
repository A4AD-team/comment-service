# Comment Service

Сервис комментариев форума.

[![NestJS](https://img.shields.io/badge/NestJS-10+-E0234E?logo=nestjs)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7+-47A248?logo=mongodb)](https://www.mongodb.com/)

## Функции

- Дерево комментариев (ответы на комментарии)
- Лайки под комментариями
- Мягкое удаление
- Пагинация по посту

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

## Эндпоинты

- POST   `/comments`
- GET    `/comments?postId=...&limit=...&cursor=...`
- PATCH  `/comments/:id`
- DELETE `/comments/:id`
- POST   `/comments/:id/like`
