<p align="center">
  <img src="https://img.shields.io/badge/A4AD-Comment%20Service-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="A4AD Comment Service">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-10+-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/MongoDB-7+-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/RabbitMQ-3+-FF6600?style=flat-square&logo=rabbitmq&logoColor=white" alt="RabbitMQ">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</p>

---

## 📝 Overview

**Comment Service** manages threaded discussions and replies for the A4AD Forum. It supports nested comment trees, soft deletion, likes on comments, and real-time notifications via RabbitMQ events. Built with MongoDB for flexible document storage.

The service supports both REST API and RabbitMQ RPC for communication.

---

## ✨ Features

- 💬 **Threaded Comments** — Nested reply system with unlimited depth
- 🌳 **Comment Trees** — Efficient retrieval of comment hierarchies
- 👍 **Comment Likes** — Like/unlike system with counters
- 🗑️ **Soft Deletion** — Comments marked as deleted but preserved
- 📄 **Pagination** — Cursor-based pagination for large threads
- ⚡ **Dual Communication** — REST API + RabbitMQ RPC
- 📚 **Swagger Documentation** — Interactive API docs at `/api`
- 🔄 **Event Publishing** — RabbitMQ events for comment actions

---

## 🛠 Tech Stack

- **Framework:** NestJS 10+
- **Language:** TypeScript 5.0+
- **Database:** MongoDB 7+
- **ODM:** Mongoose / @nestjs/mongoose
- **Message Broker:** RabbitMQ (@golevelup/nestjs-rabbitmq)
- **Cache/Rate Limit:** Redis
- **Validation:** class-validator + class-transformer
- **Documentation:** Swagger/OpenAPI
- **Testing:** Jest + Supertest

---

## 📊 Architecture

```mermaid
flowchart LR
    Gateway["API Gateway"] --> Comment["Comment Service<br/>NestJS + TypeScript"]
    Comment --> MongoDB[("MongoDB<br/>Comments Collection")]
    Comment --> RabbitMQ[("RabbitMQ<br/>Events & RPC")]

    RabbitMQ -.->|"comment.created"| Notification["Notification Service"]
    RabbitMQ -.->|"comment.liked"| Notification
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- MongoDB 7+
- RabbitMQ 3+
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/A4AD-team/comment-service.git
   cd comment-service
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Start infrastructure:**

   ```bash
   docker compose up -d
   ```

4. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run the service:**

   ```bash
   # Development mode with hot reload
   pnpm start:dev

   # Production build
   pnpm build
   pnpm start:prod
   ```

The service will be available at `http://localhost:3000`

---

## 🔧 Environment Variables

| Variable            | Description                           | Default                                     |
| ------------------- | ------------------------------------- | ------------------------------------------- |
| `NODE_ENV`          | Environment (development, production) | `development`                               |
| `PORT`              | HTTP server port                      | `3000`                                      |
| `MONGODB_URI`       | MongoDB connection string             | `mongodb://localhost:27017/comment-service` |
| `RABBITMQ_URI`      | RabbitMQ connection string            | `amqp://guest:guest@localhost:5672`         |
| `REDIS_HOST`        | Redis host                            | `localhost`                                 |
| `REDIS_PORT`        | Redis port                            | `6379`                                      |
| `RATE_LIMIT_MAX`    | Max requests per window               | `30`                                        |
| `RATE_LIMIT_WINDOW` | Rate limit window (seconds)           | `60`                                        |
| `LOG_LEVEL`         | Logging level                         | `info`                                      |

---

## 📡 API Endpoints

### REST API

| Method   | Path                           | Description                          |
| -------- | ------------------------------ | ------------------------------------ |
| `POST`   | `/comments`                    | Create a new comment                 |
| `GET`    | `/comments`                    | List comments (query: `?postId=xxx`) |
| `GET`    | `/comments/:commentId`         | Get single comment                   |
| `PATCH`  | `/comments/:commentId`         | Update comment                       |
| `DELETE` | `/comments/:commentId`         | Soft delete comment                  |
| `POST`   | `/comments/:commentId/like`    | Like a comment                       |
| `DELETE` | `/comments/:commentId/like`    | Unlike a comment                     |
| `POST`   | `/comments/:commentId/restore` | Restore comment                      |

### Query Parameters

| Parameter | Description               | Default           |
| --------- | ------------------------- | ----------------- |
| `postId`  | Filter by post ID         | Required for list |
| `limit`   | Comments per page         | `20`              |
| `cursor`  | Pagination cursor         | -                 |
| `sort`    | Sort order: `asc`, `desc` | `desc`            |

### Swagger

API documentation is available at: `http://localhost:3000/api`

---

## 🐇 RabbitMQ RPC

The service exposes RPC endpoints for asynchronous communication.

### Routing Keys

| Routing Key       | Description        |
| ----------------- | ------------------ |
| `comment.create`  | Create a comment   |
| `comment.getAll`  | List comments      |
| `comment.get`     | Get single comment |
| `comment.update`  | Update comment     |
| `comment.delete`  | Delete comment     |
| `comment.like`    | Like comment       |
| `comment.unlike`  | Unlike comment     |
| `comment.restore` | Restore comment    |

### Request Format

```json
{
  "requestId": "uuid",
  "timestamp": "2026-02-20T12:00:00Z",
  "postId": "uuid",
  "content": "Comment text",
  "authorId": "uuid"
}
```

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "error": { "code": "ERROR_CODE", "message": "Error message" },
  "requestId": "uuid"
}
```

### Example RPC Call

```typescript
const response = await amqpConnection.request({
  exchange: 'comments',
  routingKey: 'comment.create',
  payload: {
    requestId: 'uuid',
    timestamp: new Date().toISOString(),
    postId: 'post-uuid',
    content: 'Hello world',
    authorId: 'user-uuid',
  },
  timeout: 10000,
});
```

---

## 🩺 Health Checks

| Endpoint        | Method | Description                      |
| --------------- | ------ | -------------------------------- |
| `/health`       | `GET`  | Overall health status            |
| `/health/live`  | `GET`  | Liveness probe                   |
| `/health/ready` | `GET`  | Readiness probe (checks MongoDB) |
| `/api`          | `GET`  | Swagger API documentation        |

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:cov

# Run tests in watch mode
pnpm test:watch

# Run specific test
pnpm test comments

# Run e2e tests
pnpm test:e2e
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ by A4AD Team</strong>
</p>
