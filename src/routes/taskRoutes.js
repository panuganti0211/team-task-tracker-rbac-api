import express from 'express';
import {
  createTask,
  getTask,
  updateTask,
  deleteTask,
  listTasks,
} from '../modules/tasks/taskController.js';
import { authenticate } from '../middleware/authentication.js';
import { authorize } from '../middleware/authorization.js';
import { createTaskSchema, updateTaskSchema, listTasksSchema } from '../validations/taskValidation.js';
import { asyncHandler } from '../utils/helpers.js';

const router = express.Router();

// Validation middleware
const validate = (schema) => asyncHandler(async (req, res, next) => {
  const dataToValidate = {
    ...req.body,
    ...req.query,
  };
  const { error, value } = schema.validate(dataToValidate, { abortEarly: false });
  if (error) {
    const messages = error.details.map(detail => detail.message);
    return res.status(400).json({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: messages[0],
      details: messages,
    });
  }
  Object.assign(req.body, value);
  Object.assign(req.query, value);
  next();
});

// All task routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *               dueDate:
 *                 type: string
 *               assigneeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post(
  '/',
  authorize(['ADMIN', 'MANAGER']),
  validate(createTaskSchema),
  createTask
);

/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task fetched successfully
 */
router.get('/:taskId', getTask);

/**
 * @swagger
 * /tasks/{taskId}:
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *               status:
 *                 type: string
 *               dueDate:
 *                 type: string
 *               assigneeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 */
router.put(
  '/:taskId',
  validate(updateTaskSchema),
  updateTask
);

/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 */
router.delete(
  '/:taskId',
  authorize(['ADMIN', 'MANAGER']),
  deleteTask
);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: List tasks with pagination and filtering
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [dueDate, createdAt, priority]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Tasks fetched successfully with pagination
 */
router.get(
  '/',
  validate(listTasksSchema),
  listTasks
);

export default router;
