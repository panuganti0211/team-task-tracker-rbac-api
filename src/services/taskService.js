import { TASK_STATUS_TRANSITIONS } from '../utils/constants.js';
import { AuthorizationError, ValidationError } from '../utils/errors.js';
import { TaskRepository } from '../repositories/taskRepository.js';
import { AuthRepository } from '../repositories/authRepository.js';

export class TaskService {
  static validateStatusTransition(currentStatus, newStatus) {
    const allowedTransitions = TASK_STATUS_TRANSITIONS[currentStatus];
    if (!allowedTransitions.includes(newStatus)) {
      throw new ValidationError(
        `Cannot transition from ${currentStatus} to ${newStatus}. ` +
        `Allowed transitions: ${allowedTransitions.join(', ')}`
      );
    }
  }

  static async validateAssigneeOrganization(assigneeId, organizationId) {
    if (!assigneeId) {
      return;
    }

    const assignee = await AuthRepository.findUserById(assigneeId);
    if (!assignee || assignee.organizationId !== organizationId) {
      throw new ValidationError('Assignee must belong to the same organization');
    }
  }

  static async createTask(organizationId, createdById, data) {
    await this.validateAssigneeOrganization(data.assigneeId, organizationId);

    const taskData = {
      ...data,
      organizationId,
      createdById,
    };

    return TaskRepository.createTask(taskData);
  }

  static async getTask(taskId, organizationId, userRole, userId) {
    const task = await TaskRepository.findTaskById(taskId, organizationId);

    if (userRole === 'MEMBER' && task.assigneeId !== userId) {
      throw new AuthorizationError('You can only access tasks assigned to you');
    }

    return task;
  }

  static async updateTask(taskId, currentStatus, data, userRole, userId, organizationId) {
    const task = await TaskRepository.findTaskById(taskId, organizationId);

    if (userRole === 'MEMBER') {
      if (task.assigneeId !== userId) {
        throw new AuthorizationError('You can only update your own assigned tasks');
      }

      const updateFields = Object.keys(data).filter((field) => field !== 'status');
      if (updateFields.length > 0) {
        throw new AuthorizationError('Members can only update the status of their assigned tasks');
      }
    }

    if (data.assigneeId) {
      await this.validateAssigneeOrganization(data.assigneeId, organizationId);
    }

    if (data.status && data.status !== currentStatus) {
      this.validateStatusTransition(currentStatus, data.status);

      if (userRole === 'MEMBER' && task.assigneeId !== userId) {
        throw new ValidationError('You cannot change this task status');
      }
    }

    return TaskRepository.updateTask(taskId, organizationId, data);
  }

  static async deleteTask(taskId, organizationId) {
    return TaskRepository.deleteTask(taskId, organizationId);
  }

  static async listTasks(organizationId, filters = {}) {
    return TaskRepository.listTasks(organizationId, filters);
  }

  static async listTasksByAssignee(organizationId, assigneeId, filters = {}) {
    return TaskRepository.listTasksByAssignee(organizationId, assigneeId, filters);
  }
}
