# AGENTS.md - comment-service

Guidelines for agentic coding agents working in this NestJS/MongoDB comment service repository.

## Build/Lint/Test Commands

```bash
# Development
pnpm build                 # Production build
pnpm start                 # Start production server
pnpm start:dev             # Start with hot reload
pnpm start:debug           # Start with debugger
pnpm start:prod            # Run production build

# Testing
pnpm test                  # Run all tests
pnpm test -- <pattern>     # Run tests matching pattern (file name or describe/it)
pnpm test -- comments.service  # Run specific test file
pnpm test -- --testNamePattern="should create"  # Run specific test
pnpm test -- --bail        # Stop on first failure
pnpm test:watch            # Watch mode
pnpm test:cov              # Coverage report
pnpm test:debug            # Debug tests with inspector
pnpm test:e2e              # End-to-end tests

# Linting and Formatting
pnpm lint                  # ESLint check
pnpm lint -- --fix         # ESLint auto-fix
pnpm format                # Prettier format all files
```

## Code Style Guidelines

### TypeScript

- Target: ES2023 with NodeNext module resolution
- Strict null checks enabled, but `noImplicitAny: false`
- Prefer `interface` over `type` for object shapes
- Use explicit return types on public methods
- Use decorators for NestJS (experimentalDecorators enabled)

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `comments.service.ts`)
- **Classes**: `PascalCase` (e.g., `CommentsService`)
- **Methods/Properties**: `camelCase` (e.g., `findByPostId`)
- **Constants**: `SCREAMING_SNAKE_CASE` for true constants
- **Interfaces**: No `I` prefix (e.g., `Comment`, not `IComment`)
- **DTOs**: Suffix with `Dto` (e.g., `CreateCommentDto`)
- **Private fields**: Use `private readonly` for injected dependencies

### Formatting (Prettier)

- Single quotes: `true`
- Trailing commas: `all`
- End of line: auto (LF/CRLF handled automatically)

### Imports Order

1. External libraries (@nestjs/\*, mongoose, etc.)
2. Internal absolute imports (src/\*)
3. Relative imports (./, ../)
4. Type-only imports last

### NestJS Patterns

- Use dependency injection via constructor with `private readonly`
- Use `@Injectable()` for services
- Use `@Controller()` for route handlers with route prefixes
- Use DTOs with class-validator decorators for input validation
- Use `@nestjs/mongoose` for MongoDB models
- Prefer async/await over callbacks
- Co-locate unit tests as `*.spec.ts` next to source files

### Error Handling

- Use NestJS built-in exceptions (`NotFoundException`, `BadRequestException`, `ConflictException`)
- Create custom exceptions extending `HttpException` when needed
- Use `@Catch()` filters for global error handling
- Always log errors with context before throwing
- Use `@nestjs/common` Logger for logging

### ESLint Rules

- `@typescript-eslint/no-explicit-any`: off (allowed but discouraged)
- `@typescript-eslint/no-floating-promises`: warn
- `@typescript-eslint/no-unsafe-argument`: warn
- Prettier integration enforces formatting

## Git Workflow

### Branch Naming (enforced by lefthook)

- `feature/<description>` - New features
- `bugfix/<description>` - Bug fixes
- `hotfix/<description>` - Production hotfixes
- `release/<version>` - Release preparation
- `test/<description>` - Test branches
- `docs/<description>` - Documentation
- `chore/<description>` - Maintenance
- `refactor/<description>` - Refactoring
- `perf/<description>` - Performance

### Commit Messages (Conventional Commits)

```
<type>[optional scope]: <description>

Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
Max subject line: 50 characters
Max first line: 72 characters

Examples:
  feat(comments): add reply functionality
  fix: resolve race condition in comment creation
  docs(api): update swagger documentation
```

### Protected Branches (no direct push)

- `main`, `master` - Production
- `develop` - Development integration
- `release/*` - Release branches
- `hotfix/*` - Hotfix branches

Create pull requests for all changes to protected branches.

## Project Structure

```
src/
├── comments/              # Comments module
│   ├── dto/
│   ├── entities/          # or schemas/
│   ├── comments.controller.ts
│   ├── comments.service.ts
│   ├── comments.module.ts
│   └── comments.service.spec.ts
test/
├── app.e2e-spec.ts        # E2E tests
└── jest-e2e.json          # E2E Jest config
```

## Environment Variables

Required in `.env`:

- `MONGODB_URI` - MongoDB connection string
- `KAFKA_BROKERS` - Kafka broker list
- `PORT` - Server port (default: 3000)

Never commit `.env` files - they're in `.gitignore`.

## Docker Commands

```bash
docker compose up -d mongo   # Start MongoDB
docker compose up -d         # Start all services
docker compose down          # Stop services
```

## Lefthook

```bash
lefthook install  # Install git hooks (run once)
```

Hooks enforce: commit message format, branch naming, linting, formatting, and tests.
