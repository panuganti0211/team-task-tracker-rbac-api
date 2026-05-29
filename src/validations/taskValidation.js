import Joi from 'joi';
import { TASK_STATUSES, TASK_PRIORITIES, TASK_STATUS_TRANSITIONS } from '../utils/constants.js';

export const createTaskSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 3 characters',
      'any.required': 'Title is required',
    }),
  description: Joi.string()
    .max(2000)
    .optional()
    .allow(null),
  priority: Joi.string()
    .valid(...Object.values(TASK_PRIORITIES))
    .default(TASK_PRIORITIES.MEDIUM)
    .messages({
      'any.only': `Priority must be one of: ${Object.values(TASK_PRIORITIES).join(', ')}`,
    }),
  dueDate: Joi.date()
    .min('now')
    .optional()
    .allow(null)
    .messages({
      'date.min': 'Due date must be in the future',
    }),
  assigneeId: Joi.string()
    .optional()
    .allow(null),
});

export const updateTaskSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .optional(),
  description: Joi.string()
    .max(2000)
    .optional()
    .allow(null),
  priority: Joi.string()
    .valid(...Object.values(TASK_PRIORITIES))
    .optional()
    .messages({
      'any.only': `Priority must be one of: ${Object.values(TASK_PRIORITIES).join(', ')}`,
    }),
  status: Joi.string()
    .valid(...Object.values(TASK_STATUSES))
    .optional()
    .messages({
      'any.only': `Status must be one of: ${Object.values(TASK_STATUSES).join(', ')}`,
    }),
  dueDate: Joi.date()
    .min('now')
    .optional()
    .allow(null)
    .messages({
      'date.min': 'Due date must be in the future',
      'date.base': 'Due date must be a valid date',
    }),
  assigneeId: Joi.string()
    .optional()
    .allow(null),
});

export const taskStatusTransitionSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(TASK_STATUSES))
    .required()
    .messages({
      'any.only': `Status must be one of: ${Object.values(TASK_STATUSES).join(', ')}`,
      'any.required': 'Status is required',
    }),
});

export const listTasksSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Page must be greater than 0',
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be greater than 0',
      'number.max': 'Limit cannot exceed 100',
    }),
  status: Joi.string()
    .valid(...Object.values(TASK_STATUSES))
    .optional()
    .messages({
      'any.only': `Status must be one of: ${Object.values(TASK_STATUSES).join(', ')}`,
    }),
  priority: Joi.string()
    .valid(...Object.values(TASK_PRIORITIES))
    .optional()
    .messages({
      'any.only': `Priority must be one of: ${Object.values(TASK_PRIORITIES).join(', ')}`,
    }),
  assigneeId: Joi.string()
    .optional(),
  sortBy: Joi.string()
    .valid('dueDate', 'createdAt', 'priority')
    .default('createdAt')
    .messages({
      'any.only': 'sortBy must be one of: dueDate, createdAt, priority',
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'sortOrder must be one of: asc, desc',
    }),
});
