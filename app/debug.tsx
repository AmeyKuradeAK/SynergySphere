import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '~/contexts/AuthProvider';
import { ProjectSeedingService } from '~/services/projectSeeding';
import { FirestoreService } from '~/services/firestore';

export default function Debug() {
  const { user } = useAuth();

  const handleSeedProjects = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to seed projects');
      return;
    }

    try {
      await ProjectSeedingService.seedUserProjects(
        user.id,
        user.email,
        user.name
      );
      Alert.alert('Success', '3 demo projects have been created successfully!');
    } catch (error) {
      console.error('Seeding error:', error);
      Alert.alert(
        'Error',
        'Failed to seed projects. Check console for details.'
      );
    }
  };

  const handleClearProjects = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    Alert.alert(
      'Clear Projects',
      'This will delete ALL your projects. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real app, you'd have a method to delete user projects
              Alert.alert('Info', 'Project deletion not implemented in demo');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear projects');
            }
          },
        },
      ]
    );
  };

  const debugActions = [
    {
      title: 'Seed Demo Projects',
      description: 'Create 3 demo projects with tasks and discussions',
      icon: 'add-circle',
      color: '#10B981',
      action: handleSeedProjects,
    },
    {
      title: 'Clear All Projects',
      description: 'Delete all projects (use with caution)',
      icon: 'trash',
      color: '#EF4444',
      action: handleClearProjects,
    },
    {
      title: 'Check User Info',
      description: 'Display current user information',
      icon: 'person',
      color: '#3B82F6',
      action: () => {
        Alert.alert(
          'User Info',
          `ID: ${user?.id}\nName: ${user?.name}\nEmail: ${user?.email}\nCreated: ${user?.createdAt?.toLocaleString()}`
        );
      },
    },
    {
      title: 'Test Firestore Connection',
      description: 'Test if Firestore is working properly',
      icon: 'cloud',
      color: '#8B5CF6',
      action: async () => {
        try {
          if (user) {
            const projects = await FirestoreService.getUserProjects(user.id);
            Alert.alert(
              'Firestore Test',
              `Found ${projects.length} projects for your account`
            );
          }
        } catch (error) {
          Alert.alert(
            'Firestore Error',
            'Connection failed. Check your Firestore rules.'
          );
        }
      },
    },
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
            <Text className="text-lg font-semibold text-gray-900">
              Debug Tools
            </Text>
            <View className="w-10" />
          </View>
        </View>

        {/* Warning */}
        <View className="mx-6 mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <View className="flex-row items-center">
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text className="text-yellow-800 font-medium ml-2">
              Development Tools
            </Text>
          </View>
          <Text className="text-yellow-700 text-sm mt-1">
            These tools are for development and testing purposes only.
          </Text>
        </View>

        {/* User Info */}
        {user && (
          <View className="mx-6 mt-6 bg-white rounded-lg border border-gray-100 p-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Current User
            </Text>
            <View className="space-y-2">
              <View className="flex-row">
                <Text className="text-sm text-gray-600 w-16">ID:</Text>
                <Text className="text-sm text-gray-900 flex-1">{user.id}</Text>
              </View>
              <View className="flex-row">
                <Text className="text-sm text-gray-600 w-16">Name:</Text>
                <Text className="text-sm text-gray-900 flex-1">
                  {user.name}
                </Text>
              </View>
              <View className="flex-row">
                <Text className="text-sm text-gray-600 w-16">Email:</Text>
                <Text className="text-sm text-gray-900 flex-1">
                  {user.email}
                </Text>
              </View>
              <View className="flex-row">
                <Text className="text-sm text-gray-600 w-16">Joined:</Text>
                <Text className="text-sm text-gray-900 flex-1">
                  {user.createdAt?.toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Debug Actions */}
        <View className="mx-6 mt-6 mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Debug Actions
          </Text>
          <View className="space-y-3">
            {debugActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                className="bg-white rounded-lg p-4 border border-gray-100 flex-row items-center"
                onPress={action.action}
              >
                <View
                  className="w-12 h-12 rounded-lg items-center justify-center mr-4"
                  style={{ backgroundColor: action.color + '15' }}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color={action.color}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900">
                    {action.title}
                  </Text>
                  <Text className="text-sm text-gray-600 mt-1">
                    {action.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
