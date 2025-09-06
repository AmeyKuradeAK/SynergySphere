import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '~/contexts/AuthProvider';

export default function Profile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Settings states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    // In a real app, you'd update the user in Firestore
    Alert.alert('Success', 'Profile updated successfully!');
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/(auth)/login');
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  const statsData = [
    {
      label: 'Projects Created',
      value: '3',
      icon: 'briefcase',
      color: '#3B82F6',
    },
    {
      label: 'Tasks Completed',
      value: '12',
      icon: 'checkmark-circle',
      color: '#10B981',
    },
    { label: 'Team Members', value: '8', icon: 'people', color: '#F59E0B' },
    { label: 'Days Active', value: '15', icon: 'calendar', color: '#8B5CF6' },
  ];

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
            <Text className="text-lg font-semibold text-gray-900">Profile</Text>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons
                name={isEditing ? 'close' : 'create'}
                size={20}
                color="#3B82F6"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Header */}
        <View className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-8">
          <View className="items-center">
            <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4 shadow-lg">
              <Text className="text-blue-600 font-bold text-3xl">
                {user?.name?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  'U'}
              </Text>
            </View>
            <Text className="text-white font-bold text-xl mb-1">
              {user?.name || 'User'}
            </Text>
            <Text className="text-blue-100 text-sm mb-2">{user?.email}</Text>
            <View className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-medium">
                Team Leader
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="px-6 py-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Your Activity
          </Text>
          <View className="flex-row flex-wrap -mx-2">
            {statsData.map((stat, index) => (
              <View key={index} className="w-1/2 px-2 mb-4">
                <View className="bg-white rounded-lg p-4 border border-gray-100">
                  <View className="flex-row items-center mb-2">
                    <View
                      className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                      style={{ backgroundColor: stat.color + '15' }}
                    >
                      <Ionicons
                        name={stat.icon as any}
                        size={16}
                        color={stat.color}
                      />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-600">{stat.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Profile Information */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Profile Information
          </Text>
          <View className="bg-white rounded-lg border border-gray-100">
            {/* Name Field */}
            <View className="p-4 border-b border-gray-100">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Full Name
              </Text>
              {isEditing ? (
                <TextInput
                  value={name}
                  onChangeText={setName}
                  className="text-base text-gray-900 border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter your full name"
                />
              ) : (
                <Text className="text-base text-gray-900">
                  {user?.name || 'Not set'}
                </Text>
              )}
            </View>

            {/* Email Field */}
            <View className="p-4 border-b border-gray-100">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email Address
              </Text>
              <Text className="text-base text-gray-900">{user?.email}</Text>
              <Text className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </Text>
            </View>

            {/* Member Since */}
            <View className="p-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Member Since
              </Text>
              <Text className="text-base text-gray-900">
                {user?.createdAt?.toLocaleDateString() || 'Recently joined'}
              </Text>
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity
              onPress={handleSave}
              className="bg-blue-600 py-3 rounded-lg items-center mt-4"
            >
              <Text className="text-white font-semibold">Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notification Settings */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Notification Settings
          </Text>
          <View className="bg-white rounded-lg border border-gray-100">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Email Notifications
                </Text>
                <Text className="text-sm text-gray-600">
                  Receive updates via email
                </Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={emailNotifications ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Push Notifications
                </Text>
                <Text className="text-sm text-gray-600">
                  Get notified on your device
                </Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={pushNotifications ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Task Reminders
                </Text>
                <Text className="text-sm text-gray-600">
                  Reminders for due tasks
                </Text>
              </View>
              <Switch
                value={taskReminders}
                onValueChange={setTaskReminders}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={taskReminders ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Project Updates
                </Text>
                <Text className="text-sm text-gray-600">
                  Updates on project progress
                </Text>
              </View>
              <Switch
                value={projectUpdates}
                onValueChange={setProjectUpdates}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={projectUpdates ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </Text>
          <View className="space-y-3">
            <TouchableOpacity className="bg-white rounded-lg p-4 border border-gray-100 flex-row items-center">
              <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mr-4">
                <Ionicons name="download" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Export Data
                </Text>
                <Text className="text-sm text-gray-600">
                  Download your project data
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity className="bg-white rounded-lg p-4 border border-gray-100 flex-row items-center">
              <View className="w-10 h-10 bg-green-100 rounded-lg items-center justify-center mr-4">
                <Ionicons name="share" size={20} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Invite Team Members
                </Text>
                <Text className="text-sm text-gray-600">Grow your team</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity className="bg-white rounded-lg p-4 border border-gray-100 flex-row items-center">
              <View className="w-10 h-10 bg-purple-100 rounded-lg items-center justify-center mr-4">
                <Ionicons name="help-circle" size={20} color="#8B5CF6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  Help & Support
                </Text>
                <Text className="text-sm text-gray-600">
                  Get help when you need it
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Account
          </Text>
          <View className="bg-white rounded-lg border border-red-200">
            <TouchableOpacity
              onPress={handleLogout}
              className="p-4 flex-row items-center"
            >
              <View className="w-10 h-10 bg-red-100 rounded-lg items-center justify-center mr-4">
                <Ionicons name="log-out" size={20} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-red-600">
                  Sign Out
                </Text>
                <Text className="text-sm text-gray-600">
                  Sign out of your account
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
