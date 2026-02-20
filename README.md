# Comment Service

Сервис комментариев форума.

[![NestJS](https://img.shields.io/badge/NestJS-10+-E0234E?logo=nestjs)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7+-47A248?logo=mongodb)](https://www.mongodb.com/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3+-FF6600?logo=rabbitmq)](https://www.rabbitmq.com/)

## Функции

- Древовидные комментарии (ответы на комментарии)
- Лайки под комментариями
- Мягкое удаление
- Пагинация по посту (курсорная)
- REST API и RabbitMQ RPC
- Swagger документация

## Технологический стек

- NestJS 10+
- TypeScript
- Mongoose / @nestjs/mongoose
- MongoDB 7+
- RabbitMQ (@golevelup/nestjs-rabbitmq)
- Redis (rate limiting)

## Структура

```
comment-service/
├── src/
│   ├── comments/          # Модуль комментариев
│   ├── rabbitmq/          # RabbitMQ RPC обработчики
│   ├── common/            # Общие компоненты
│   ├── config/            # Конфигурация
│   ├── health/            # Health checks
│   └── main.ts
├── test/
├── Dockerfile
└── docker-compose.yml
```

## Запуск

```bash
# Запуск MongoDB и RabbitMQ
docker compose up -d

# Установка зависимостей
pnpm install

# Запуск в режиме разработки
pnpm start:dev
```

## Переменные окружения

Скопируйте `.env.example` в `.env` и настройте:

- `MONGODB_URI` - MongoDB URI
- `RABBITMQ_URI` - RabbitMQ URI (по умолчанию amqp://guest:guest@localhost:5672)
- `REDIS_HOST`, `REDIS_PORT` - Redis для rate limiting
- `PORT` - Порт сервера (по умолчанию 3000)

## API Endpoints

### REST API

| Метод  | Путь                           | Описание                 |
| ------ | ------------------------------ | ------------------------ |
| POST   | `/comments`                    | Создать комментарий      |
| GET    | `/comments`                    | Список комментариев      |
| GET    | `/comments/:commentId`         | Получить комментарий     |
| PATCH  | `/comments/:commentId`         | Обновить комментарий     |
| DELETE | `/comments/:commentId`         | Удалить комментарий      |
| POST   | `/comments/:commentId/like`    | Лайкнуть комментарий     |
| DELETE | `/comments/:commentId/like`    | Убрать лайк              |
| POST   | `/comments/:commentId/restore` | Восстановить комментарий |

### Swagger

Документация доступна по адресу: `http://localhost:3000/api`

### RabbitMQ RPC

| Routing Key       | Описание                 |
| ----------------- | ------------------------ |
| `comment.create`  | Создать комментарий      |
| `comment.getAll`  | Список комментариев      |
| `comment.get`     | Получить комментарий     |
| `comment.update`  | Обновить комментарий     |
| `comment.delete`  | Удалить комментарий      |
| `comment.like`    | Лайкнуть комментарий     |
| `comment.unlike`  | Убрать лайк              |
| `comment.restore` | Восстановить комментарий |

### Формат RabbitMQ запроса/ответа

**Запрос:**

```json
{
  "requestId": "uuid",
  "timestamp": "2026-02-20T12:00:00Z",
  "postId": "uuid",
  "content": "Comment text",
  "authorId": "uuid"
}
```

**Ответ:**

```json
{
  "success": true,
  "data": { ... },
  "error": { "code": "ERROR_CODE", "message": "Error message" },
  "requestId": "uuid"
}
```

## Health Checks

- `GET /health` - Общий статус
- `GET /health/live` - Liveness проба
- `GET /health/ready` - Readiness проба (проверка MongoDB)

## Команды

```bash
pnpm build           # Сборка
pnpm start           # Запуск
pnpm start:dev       # Режим разработки
pnpm test            # Тесты
pnpm lint            # Линтинг
pnpm format          # Форматирование
```
