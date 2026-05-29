-- Prisma Migrate Migration SQL

CREATE TABLE "organizations" (
    "id" TEXT PRIMARY KEY DEFAULT cuid(),
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'MEMBER');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED');

CREATE TABLE "users" (
    "id" TEXT PRIMARY KEY DEFAULT cuid(),
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE
);
CREATE INDEX "users_organizationId_index" ON "users" ("organizationId");
CREATE INDEX "users_email_index" ON "users" ("email");

CREATE TABLE "tasks" (
    "id" TEXT PRIMARY KEY DEFAULT cuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "dueDate" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tasks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE,
    CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL,
    CONSTRAINT "tasks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "tasks_organizationId_index" ON "tasks" ("organizationId");
CREATE INDEX "tasks_status_index" ON "tasks" ("status");
CREATE INDEX "tasks_assigneeId_index" ON "tasks" ("assigneeId");
CREATE INDEX "tasks_dueDate_index" ON "tasks" ("dueDate");
CREATE INDEX "tasks_organizationId_status_index" ON "tasks" ("organizationId", "status");
CREATE INDEX "tasks_organizationId_assigneeId_index" ON "tasks" ("organizationId", "assigneeId");

CREATE TABLE "refresh_tokens" (
    "id" TEXT PRIMARY KEY DEFAULT cuid(),
    "hashedToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "refresh_tokens_userId_index" ON "refresh_tokens" ("userId");
CREATE INDEX "refresh_tokens_expiresAt_index" ON "refresh_tokens" ("expiresAt");
