import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '~/contexts/AuthProvider';
import { useProjectsStore, useTasksStore } from '~/store/store';
import { FirestoreService } from '~/services/firestore';
import { Project, Task } from '~/types';

export default function Home() {
  const { user } = useAuth();
  const { projects, setProjects, setLoading } = useProjectsStore();
  const { tasks, setTasks } = useTasksStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadProjects();

      // Set up real-time listener for user projects
      const unsubscribe = FirestoreService.listenToUserProjects(
        user.uid,
        (updatedProjects) => {
          setProjects(updatedProjects);
        }
      );

      return unsubscribe;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, setProjects]); // loadProjects is defined inside the component, so it's safe to omit

  const loadProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userProjects = await FirestoreService.getUserProjects(user.uid);
      setProjects(userProjects);

      // Load tasks for all projects
      const allTasks: Task[] = [];
      for (const project of userProjects) {
        const projectTasks = await FirestoreService.getProjectTasks(project.id);
        allTasks.push(...projectTasks);
      }
      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading projects:', error);
      Alert.alert('Error', 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const getProjectStats = () => {
    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status === 'done'
    ).length;
    const inProgressTasks = tasks.filter(
      (task) => task.status === 'in_progress'
    ).length;
    const todoTasks = tasks.filter((task) => task.status === 'todo').length;

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
    };
  };

  const stats = getProjectStats();

  const renderProjectCard = ({ item }: { item: Project }) => {
    const projectTasks = tasks.filter((task) => task.projectId === item.id);
    const completedTasks = projectTasks.filter(
      (task) => task.status === 'done'
    ).length;
    const totalTasks = projectTasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return (
      <TouchableOpacity
        className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
        onPress={() => router.push(`/project/${item.id}`)}
      >
        <View className="flex-row justify-between items-start mb-3">
          <Text className="text-lg font-semibold text-gray-900 flex-1 mr-2">
            {item.name}
          </Text>
          <View className="flex-row items-center space-x-1">
            <Ionicons name="people" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600">{item.members.length}</Text>
          </View>
        </View>

        <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
          {item.description}
        </Text>

        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-gray-500">
            {completedTasks}/{totalTasks} tasks completed
          </Text>
          <Text className="text-sm font-medium text-blue-600">
            {Math.round(progress)}%
          </Text>
        </View>

        <View className="mt-2 bg-gray-200 rounded-full h-2">
          <View
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-100">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-2xl font-bold text-gray-900">Projects</Text>
              <Text className="text-sm text-gray-600">
                Welcome back, {user?.displayName || 'User'}!
              </Text>
            </View>
            <TouchableOpacity
              className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center"
              onPress={() => router.push('/modal')}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="px-6 py-4">
          <View className="flex-row space-x-4">
            <View className="flex-1 bg-blue-50 rounded-lg p-4">
              <Text className="text-2xl font-bold text-blue-600">
                {stats.totalProjects}
              </Text>
              <Text className="text-sm text-blue-600">Active Projects</Text>
            </View>
            <View className="flex-1 bg-green-50 rounded-lg p-4">
              <Text className="text-2xl font-bold text-green-600">
                {stats.completedTasks}
              </Text>
              <Text className="text-sm text-green-600">Completed Tasks</Text>
            </View>
            <View className="flex-1 bg-orange-50 rounded-lg p-4">
              <Text className="text-2xl font-bold text-orange-600">
                {stats.inProgressTasks}
              </Text>
              <Text className="text-sm text-orange-600">In Progress</Text>
            </View>
          </View>
        </View>

        {/* Projects List */}
        <View className="flex-1 px-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            My Projects
          </Text>

          {projects.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Ionicons name="folder-open-outline" size={64} color="#d1d5db" />
              <Text className="text-lg font-medium text-gray-500 mt-4">
                No projects yet
              </Text>
              <Text className="text-sm text-gray-400 text-center mt-2">
                Create your first project to get started
              </Text>
              <TouchableOpacity
                className="bg-blue-600 px-6 py-3 rounded-lg mt-4"
                onPress={() => router.push('/modal')}
              >
                <Text className="text-white font-medium">Create Project</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={projects}
              renderItem={renderProjectCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
