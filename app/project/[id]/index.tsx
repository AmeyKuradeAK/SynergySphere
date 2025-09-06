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
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '~/contexts/AuthProvider';
import { FirestoreService } from '~/services/firestore';
import { Project, Task, Discussion } from '~/types';

export default function ProjectDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'tasks' | 'discussions'
  >('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      loadProjectData();

      // Set up real-time listeners
      const unsubscribeTasks = FirestoreService.listenToProjectTasks(
        id,
        setTasks
      );
      const unsubscribeDiscussions =
        FirestoreService.listenToProjectDiscussions(id, setDiscussions);

      return () => {
        unsubscribeTasks();
        unsubscribeDiscussions();
      };
    }
  }, [id, user]);

  const loadProjectData = async () => {
    if (!id || !user) return;

    try {
      setLoading(true);
      const [projectTasks, projectDiscussions] = await Promise.all([
        FirestoreService.getProjectTasks(id),
        FirestoreService.getProjectDiscussions(id),
      ]);

      setTasks(projectTasks);
      setDiscussions(projectDiscussions);

      // Try to load the actual project from Firestore
      try {
        const projectData = await FirestoreService.getProject(id);

        if (projectData) {
          setProject(projectData);
        } else {
          // Project not found, create a placeholder
          setProject({
            id,
            name: `Project ${id.slice(-4).toUpperCase()}`,
            description: 'Team collaboration project created in SynergySphere',
            ownerId: user.id,
            members: [
              {
                userId: user.id,
                email: user.email,
                name: user.name,
                role: 'owner',
                joinedAt: new Date(),
              },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
            isArchived: false,
            color: '#3B82F6',
            tags: ['Demo', 'Project'],
            priority: 'medium',
            status: 'active',
            progress: 0,
          });
        }
      } catch (projectError) {
        console.error('Error loading project details:', projectError);
        // Fallback to basic project info
        setProject({
          id,
          name: 'Project Details',
          description: 'Loading project information...',
          ownerId: user.id,
          members: [
            {
              userId: user.id,
              email: user.email,
              name: user.name,
              role: 'owner',
              joinedAt: new Date(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          isArchived: false,
          color: '#3B82F6',
          tags: ['Loading'],
          priority: 'medium',
          status: 'active',
          progress: 0,
        });
      }
    } catch (error) {
      console.error('Error loading project data:', error);
      Alert.alert(
        'Error',
        'Failed to load project data. Please check your connection.'
      );

      // Set minimal project data to prevent crashes
      setProject({
        id: id || 'unknown',
        name: 'Project',
        description: 'Unable to load project details',
        ownerId: user.id,
        members: [
          {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: 'owner',
            joinedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        color: '#3B82F6',
        tags: ['Error'],
        priority: 'medium',
        status: 'active',
        progress: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjectData();
    setRefreshing(false);
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'done').length;
    const inProgress = tasks.filter(
      (task) => task.status === 'in_progress'
    ).length;
    const todo = tasks.filter((task) => task.status === 'todo').length;
    const overdue = tasks.filter((task) => {
      if (!task.dueDate || task.status === 'done') return false;
      const dueDate =
        task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      return new Date() > dueDate;
    }).length;

    return { total, completed, inProgress, todo, overdue };
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    const dueDate = item.dueDate
      ? item.dueDate instanceof Date
        ? item.dueDate
        : new Date(item.dueDate)
      : null;
    const isOverdue = dueDate && new Date() > dueDate && item.status !== 'done';

    const getStatusColor = () => {
      switch (item.status) {
        case 'done':
          return 'text-green-600 bg-green-50';
        case 'in_progress':
          return 'text-orange-600 bg-orange-50';
        default:
          return 'text-gray-600 bg-gray-50';
      }
    };

    const getStatusText = () => {
      switch (item.status) {
        case 'done':
          return 'Done';
        case 'in_progress':
          return 'In Progress';
        default:
          return 'To Do';
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
          <View className={`px-2 py-1 rounded-full ${getStatusColor()}`}>
            <Text className="text-xs font-medium">{getStatusText()}</Text>
          </View>
        </View>

        {item.description && (
          <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="person-circle" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {item.assigneeId === user?.id ? 'You' : 'Unassigned'}
            </Text>
          </View>

          {dueDate && (
            <View className="flex-row items-center">
              <Ionicons
                name="calendar"
                size={14}
                color={isOverdue ? '#ef4444' : '#6b7280'}
              />
              <Text
                className={`text-sm ml-1 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}
              >
                {dueDate.toLocaleDateString()}
              </Text>
              {isOverdue && (
                <Ionicons
                  name="warning"
                  size={14}
                  color="#ef4444"
                  className="ml-1"
                />
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderDiscussionItem = ({ item }: { item: Discussion }) => (
    <View className="bg-white rounded-lg p-4 mb-3 border border-gray-100">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-base font-medium text-gray-900 flex-1">
          {item.title}
        </Text>
        <Text className="text-xs text-gray-500">
          {item.createdAt.toLocaleDateString()}
        </Text>
      </View>
      <Text className="text-sm text-gray-600 mb-2" numberOfLines={3}>
        {item.content}
      </Text>
      <View className="flex-row items-center">
        <Ionicons name="person-circle" size={16} color="#6b7280" />
        <Text className="text-sm text-gray-600 ml-1">
          {item.authorId === user?.id ? 'You' : 'Team member'}
        </Text>
        <Text className="text-sm text-gray-400 ml-4">
          {item.replies?.length || 0} replies
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-500">Loading project...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getTaskStats();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900 flex-1 text-center">
              {project?.name || 'Project'}
            </Text>
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center"
              onPress={() => router.push('/modal')}
            >
              <Ionicons name="settings" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Tab Navigation */}
          <View className="flex-row space-x-1">
            {['overview', 'tasks', 'discussions'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab as any)}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  activeTab === tab ? 'bg-blue-600' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    activeTab === tab ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === 'overview' && (
            <View className="p-6">
              {/* Project Info */}
              <View className="bg-white rounded-lg p-4 mb-6">
                <Text className="text-lg font-semibold text-gray-900 mb-2">
                  Project Overview
                </Text>
                <Text className="text-sm text-gray-600 mb-4">
                  {project?.description || 'No description available'}
                </Text>

                <View className="flex-row justify-between">
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-blue-600">
                      {stats.total}
                    </Text>
                    <Text className="text-sm text-gray-600">Total Tasks</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-green-600">
                      {stats.completed}
                    </Text>
                    <Text className="text-sm text-gray-600">Completed</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-orange-600">
                      {stats.inProgress}
                    </Text>
                    <Text className="text-sm text-gray-600">In Progress</Text>
                  </View>
                  {stats.overdue > 0 && (
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-red-600">
                        {stats.overdue}
                      </Text>
                      <Text className="text-sm text-gray-600">Overdue</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Quick Actions */}
              <View className="space-y-3">
                <TouchableOpacity
                  className="bg-blue-600 py-4 rounded-lg items-center"
                  onPress={() =>
                    router.push(`/task/create?projectId=${id}` as any)
                  }
                >
                  <Text className="text-white font-medium">Add New Task</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-green-600 py-4 rounded-lg items-center"
                  onPress={() => router.push('/chat')}
                >
                  <Text className="text-white font-medium">Open Chat</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'tasks' && (
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold text-gray-900">
                  Tasks ({tasks.length})
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/task/create?projectId=${id}` as any)
                  }
                  className="bg-blue-600 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">Add Task</Text>
                </TouchableOpacity>
              </View>

              {tasks.length === 0 ? (
                <View className="bg-white rounded-lg p-8 items-center">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={48}
                    color="#d1d5db"
                  />
                  <Text className="text-gray-500 mt-2">No tasks yet</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">
                    Create your first task to get started
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={tasks}
                  renderItem={renderTaskItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </View>
          )}

          {activeTab === 'discussions' && (
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold text-gray-900">
                  Discussions ({discussions.length})
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/chat')}
                  className="bg-green-600 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">New Topic</Text>
                </TouchableOpacity>
              </View>

              {discussions.length === 0 ? (
                <View className="bg-white rounded-lg p-8 items-center">
                  <Ionicons
                    name="chatbubbles-outline"
                    size={48}
                    color="#d1d5db"
                  />
                  <Text className="text-gray-500 mt-2">No discussions yet</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">
                    Start a conversation with your team
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={discussions}
                  renderItem={renderDiscussionItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
