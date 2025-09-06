import { create } from 'zustand';
import {
  User,
  Project,
  Task,
  Discussion,
  Notification,
  AuthUser,
} from '~/types';

// Auth Store
interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

// User Profile Store
interface UserState {
  profile: User | null;
  setProfile: (profile: User | null) => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),
}));

// Projects Store
interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  setCurrentProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  setProjects: (projects) => set({ projects }),
  addProject: (project) =>
    set((state) => ({
      projects: [...state.projects, project],
    })),
  updateProject: (projectId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, ...updates } : p
      ),
      currentProject:
        state.currentProject?.id === projectId
          ? { ...state.currentProject, ...updates }
          : state.currentProject,
    })),
  setCurrentProject: (currentProject) => set({ currentProject }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// Tasks Store
interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  setLoading: (loading: boolean) => void;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByStatus: (status: Task['status']) => Task[];
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: false,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    })),
  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  getTasksByProject: (projectId) =>
    get().tasks.filter((task) => task.projectId === projectId),
  getTasksByStatus: (status) =>
    get().tasks.filter((task) => task.status === status),
}));

// Discussions Store
interface DiscussionsState {
  discussions: Discussion[];
  isLoading: boolean;
  setDiscussions: (discussions: Discussion[]) => void;
  addDiscussion: (discussion: Discussion) => void;
  updateDiscussion: (
    discussionId: string,
    updates: Partial<Discussion>
  ) => void;
  setLoading: (loading: boolean) => void;
}

export const useDiscussionsStore = create<DiscussionsState>((set) => ({
  discussions: [],
  isLoading: false,
  setDiscussions: (discussions) => set({ discussions }),
  addDiscussion: (discussion) =>
    set((state) => ({
      discussions: [...state.discussions, discussion],
    })),
  updateDiscussion: (discussionId, updates) =>
    set((state) => ({
      discussions: state.discussions.map((d) =>
        d.id === discussionId ? { ...d, ...updates } : d
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}));

// Notifications Store
interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  updateUnreadCount: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    set({ notifications, unreadCount });
  },
  addNotification: (notification) =>
    set((state) => {
      const notifications = [notification, ...state.notifications];
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      return { notifications, unreadCount };
    }),
  markAsRead: (notificationId) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      return { notifications, unreadCount };
    }),
  markAllAsRead: () =>
    set((state) => {
      const notifications = state.notifications.map((n) => ({
        ...n,
        isRead: true,
      }));
      return { notifications, unreadCount: 0 };
    }),
  updateUnreadCount: () => {
    const unreadCount = get().notifications.filter((n) => !n.isRead).length;
    set({ unreadCount });
  },
}));
