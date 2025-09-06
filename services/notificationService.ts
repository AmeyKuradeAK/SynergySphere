import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { FirestoreService } from './firestore';
import { Task } from '~/types';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  id: string;
  userId: string;
  type:
    | 'deadline_warning'
    | 'task_assigned'
    | 'project_update'
    | 'overdue_alert'
    | 'discussion_reply';
  title: string;
  body: string;
  data?: any;
  scheduledFor?: Date;
  sent: boolean;
  createdAt: Date;
}

export class NotificationService {
  // Register for push notifications
  static async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: '8c4d8b2a-0b1c-4c1a-9b5a-2a3b4c5d6e7f', // Replace with your actual project ID
      });
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Schedule local notification
  static async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Date,
    data?: any
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger,
    });
  }

  // Cancel scheduled notification
  static async cancelNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Check for overdue tasks and send alerts
  static async checkOverdueTasks(userId: string) {
    try {
      const projects = await FirestoreService.getUserProjects(userId);
      const allTasks: Task[] = [];

      // Collect all tasks from all projects
      for (const project of projects) {
        const tasks = await FirestoreService.getProjectTasks(project.id);
        allTasks.push(...tasks);
      }

      const now = new Date();
      const overdueTasks = allTasks.filter((task) => {
        if (!task.dueDate || task.status === 'done') return false;
        const dueDate =
          task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
        return dueDate < now;
      });

      if (overdueTasks.length > 0) {
        await this.scheduleLocalNotification(
          '⚠️ Overdue Tasks Alert',
          `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} that need attention`,
          new Date(Date.now() + 1000), // Send immediately
          { type: 'overdue_alert', taskCount: overdueTasks.length }
        );
      }
    } catch (error) {
      console.error('Error checking overdue tasks:', error);
    }
  }

  // Check for upcoming deadlines (tasks due in next 24 hours)
  static async checkUpcomingDeadlines(userId: string) {
    try {
      const projects = await FirestoreService.getUserProjects(userId);
      const allTasks: Task[] = [];

      for (const project of projects) {
        const tasks = await FirestoreService.getProjectTasks(project.id);
        allTasks.push(...tasks);
      }

      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const upcomingTasks = allTasks.filter((task) => {
        if (!task.dueDate || task.status === 'done') return false;
        const dueDate =
          task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
        return dueDate > now && dueDate <= tomorrow;
      });

      if (upcomingTasks.length > 0) {
        await this.scheduleLocalNotification(
          '📅 Deadline Reminder',
          `You have ${upcomingTasks.length} task${upcomingTasks.length > 1 ? 's' : ''} due within 24 hours`,
          new Date(Date.now() + 1000),
          { type: 'deadline_warning', taskCount: upcomingTasks.length }
        );
      }
    } catch (error) {
      console.error('Error checking upcoming deadlines:', error);
    }
  }

  // Send task assignment notification
  static async notifyTaskAssignment(
    assigneeId: string,
    task: Task,
    projectName: string
  ) {
    try {
      await this.scheduleLocalNotification(
        '📋 New Task Assigned',
        `You've been assigned "${task.title}" in ${projectName}`,
        new Date(Date.now() + 1000),
        {
          type: 'task_assigned',
          taskId: task.id,
          projectName,
          priority: task.priority,
        }
      );
    } catch (error) {
      console.error('Error sending task assignment notification:', error);
    }
  }

  // Send project update notification
  static async notifyProjectUpdate(
    userId: string,
    projectName: string,
    updateType: string
  ) {
    try {
      let title = '📊 Project Update';
      let body = `${projectName} has been updated`;

      switch (updateType) {
        case 'completed':
          title = '🎉 Project Completed';
          body = `Congratulations! ${projectName} has been completed`;
          break;
        case 'deadline_changed':
          title = '📅 Deadline Changed';
          body = `The deadline for ${projectName} has been updated`;
          break;
        case 'status_changed':
          title = '📊 Status Update';
          body = `The status of ${projectName} has changed`;
          break;
      }

      await this.scheduleLocalNotification(
        title,
        body,
        new Date(Date.now() + 1000),
        { type: 'project_update', projectName, updateType }
      );
    } catch (error) {
      console.error('Error sending project update notification:', error);
    }
  }

  // Send discussion reply notification
  static async notifyDiscussionReply(
    userId: string,
    discussionTitle: string,
    projectName: string,
    authorName: string
  ) {
    try {
      await this.scheduleLocalNotification(
        '💬 New Discussion Reply',
        `${authorName} replied to "${discussionTitle}" in ${projectName}`,
        new Date(Date.now() + 1000),
        {
          type: 'discussion_reply',
          discussionTitle,
          projectName,
          authorName,
        }
      );
    } catch (error) {
      console.error('Error sending discussion reply notification:', error);
    }
  }

  // Schedule daily reminder check
  static async scheduleDailyReminders(userId: string) {
    try {
      // Cancel existing daily reminders
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.type === 'daily_reminder') {
          await Notifications.cancelScheduledNotificationAsync(
            notification.identifier
          );
        }
      }

      // Schedule new daily reminder for 9 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      await this.scheduleLocalNotification(
        '🌅 Daily Project Check',
        'Good morning! Check your project progress and upcoming deadlines',
        tomorrow,
        { type: 'daily_reminder', userId }
      );
    } catch (error) {
      console.error('Error scheduling daily reminders:', error);
    }
  }

  // Get notification statistics
  static async getNotificationStats(userId: string) {
    try {
      const projects = await FirestoreService.getUserProjects(userId);
      const allTasks: Task[] = [];

      for (const project of projects) {
        const tasks = await FirestoreService.getProjectTasks(project.id);
        allTasks.push(...tasks);
      }

      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const overdue = allTasks.filter((task) => {
        if (!task.dueDate || task.status === 'done') return false;
        const dueDate =
          task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
        return dueDate < now;
      }).length;

      const dueTomorrow = allTasks.filter((task) => {
        if (!task.dueDate || task.status === 'done') return false;
        const dueDate =
          task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
        return dueDate > now && dueDate <= tomorrow;
      }).length;

      const dueThisWeek = allTasks.filter((task) => {
        if (!task.dueDate || task.status === 'done') return false;
        const dueDate =
          task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
        return dueDate > tomorrow && dueDate <= nextWeek;
      }).length;

      return {
        overdue,
        dueTomorrow,
        dueThisWeek,
        totalActive: allTasks.filter((task) => task.status !== 'done').length,
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return { overdue: 0, dueTomorrow: 0, dueThisWeek: 0, totalActive: 0 };
    }
  }
}
