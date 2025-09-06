import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '~/contexts/AuthProvider';
import { FirestoreService } from '~/services/firestore';

export default function CreateProjectModal() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [teamEmails, setTeamEmails] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateProject = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Project name is required');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a project');
      return;
    }

    setIsLoading(true);
    try {
      // Parse team member emails
      const memberEmails = teamEmails
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      // Create project
      const projectId = await FirestoreService.createProject({
        name: name.trim(),
        description: description.trim(),
        ownerId: user.id,
        members: [
          {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: 'owner' as const,
            joinedAt: new Date(),
          },
          ...memberEmails.map((email) => ({
            userId: '', // Will be filled when they join
            email,
            name: '',
            role: 'member' as const,
            joinedAt: new Date(),
          })),
        ],
        isArchived: false,
        color: '#3B82F6', // Blue color
      });

      Alert.alert('Success', 'Project created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            router.back();
            router.push(`/project/${projectId}`);
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Error', 'Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 py-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900">New Project</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="close" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter project name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              editable={!isLoading}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your project goals and objectives"
              multiline
              numberOfLines={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              textAlignVertical="top"
              editable={!isLoading}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Team Members (Optional)
            </Text>
            <TextInput
              value={teamEmails}
              onChangeText={setTeamEmails}
              placeholder="Enter email addresses separated by commas"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isLoading}
            />
            <Text className="text-xs text-gray-500 mt-1">
              Example: john@company.com, sarah@company.com
            </Text>
          </View>

          <View className="bg-blue-50 p-4 rounded-lg">
            <Text className="text-sm font-medium text-blue-900 mb-2">
              📋 What happens next?
            </Text>
            <Text className="text-sm text-blue-800">
              • You&apos;ll be the project owner with full permissions{'\n'}•
              Team members will be invited to collaborate{'\n'}• You can start
              creating tasks and discussions{'\n'}• Track progress with built-in
              analytics
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleCreateProject}
            disabled={isLoading || !name.trim()}
            className={`py-4 rounded-lg items-center mt-6 ${
              isLoading || !name.trim() ? 'bg-gray-300' : 'bg-blue-600'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Create Project
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
