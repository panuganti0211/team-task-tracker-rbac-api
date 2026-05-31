import prisma from '../config/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import { getOffset } from '../utils/helpers.js';



const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
};


export class TaskRepository {



  static async createTask(data) {
    return prisma.task.create({
      data,
      include: {
        assignee:  {
    select: userSelect,
  },
        createdBy:  {
    select: userSelect,
  },
        organization: true,
      },
    });
  }

  static async findTaskById(id, organizationId) {
    const task = await prisma.task.findFirst({
      where: {
        id,
        organizationId,
      },
            include: {
              assignee:  {
    select: userSelect,
  },
              createdBy:  {
    select: userSelect,
  },
              organization: true,
            },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  static async updateTask(id, organizationId, data) {
    try {
      return await prisma.task.updateMany({
        where: { id, organizationId },
        data,
      }).then(async (result) => {
        if (result.count === 0) {
          throw new NotFoundError('Task not found');
        }
        return prisma.task.findFirst({
          where: { id, organizationId },
          include: {
            assignee:  {
    select: userSelect,
  },
            createdBy:  {
    select: userSelect,
  },
            organization: true,
          },
        });
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteTask(id, organizationId) {
    try {
      const result = await prisma.task.deleteMany({
        where: { id, organizationId },
      });
      if (result.count === 0) {
        throw new NotFoundError('Task not found');
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async listTasks(organizationId, filters = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assigneeId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where = {
      organizationId,
    };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: getOffset(page, limit),
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          assignee:  {
    select: userSelect,
  },
          createdBy:  {
    select: userSelect,
  },
          organization: true,
        },
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total };
  }

  static async listTasksByAssignee(organizationId, assigneeId, filters = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where = {
      organizationId,
      assigneeId,
    };

    if (status) {
      where.status = status;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip: getOffset(page, limit),
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          assignee:  {
    select: userSelect,
  },
          createdBy:  {
    select: userSelect,
  },
          organization: true,
        },
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total };
  }

  static async findTasksByOrganization(organizationId) {
    return prisma.task.findMany({
      where: { organizationId },
    });
  }
}
