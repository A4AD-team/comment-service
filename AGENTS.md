# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in the comment-service repository.

## Project Overview

This is a NestJS-based comment service for managing comments and discussion history on requests/claims.
- **Framework**: NestJS 10+ with TypeScript
- **Database**: MongoDB 7+ with Mongoose ODM
- **Messaging**: Kafka consumer/producer via @nestjs/microservices
- **Architecture**: Microservice with modular structure

## Development Commands

### Environment Setup
```bash
# Start MongoDB (required for development)
docker compose up -d mongo

# Install dependencies
npm install

# Start development server
npm run start:dev

# Start in watch mode
npm run start:dev -- --watch

# Start in debug mode
npm run start:dev -- --debug
```

### Build Commands
```bash
# Build for production
npm run build

# Build and start production server
npm run start:prod

# Clean build artifacts
npm run clean
```

### Testing Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run specific test file
npm test -- --testNamePattern="CommentService"

# Run tests for specific file
npm test src/comments/comments.service.spec.ts

# Run E2E tests
npm run test:e2e
```

### Linting and Formatting
```bash
# Run ESLint
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Run Prettier
npm run format

# Check formatting without fixing
npm run format:check
```

## Code Style Guidelines

### TypeScript Configuration
- Use strict TypeScript settings
- Prefer explicit return types for public methods
- Use interfaces for data shapes, types for unions/enums
- Enable `noImplicitAny` and `strictNullChecks`

### Import Organization
```typescript
// 1. Node.js built-in modules
import { Injectable, Module } from '@nestjs/common';
import { Model } from 'mongoose';

// 2. External dependencies
import { Kafka } from 'kafkajs';

// 3. Internal modules (absolute imports with @ prefix)
import { Comment } from '@/comments/entities/comment.entity';
import { DatabaseService } from '@/common/database/database.service';

// 4. Relative imports (for same module)
import { CreateCommentDto } from './dto/create-comment.dto';
```

### Naming Conventions
- **Classes**: PascalCase (e.g., `CommentService`, `CommentModule`)
- **Files**: kebab-case (e.g., `comment.service.ts`, `create-comment.dto.ts`)
- **Variables/Functions**: camelCase (e.g., `createComment`, `commentId`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_COMMENT_LENGTH`)
- **Interfaces**: PascalCase with `I` prefix optional (e.g., `ICommentRepository`)
- **DTOs**: PascalCase with `Dto` suffix (e.g., `CreateCommentDto`)

### Directory Structure
```
src/
├── comments/
│   ├── dto/
│   │   ├── create-comment.dto.ts
│   │   └── update-comment.dto.ts
│   ├── entities/
│   │   └── comment.entity.ts
│   ├── interfaces/
│   │   └── comment.interface.ts
│   ├── comments.controller.ts
│   ├── comments.module.ts
│   └── comments.service.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── utils/
├── config/
├── database/
└── main.ts
```

### Error Handling
```typescript
// Use built-in NestJS exceptions
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Custom exception messages should be descriptive
throw new NotFoundException(`Comment with ID ${commentId} not found`);

// Validate DTOs using class-validator
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}
```

### Database Patterns
```typescript
// Use Mongoose schemas with decorators
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Comment extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  requestId: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
```

### Kafka Integration
```typescript
// Use @nestjs/microservices for Kafka
@Controller()
export class CommentsController {
  @EventPattern('comment.created')
  async handleCommentCreated(@Payload() data: CreateCommentDto) {
    // Handle event
  }

  @MessagePattern('comments.find')
  async findComments(@Payload() query: FindCommentsQuery) {
    return this.commentsService.find(query);
  }
}
```

### Testing Patterns
```typescript
// Use NestJS testing utilities
import { Test } from '@nestjs/testing';
import { CommentsService } from './comments.service';

describe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CommentsService],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

## Git Workflow

Follow the Git Flow conventions documented in `GIT_FLOW.md`:
- Use conventional commit messages
- Branch naming: `feature/`, `bugfix/`, `hotfix/`
- Never push directly to `main`, `develop`, `release/*`, or `hotfix/*` branches

## Environment Variables

Create a `.env` file (gitignored) with:
```env
MONGODB_URI=mongodb://localhost:27017/comment-service
KAFKA_BROKERS=localhost:9092
PORT=3000
NODE_ENV=development
```

## Common Patterns

### Dependency Injection
- Use constructor injection with private readonly properties
- Prefer interfaces for dependencies to enable easy testing

### Validation
- Use class-validator and class-transformer for DTO validation
- Implement custom validation decorators as needed

### Logging
- Use NestJS's built-in Logger (`@nestjs/common`)
- Include relevant context in log messages

### Security
- Validate all input data
- Sanitize user-generated content
- Implement proper authentication/authorization

## Performance Guidelines

- Use database indexes for frequently queried fields
- Implement pagination for list endpoints
- Cache frequently accessed data when appropriate
- Use connection pooling for database connections