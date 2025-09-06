import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// import { useAuth } from '~/contexts/AuthProvider'; // May be needed for permissions later
import {
  useProjectsStore,
  useTasksStore,
  useDiscussionsStore,
} from '~/store/store';
import { FirestoreService } from '~/services/firestore';
import { Task, Discussion } from '~/types';

export default function ProjectDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // const { user } = useAuth(); // Currently unused but may be needed for permissions
  const { projects, currentProject, setCurrentProject } = useProjectsStore();
  const { tasks, setTasks } = useTasksStore();
  const { discussions, setDiscussions } = useDiscussionsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'tasks' | 'discussions'
  >('overview');

  const project = projects.find((p) => p.id === id) || currentProject;

  useEffect(() => {
    if (id && project) {
      setCurrentProject(project);
      loadProjectData();

      // Set up real-time listeners
      const unsubscribeTasks = FirestoreService.listenToProjectTasks(
        id,
        (updatedTasks) => {
          setTasks(updatedTasks);
        }
      );

      const unsubscribeDiscussions =
        FirestoreService.listenToProjectDiscussions(
          id,
          (updatedDiscussions) => {
            setDiscussions(updatedDiscussions);
          }
        );

      return () => {
        unsubscribeTasks();
        unsubscribeDiscussions();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, project, setCurrentProject, setTasks, setDiscussions]); // loadProjectData is defined inside the component

  const loadProjectData = async () => {
    if (!id) return;

    try {
      const [projectTasks, projectDiscussions] = await Promise.all([
        FirestoreService.getProjectTasks(id),
        FirestoreService.getProjectDiscussions(id),
      ]);

      setTasks(projectTasks);
      setDiscussions(projectDiscussions);
    } catch (error) {
      console.error('Error loading project data:', error);
      Alert.alert('Error', 'Failed to load project data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjectData();
    setRefreshing(false);
  };

  const getProjectTasks = () => {
    return tasks.filter((task) => task.projectId === id);
  };

  const getProjectDiscussions = () => {
    return discussions.filter((discussion) => discussion.projectId === id);
  };

  const getTaskStats = () => {
    const projectTasks = getProjectTasks();
    return {
      total: projectTasks.length,
      todo: projectTasks.filter((t) => t.status === 'todo').length,
      inProgress: projectTasks.filter((t) => t.status === 'in_progress').length,
      done: projectTasks.filter((t) => t.status === 'done').length,
    };
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    const getStatusColor = (status: Task['status']) => {
      switch (status) {
        case 'todo':
          return 'bg-gray-100 text-gray-700';
        case 'in_progress':
          return 'bg-blue-100 text-blue-700';
        case 'done':
          return 'bg-green-100 text-green-700';
      }
    };

    const getStatusText = (status: Task['status']) => {
      switch (status) {
        case 'todo':
          return 'To Do';
        case 'in_progress':
          return 'In Progress';
        case 'done':
          return 'Done';
      }
    };

    return (
      <TouchableOpacity
        className="bg-white rounded-lg p-4 mb-3 border border-gray-100"
        onPress={() => router.push(`/task/${item.id}`)}
      >
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-base font-medium text-gray-900 flex-1 mr-2">
            {item.title}
          </Text>
          <View
            className={`px-2 py-1 rounded-md ${getStatusColor(item.status)}`}
          >
            <Text className="text-xs font-medium">
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        {item.description && (
          <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            {item.assigneeId && (
              <View className="flex-row items-center mr-4">
                <Ionicons
                  name="person-circle-outline"
                  size={16}
                  color="#6b7280"
                />
                <Text className="text-sm text-gray-600 ml-1">Assigned</Text>
              </View>
            )}
            {item.dueDate && (
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                <Text className="text-sm text-gray-600 ml-1">
                  {item.dueDate.toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDiscussionItem = ({ item }: { item: Discussion }) => (
    <TouchableOpacity className="bg-white rounded-lg p-4 mb-3 border border-gray-100">
      <Text className="text-base font-medium text-gray-900 mb-2">
        {item.title}
      </Text>
      <Text className="text-sm text-gray-600 mb-2" numberOfLines={3}>
        {item.content}
      </Text>
      <View className="flex-row justify-between items-center">
        <Text className="text-xs text-gray-500">
          {item.createdAt.toLocaleDateString()}
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="chatbubble-outline" size={14} color="#6b7280" />
          <Text className="text-xs text-gray-500 ml-1">
            {item.replies.length}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOverview = () => {
    const taskStats = getTaskStats();
    const projectTasks = getProjectTasks();
    const recentTasks = projectTasks.slice(0, 5);

    return (
      <ScrollView className="flex-1">
        {/* Project Info */}
        <View className="bg-white rounded-xl p-6 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            {project?.name}
          </Text>
          <Text className="text-gray-600 mb-4">{project?.description}</Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="people" size={20} color="#6b7280" />
              <Text className="text-gray-600 ml-2">
                {project?.members.length} members
              </Text>
            </View>
            <Text className="text-sm text-gray-500">
              Created {project?.createdAt.toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Task Stats */}
        <View className="bg-white rounded-xl p-6 mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Task Overview
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {taskStats.total}
              </Text>
              <Text className="text-sm text-gray-600">Total</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-orange-600">
                {taskStats.todo}
              </Text>
              <Text className="text-sm text-gray-600">To Do</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">
                {taskStats.inProgress}
              </Text>
              <Text className="text-sm text-gray-600">In Progress</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">
                {taskStats.done}
              </Text>
              <Text className="text-sm text-gray-600">Done</Text>
            </View>
          </View>
        </View>

        {/* Recent Tasks */}
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Recent Tasks
            </Text>
            <TouchableOpacity onPress={() => setActiveTab('tasks')}>
              <Text className="text-blue-600 font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          {recentTasks.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">No tasks yet</Text>
          ) : (
            recentTasks.map((task) => (
              <View key={task.id} className="mb-2">
                {renderTaskItem({ item: task })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    );
  };

  const renderTasks = () => {
    const projectTasks = getProjectTasks();

    return (
      <View className="flex-1">
        <FlatList
          data={projectTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-12">
              <Ionicons name="list-outline" size={64} color="#d1d5db" />
              <Text className="text-lg font-medium text-gray-500 mt-4">
                No tasks yet
              </Text>
              <Text className="text-sm text-gray-400 text-center mt-2">
                Create your first task to get started
              </Text>
            </View>
          }
        />

        <TouchableOpacity
          className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg"
          onPress={() => router.push(`/task/create?projectId=${id}` as any)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderDiscussions = () => {
    const projectDiscussions = getProjectDiscussions();

    return (
      <View className="flex-1">
        <FlatList
          data={projectDiscussions}
          renderItem={renderDiscussionItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-12">
              <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
              <Text className="text-lg font-medium text-gray-500 mt-4">
                No discussions yet
              </Text>
              <Text className="text-sm text-gray-400 text-center mt-2">
                Start a discussion to collaborate with your team
              </Text>
            </View>
          }
        />

        <TouchableOpacity
          className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg"
          onPress={() => router.push(`/chat?projectId=${id}` as any)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  if (!project) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-500">Project not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: project.name,
          headerBackTitle: 'Projects',
        }}
      />

      {/* Tab Navigation */}
      <View className="bg-white border-b border-gray-100">
        <View className="flex-row px-6">
          {(['overview', 'tasks', 'discussions'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-4 ${activeTab === tab ? 'border-b-2 border-blue-600' : ''}`}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === tab ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-6 py-4">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'discussions' && renderDiscussions()}
      </View>
    </SafeAreaView>
  );
}
