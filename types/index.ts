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
  // Enterprise features
  imageUrl?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  department?: string;
  budget?: number;
  deadline?: Date;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  progress: number; // 0-100
}

export interface ProjectMember {
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  creatorId: string;
  creatorName?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  // Enterprise features
  estimatedHours?: number;
  actualHours?: number;
  blockers?: string[];
  dependencies?: string[]; // Task IDs this task depends on
  attachments?: string[];
  comments?: TaskComment[];
  tags?: string[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Discussion {
  id: string;
  projectId: string;
  title: string;
  content: string;
  authorId: string;
  authorName?: string;
  createdAt: Date;
  updatedAt: Date;
  replies: Reply[];
  tags?: string[];
  isPinned?: boolean;
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

// Chat types
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  content: string;
  type: 'text' | 'image' | 'file';
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Chat {
  id: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  lastMessageAt: Date;
  isGroup: boolean;
  name?: string; // For group chats
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatParticipant {
  userId: string;
  email: string;
  name: string;
  joinedAt: Date;
  isActive: boolean;
}
