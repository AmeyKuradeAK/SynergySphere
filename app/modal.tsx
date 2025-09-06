import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '~/contexts/AuthProvider';
import { useProjectsStore } from '~/store/store';
import { FirestoreService } from '~/services/firestore';
import { Project, ProjectMember } from '~/types';

export default function Modal() {
  const { user } = useAuth();
  const { addProject } = useProjectsStore();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a project');
      return;
    }

    setIsLoading(true);
    try {
      const now = new Date();
      const ownerMember: ProjectMember = {
        userId: user.uid,
        role: 'owner',
        joinedAt: now,
      };

      const projectData: Omit<Project, 'id'> = {
        name: projectName.trim(),
        description: projectDescription.trim(),
        ownerId: user.uid,
        members: [ownerMember],
        createdAt: now,
        updatedAt: now,
        isArchived: false,
      };

      const projectId = await FirestoreService.createProject(projectData);

      const newProject: Project = {
        id: projectId,
        ...projectData,
      };

      addProject(newProject);
      router.back();
      router.push(`/project/${projectId}`);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to create project: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">
            New Project
          </Text>
          <TouchableOpacity
            onPress={handleCreateProject}
            disabled={isLoading || !projectName.trim()}
            className={`px-4 py-2 rounded-lg ${
              isLoading || !projectName.trim() ? 'bg-gray-300' : 'bg-blue-600'
            }`}
          >
            <Text
              className={`font-medium ${
                isLoading || !projectName.trim()
                  ? 'text-gray-500'
                  : 'text-white'
              }`}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6">
          <View className="py-6">
            {/* Project Icon */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-blue-100 rounded-2xl items-center justify-center">
                <Ionicons name="folder" size={32} color="#2563eb" />
              </View>
            </View>

            {/* Form */}
            <View className="space-y-6">
              <View>
                <Text className="text-lg font-semibold text-gray-900 mb-2">
                  Project Name
                </Text>
                <TextInput
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white text-gray-900 text-lg"
                  placeholder="Enter project name"
                  value={projectName}
                  onChangeText={setProjectName}
                  autoFocus
                  maxLength={100}
                />
                <Text className="text-sm text-gray-500 mt-1">
                  {projectName.length}/100 characters
                </Text>
              </View>

              <View>
                <Text className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </Text>
                <TextInput
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white text-gray-900 text-base"
                  placeholder="What's this project about?"
                  value={projectDescription}
                  onChangeText={setProjectDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text className="text-sm text-gray-500 mt-1">
                  {projectDescription.length}/500 characters
                </Text>
              </View>

              {/* Project Features Info */}
              <View className="bg-blue-50 rounded-xl p-4 mt-8">
                <Text className="text-base font-medium text-blue-900 mb-3">
                  Your project will include:
                </Text>
                <View className="space-y-2">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#2563eb"
                    />
                    <Text className="text-blue-800 ml-3">Task management</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#2563eb"
                    />
                    <Text className="text-blue-800 ml-3">
                      Team collaboration
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#2563eb"
                    />
                    <Text className="text-blue-800 ml-3">
                      Real-time discussions
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#2563eb"
                    />
                    <Text className="text-blue-800 ml-3">
                      Progress tracking
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
