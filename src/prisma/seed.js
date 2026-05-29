import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/jwt.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create organization
  const org = await prisma.organization.upsert({
    where: { name: 'Default Organization' },
    update: {},
    create: {
      name: 'Default Organization',
    },
  });

  console.log('✅ Organization created:', org.id);

  // Create admin user
  const adminPassword = await hashPassword('Admin@123456');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      organizationId: org.id,
    },
  });

  console.log('✅ Admin user created:', admin.id);

  // Create manager user
  const managerPassword = await hashPassword('Manager@123456');
  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      password: managerPassword,
      firstName: 'Manager',
      lastName: 'User',
      role: 'MANAGER',
      organizationId: org.id,
    },
  });

  console.log('✅ Manager user created:', manager.id);

  // Create member users
  const member1Password = await hashPassword('Member1@123456');
  const member1 = await prisma.user.upsert({
    where: { email: 'member1@example.com' },
    update: {},
    create: {
      email: 'member1@example.com',
      password: member1Password,
      firstName: 'Member',
      lastName: 'One',
      role: 'MEMBER',
      organizationId: org.id,
    },
  });

  console.log('✅ Member 1 user created:', member1.id);

  const member2Password = await hashPassword('Member2@123456');
  const member2 = await prisma.user.upsert({
    where: { email: 'member2@example.com' },
    update: {},
    create: {
      email: 'member2@example.com',
      password: member2Password,
      firstName: 'Member',
      lastName: 'Two',
      role: 'MEMBER',
      organizationId: org.id,
    },
  });

  console.log('✅ Member 2 user created:', member2.id);

  // Create sample tasks
  const task1 = await prisma.task.upsert({
    where: {
      id: 'task-1',
    },
    update: {},
    create: {
      id: 'task-1',
      title: 'Setup project infrastructure',
      description: 'Initialize the project structure and set up build configuration',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      organizationId: org.id,
      assigneeId: member1.id,
      createdById: manager.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  console.log('✅ Task 1 created:', task1.id);

  const task2 = await prisma.task.upsert({
    where: {
      id: 'task-2',
    },
    update: {},
    create: {
      id: 'task-2',
      title: 'Implement authentication',
      description: 'Implement JWT-based authentication with refresh tokens',
      priority: 'HIGH',
      status: 'TODO',
      organizationId: org.id,
      assigneeId: member2.id,
      createdById: manager.id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    },
  });

  console.log('✅ Task 2 created:', task2.id);

  const task3 = await prisma.task.upsert({
    where: {
      id: 'task-3',
    },
    update: {},
    create: {
      id: 'task-3',
      title: 'Write API documentation',
      description: 'Document all API endpoints with examples',
      priority: 'MEDIUM',
      status: 'TODO',
      organizationId: org.id,
      assigneeId: member1.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
  });

  console.log('✅ Task 3 created:', task3.id);

  console.log('✨ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
