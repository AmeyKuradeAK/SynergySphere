import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function Settings() {
  // App Settings
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  // Privacy Settings
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [activityTracking, setActivityTracking] = useState(true);
  const [dataAnalytics, setDataAnalytics] = useState(false);

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [teamMentions, setTeamMentions] = useState(true);

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Reset all settings to default
            setDarkMode(false);
            setAutoSync(true);
            setOfflineMode(false);
            setProfileVisibility(true);
            setActivityTracking(true);
            setDataAnalytics(false);
            setEmailNotifications(true);
            setPushNotifications(true);
            setTaskReminders(true);
            setProjectUpdates(true);
            setTeamMentions(true);
            Alert.alert('Success', 'Settings have been reset to default');
          },
        },
      ]
    );
  };

  const SettingItem = ({
    title,
    description,
    value,
    onValueChange,
    icon,
    iconColor = '#6B7280',
  }: {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    icon: string;
    iconColor?: string;
  }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
      <View className="flex-row items-center flex-1">
        <View
          className="w-10 h-10 rounded-lg items-center justify-center mr-4"
          style={{ backgroundColor: iconColor + '15' }}
        >
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-900">{title}</Text>
          <Text className="text-sm text-gray-600">{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  const ActionItem = ({
    title,
    description,
    icon,
    iconColor = '#6B7280',
    onPress,
    danger = false,
  }: {
    title: string;
    description: string;
    icon: string;
    iconColor?: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-gray-100"
      onPress={onPress}
    >
      <View
        className="w-10 h-10 rounded-lg items-center justify-center mr-4"
        style={{ backgroundColor: iconColor + '15' }}
      >
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text
          className={`text-base font-medium ${danger ? 'text-red-600' : 'text-gray-900'}`}
        >
          {title}
        </Text>
        <Text className="text-sm text-gray-600">{description}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={danger ? '#EF4444' : '#D1D5DB'}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">
              Settings
            </Text>
            <View className="w-10" />
          </View>
        </View>

        {/* App Settings */}
        <View className="mt-6 px-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            App Settings
          </Text>
          <View className="bg-white rounded-lg border border-gray-100">
            <SettingItem
              title="Dark Mode"
              description="Switch to dark theme"
              value={darkMode}
              onValueChange={setDarkMode}
              icon="moon"
              iconColor="#6366F1"
            />
            <SettingItem
              title="Auto Sync"
              description="Automatically sync data"
              value={autoSync}
              onValueChange={setAutoSync}
              icon="sync"
              iconColor="#10B981"
            />
            <SettingItem
              title="Offline Mode"
              description="Work without internet connection"
              value={offlineMode}
              onValueChange={setOfflineMode}
              icon="cloud-offline"
              iconColor="#F59E0B"
            />
          </View>
        </View>

        {/* Notification Settings */}
        <View className="mt-6 px-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Notifications
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              className="bg-blue-600 px-3 py-1 rounded-lg"
            >
              <Text className="text-white text-sm font-medium">Manage</Text>
            </TouchableOpacity>
          </View>
          <View className="bg-white rounded-lg border border-gray-100">
            <SettingItem
              title="Email Notifications"
              description="Receive updates via email"
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              icon="mail"
              iconColor="#3B82F6"
            />
            <SettingItem
              title="Push Notifications"
              description="Get notified on your device"
              value={pushNotifications}
              onValueChange={setPushNotifications}
              icon="notifications"
              iconColor="#8B5CF6"
            />
            <SettingItem
              title="Task Reminders"
              description="Reminders for due tasks"
              value={taskReminders}
              onValueChange={setTaskReminders}
              icon="alarm"
              iconColor="#EF4444"
            />
            <SettingItem
              title="Project Updates"
              description="Updates on project progress"
              value={projectUpdates}
              onValueChange={setProjectUpdates}
              icon="briefcase"
              iconColor="#10B981"
            />
            <SettingItem
              title="Team Mentions"
              description="When someone mentions you"
              value={teamMentions}
              onValueChange={setTeamMentions}
              icon="at"
              iconColor="#F59E0B"
            />
          </View>
        </View>

        {/* Privacy Settings */}
        <View className="mt-6 px-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Privacy & Security
          </Text>
          <View className="bg-white rounded-lg border border-gray-100">
            <SettingItem
              title="Profile Visibility"
              description="Make your profile visible to team"
              value={profileVisibility}
              onValueChange={setProfileVisibility}
              icon="eye"
              iconColor="#3B82F6"
            />
            <SettingItem
              title="Activity Tracking"
              description="Track your app activity"
              value={activityTracking}
              onValueChange={setActivityTracking}
              icon="analytics"
              iconColor="#10B981"
            />
            <SettingItem
              title="Data Analytics"
              description="Help improve the app"
              value={dataAnalytics}
              onValueChange={setDataAnalytics}
              icon="bar-chart"
              iconColor="#8B5CF6"
            />
          </View>
        </View>

        {/* Support & About */}
        <View className="mt-6 px-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Support & About
          </Text>
          <View className="bg-white rounded-lg border border-gray-100">
            <ActionItem
              title="Help Center"
              description="Get help and support"
              icon="help-circle"
              iconColor="#3B82F6"
              onPress={() =>
                Alert.alert(
                  'Help Center',
                  'Visit help.synergysphere.com for support'
                )
              }
            />
            <ActionItem
              title="Contact Support"
              description="Reach out to our team"
              icon="mail"
              iconColor="#10B981"
              onPress={() =>
                Alert.alert(
                  'Contact Support',
                  'Email: support@synergysphere.com\nPhone: +1 (555) 123-4567'
                )
              }
            />
            <ActionItem
              title="Privacy Policy"
              description="Read our privacy policy"
              icon="shield-checkmark"
              iconColor="#8B5CF6"
              onPress={() =>
                Alert.alert(
                  'Privacy Policy',
                  'Visit synergysphere.com/privacy for details'
                )
              }
            />
            <ActionItem
              title="Terms of Service"
              description="Review terms and conditions"
              icon="document-text"
              iconColor="#F59E0B"
              onPress={() =>
                Alert.alert(
                  'Terms of Service',
                  'Visit synergysphere.com/terms for details'
                )
              }
            />
            <ActionItem
              title="About SynergySphere"
              description="Version 1.0.0 - Enterprise Edition"
              icon="information-circle"
              iconColor="#6B7280"
              onPress={() =>
                Alert.alert(
                  'About',
                  'SynergySphere v1.0.0\nEnterprise Team Collaboration Platform\n\nBuilt with React Native & Expo\n© 2024 SynergySphere Inc.'
                )
              }
            />
          </View>
        </View>

        {/* Advanced Settings */}
        <View className="mt-6 px-6 mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Advanced
          </Text>
          <View className="bg-white rounded-lg border border-gray-100">
            <ActionItem
              title="Clear Cache"
              description="Clear app cache and temporary files"
              icon="trash"
              iconColor="#F59E0B"
              onPress={() =>
                Alert.alert('Clear Cache', 'Cache cleared successfully!')
              }
            />
            <ActionItem
              title="Reset Settings"
              description="Reset all settings to default"
              icon="refresh"
              iconColor="#EF4444"
              onPress={handleResetSettings}
              danger={true}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
