import { asyncHandler, formatApiResponse, calculatePagination, buildCacheKey } from '../utils/helpers.js';
import { TaskService } from '../services/taskService.js';
import redisClient from '../config/redis.js';

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, assigneeId } = req.body;
  const organizationId = req.organizationId;
  const createdById = req.userId;

  const task = await TaskService.createTask(organizationId, createdById, {
    title,
    description,
    priority,
    dueDate: dueDate ? new Date(dueDate) : null,
    assigneeId,
  });

  await invalidateTaskCache(organizationId);

  res.status(201).json(
    formatApiResponse(201, 'Task created successfully', task)
  );
});

export const getTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const organizationId = req.organizationId;
  const userRole = req.user.role;
  const userId = req.userId;

  const task = await TaskService.getTask(taskId, organizationId, userRole, userId);

  res.status(200).json(
    formatApiResponse(200, 'Task fetched successfully', task)
  );
});

export const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, description, priority, status, dueDate, assigneeId } = req.body;
  const organizationId = req.organizationId;
  const userId = req.userId;
  const userRole = req.user.role;

  const task = await TaskService.getTask(taskId, organizationId, userRole, userId);
  const currentStatus = task.status;

  const updatePayload = {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(priority !== undefined && { priority }),
    ...(status !== undefined && { status }),
    ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    ...(assigneeId !== undefined && { assigneeId }),
  };

  const updatedTask = await TaskService.updateTask(
    taskId,
    currentStatus,
    updatePayload,
    userRole,
    userId,
    organizationId
  );

  await invalidateTaskCache(organizationId);

  res.status(200).json(
    formatApiResponse(200, 'Task updated successfully', updatedTask)
  );
});

export const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const organizationId = req.organizationId;

  await TaskService.deleteTask(taskId, organizationId);
  await invalidateTaskCache(organizationId);

  res.status(200).json(
    formatApiResponse(200, 'Task deleted successfully')
  );
});

export const listTasks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, priority, assigneeId, sortBy, sortOrder } = req.query;
  const organizationId = req.organizationId;
  const userRole = req.user.role;
  const userId = req.userId;

  const cacheKey = buildCacheKey(
    'tasks',
    organizationId,
    `page:${page}`,
    `limit:${limit}`,
    status,
    priority,
    assigneeId,
    sortBy,
    sortOrder
  );

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  const filters = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(assigneeId && { assigneeId }),
    ...(sortBy && { sortBy }),
    ...(sortOrder && { sortOrder }),
  };

  const tasksResult = userRole === 'MEMBER'
    ? await TaskService.listTasksByAssignee(organizationId, userId, filters)
    : await TaskService.listTasks(organizationId, filters);

  const pagination = calculatePagination(filters.page, filters.limit, tasksResult.total);

  const response = formatApiResponse(
    200,
    'Tasks fetched successfully',
    tasksResult.tasks,
    pagination
  );

  await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

  res.status(200).json(response);
});

async function invalidateTaskCache(organizationId) {
  const pattern = `tasks:${organizationId}:*`;
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
}
