# Team Task Tracker API

A production-grade backend for a Team Task Tracker system with full organization isolation, JWT refresh rotation, RBAC, Redis caching, Swagger documentation, Docker, and test coverage.

## 🚀 Project Overview

This API supports team-based task management in a multi-tenant environment. Users belong to organizations, and all data access is scoped by organization. It features:

- JWT access and refresh token rotation
- Role-based access control (ADMIN, MANAGER, MEMBER)
- Organization separation and data isolation
- Task CRUD with status transition rules
- Redis caching for task lists
- Swagger/OpenAPI documentation
- Dockerized deployment with PostgreSQL and Redis
- Jest + Supertest regression tests

## 🧩 Tech Stack

- Node.js 18+
- Express.js
- PostgreSQL
- Prisma ORM
- Redis
- JWT Authentication
- Joi validation
- Swagger/OpenAPI
- Docker + Docker Compose
- Jest + Supertest

## ⚙️ Setup Instructions

### Run with Docker

```bash
docker compose up
```

This command starts the full stack, runs Prisma migrations, seeds the database, and launches the application.

### Available URLs

- API root: `http://localhost:3000`
- Swagger docs: `http://localhost:3000/api-docs`
- Health check: `http://localhost:3000/health`

## 🔐 Authentication

The API uses:

- Short-lived JWT access tokens (`15m`)
- Long-lived refresh tokens (`7d`)
- Refresh token rotation with secure hashing in the database
- Logout revokes refresh tokens

### Refresh flow

1. Client logs in and receives `accessToken` + `refreshToken`
2. Client uses `accessToken` for protected API calls
3. When the access token expires, client calls `POST /api/v1/auth/refresh`
4. Server validates the refresh token, revokes the old one, and issues a new pair

## 🛡️ RBAC Explanation

There are three roles:

- `ADMIN`: full access to organizations, users, projects, and tasks
- `MANAGER`: can manage projects, tasks, and assign members
- `MEMBER`: can view only assigned tasks and update only their assigned task status

All RBAC rules are enforced in middleware only (`authorize(...)`), not in controllers.

## 🗄️ Database Design Decisions

### Tables

- `organizations`: multi-tenant isolation
- `users`: user credentials and roles
- `tasks`: task metadata and organizational scope
- `refresh_tokens`: hashed refresh tokens with expiry and revocation

### Index strategy

- `tasks(status)`, `tasks(assigneeId)`, `tasks(dueDate)`
- compound indexes: `(organizationId, status)` and `(organizationId, assigneeId)`

These indexes support filtering and list queries by organization, status, and assignee.

## 🧠 Redis Caching Strategy

Task list responses are cached **per assignee and organization**. The cache key includes organization ID, page, limit, status, priority, assignee, sort order.

Cache example keys:
- `tasks:{organizationId}:page:1:limit:10:filters:{...}:assignee:{assigneeId}`

Caching is applied per user based on their assigned tasks, ensuring each user gets their own cached view.

Cache is invalidated when:

- task created
- task updated
- task deleted
- task status changes
- task assignee changes
- any modification that affects the user's task list

This ensures list responses remain fresh after modifications.

## 🗂️ Database Schema

The database is organized with clear relationships for multi-tenant isolation:

```
Organization
├── Users (all users in org)
│   ├── RefreshTokens (revocable)
│   ├── Created Tasks (tasks they created)
│   └── Assigned Tasks (tasks assigned to them)
│
└── Tasks (all tasks in org)
    ├── assignee → User
    ├── createdBy → User
    └── organization → Organization
```

Key design points:
- All tables include `organizationId` for scoping queries
- Refresh tokens are hashed before storage and linked to user
- Task status transitions are validated server-side, not in the database
- Indexes support filtering by organization, status, and assignee

## 📚 Folder Structure

The codebase follows a modular architecture with separated layers:

- `modules/`: controllers
- `services/`: business rules
- `repositories/`: database access
- `validations/`: Joi schemas
- `middleware/`: security, RBAC, error handling
- `config/`: environment, Redis, Swagger
- `utils/`: shared helpers and constants
- `prisma/`: schema, migration, seeding

This structure keeps controllers thin and business logic testable.

## ✅ Testing

Run tests with:

```bash
npm test
```

Critical flows covered:

- authentication lifecycle
- refresh token rotation
- task status transition rules
- pagination and filtering

## 📥 Environment Variables

Example variables are available in `.env.example`.

Key variables include:

- `DATABASE_URL`
- `REDIS_HOST`
- `REDIS_PORT`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `BCRYPT_ROUNDS`
- `CORS_ORIGIN`

## 🚧 Tradeoffs and Improvements

Planned improvements beyond this MVP:

- WebSocket notifications for real-time task updates
- Audit logs for status transitions and assignment changes
- Analytics dashboards and reporting
- Better monitoring and observability
- Expanded organization and project management APIs
