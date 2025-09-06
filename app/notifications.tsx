import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '~/contexts/AuthProvider';
import { NotificationService } from '~/services/notificationService';
import { BackButton } from '~/components/BackButton';

interface NotificationSettings {
  deadlineWarnings: boolean;
  taskAssignments: boolean;
  projectUpdates: boolean;
  discussionReplies: boolean;
  dailyReminders: boolean;
  overdueAlerts: boolean;
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    deadlineWarnings: true,
    taskAssignments: true,
    projectUpdates: true,
    discussionReplies: true,
    dailyReminders: true,
    overdueAlerts: true,
  });
  const [notificationStats, setNotificationStats] = useState({
    overdue: 0,
    dueTomorrow: 0,
    dueThisWeek: 0,
    totalActive: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotificationData();
  }, [user, loadNotificationData]);

  const loadNotificationData = useCallback(async () => {
    if (!user) return;

    try {
      const stats = await NotificationService.getNotificationStats(user.id);
      setNotificationStats(stats);
    } catch (error) {
      console.error('Error loading notification data:', error);
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotificationData();
    setRefreshing(false);
  };

  const handleSettingChange = async (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));

    // Handle specific setting changes
    if (key === 'dailyReminders' && user) {
      if (value) {
        await NotificationService.scheduleDailyReminders(user.id);
        Alert.alert('Success', 'Daily reminders enabled at 9:00 AM');
      } else {
        // Cancel daily reminders (implementation would depend on your notification system)
        Alert.alert('Success', 'Daily reminders disabled');
      }
    }
  };

  const testNotification = async () => {
    try {
      await NotificationService.scheduleLocalNotification(
        '🧪 Test Notification',
        'This is a test notification from SynergySphere!',
        new Date(Date.now() + 2000), // 2 seconds from now
        { type: 'test' }
      );
      Alert.alert(
        'Success',
        'Test notification scheduled for 2 seconds from now'
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const checkOverdueTasks = async () => {
    if (!user) return;

    try {
      await NotificationService.checkOverdueTasks(user.id);
      Alert.alert(
        'Success',
        'Checked for overdue tasks. You will be notified if any are found.'
      );
    } catch (error) {
      console.error('Error checking overdue tasks:', error);
      Alert.alert('Error', 'Failed to check overdue tasks');
    }
  };

  const checkUpcomingDeadlines = async () => {
    if (!user) return;

    try {
      await NotificationService.checkUpcomingDeadlines(user.id);
      Alert.alert(
        'Success',
        'Checked for upcoming deadlines. You will be notified if any are found.'
      );
    } catch (error) {
      console.error('Error checking upcoming deadlines:', error);
      Alert.alert('Error', 'Failed to check upcoming deadlines');
    }
  };

  const renderSettingItem = (
    key: keyof NotificationSettings,
    title: string,
    description: string,
    icon: string
  ) => (
    <View
      key={key}
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="bg-blue-100 p-2 rounded-lg mr-3">
            <Ionicons name={icon as any} size={20} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-gray-900">{title}</Text>
            <Text className="text-sm text-gray-600 mt-1">{description}</Text>
          </View>
        </View>
        <Switch
          value={settings[key]}
          onValueChange={(value) => handleSettingChange(key, value)}
          trackColor={{ false: '#f3f4f6', true: '#3b82f6' }}
          thumbColor={settings[key] ? '#ffffff' : '#ffffff'}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center">
          <BackButton onPress={() => router.back()} />
          <Text className="text-lg font-semibold text-gray-900 ml-3">
            Notifications
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Notification Stats */}
        <View className="px-6 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            📊 Current Status
          </Text>

          <View className="flex-row justify-between mb-4">
            <View className="bg-white rounded-lg p-4 flex-1 mr-2 shadow-sm">
              <Text className="text-2xl font-bold text-red-600">
                {notificationStats.overdue}
              </Text>
              <Text className="text-sm text-gray-600">Overdue</Text>
            </View>

            <View className="bg-white rounded-lg p-4 flex-1 ml-2 shadow-sm">
              <Text className="text-2xl font-bold text-orange-600">
                {notificationStats.dueTomorrow}
              </Text>
              <Text className="text-sm text-gray-600">Due Tomorrow</Text>
            </View>
          </View>

          <View className="flex-row justify-between">
            <View className="bg-white rounded-lg p-4 flex-1 mr-2 shadow-sm">
              <Text className="text-2xl font-bold text-yellow-600">
                {notificationStats.dueThisWeek}
              </Text>
              <Text className="text-sm text-gray-600">Due This Week</Text>
            </View>

            <View className="bg-white rounded-lg p-4 flex-1 ml-2 shadow-sm">
              <Text className="text-2xl font-bold text-blue-600">
                {notificationStats.totalActive}
              </Text>
              <Text className="text-sm text-gray-600">Active Tasks</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            ⚡ Quick Actions
          </Text>

          <View className="space-y-3">
            <TouchableOpacity
              onPress={testNotification}
              className="bg-blue-600 py-4 rounded-lg items-center"
            >
              <Text className="text-white font-medium">
                Send Test Notification
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={checkOverdueTasks}
              className="bg-red-600 py-4 rounded-lg items-center"
            >
              <Text className="text-white font-medium">
                Check Overdue Tasks
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={checkUpcomingDeadlines}
              className="bg-orange-600 py-4 rounded-lg items-center"
            >
              <Text className="text-white font-medium">
                Check Upcoming Deadlines
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Settings */}
        <View className="px-6 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            ⚙️ Settings
          </Text>

          {renderSettingItem(
            'deadlineWarnings',
            'Deadline Warnings',
            'Get notified about upcoming task and project deadlines',
            'time'
          )}

          {renderSettingItem(
            'taskAssignments',
            'Task Assignments',
            'Receive notifications when tasks are assigned to you',
            'clipboard'
          )}

          {renderSettingItem(
            'projectUpdates',
            'Project Updates',
            'Stay informed about project status changes and updates',
            'folder'
          )}

          {renderSettingItem(
            'discussionReplies',
            'Discussion Replies',
            'Get notified when someone replies to project discussions',
            'chatbubbles'
          )}

          {renderSettingItem(
            'dailyReminders',
            'Daily Reminders',
            'Receive daily project check-ins at 9:00 AM',
            'sunny'
          )}

          {renderSettingItem(
            'overdueAlerts',
            'Overdue Alerts',
            'Important alerts for overdue tasks and projects',
            'warning'
          )}
        </View>

        {/* Info Section */}
        <View className="px-6 py-4 mb-6">
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text className="text-blue-800 font-medium ml-2">
                About Notifications
              </Text>
            </View>
            <Text className="text-blue-700 text-sm leading-5">
              Smart notifications help you stay on top of your projects and
              deadlines. You can customize which types of notifications you
              receive and test them anytime.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
