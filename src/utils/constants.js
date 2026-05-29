export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  MEMBER: 'MEMBER',
};

export const TASK_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
};

export const TASK_STATUSES = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE',
  BLOCKED: 'BLOCKED',
};

// Task status transition map
export const TASK_STATUS_TRANSITIONS = {
  [TASK_STATUSES.TODO]: [TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.BLOCKED],
  [TASK_STATUSES.IN_PROGRESS]: [TASK_STATUSES.IN_REVIEW, TASK_STATUSES.BLOCKED],
  [TASK_STATUSES.IN_REVIEW]: [TASK_STATUSES.DONE, TASK_STATUSES.BLOCKED],
  [TASK_STATUSES.DONE]: [],
  [TASK_STATUSES.BLOCKED]: [TASK_STATUSES.TODO, TASK_STATUSES.IN_PROGRESS],
};

// Permissions mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'create_user',
    'read_user',
    'update_user',
    'delete_user',
    'create_task',
    'read_task',
    'update_task',
    'delete_task',
    'manage_organization',
  ],
  [USER_ROLES.MANAGER]: [
    'read_user',
    'create_task',
    'read_task',
    'update_task',
    'delete_task',
  ],
  [USER_ROLES.MEMBER]: [
    'read_task',
    'update_own_task',
  ],
};
