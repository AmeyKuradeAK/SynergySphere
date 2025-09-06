export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: ProjectMember[];
  createdAt: Date;
  updatedAt: Date;
  color?: string;
  isArchived: boolean;
}

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId?: string;
  creatorId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Discussion {
  id: string;
  projectId: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  replies: Reply[];
}

export interface Reply {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date;
  likes: number;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | 'task_assigned'
    | 'task_completed'
    | 'project_invite'
    | 'discussion_reply';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  projectId?: string;
  taskId?: string;
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
}

// Auth types
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
