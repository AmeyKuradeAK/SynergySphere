import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '~/contexts/AuthProvider';
import { FirestoreService } from '~/services/firestore';
import { Project, Task } from '~/types';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();

      // Set up real-time listener for user projects
      const unsubscribe = FirestoreService.listenToUserProjects(
        user.id,
        (updatedProjects) => {
          setProjects(updatedProjects);
          loadAllTasks(updatedProjects);
        }
      );

      return unsubscribe;
    }
  }, [user, loadAllTasks]);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userProjects = await FirestoreService.getUserProjects(user.id);
      setProjects(userProjects);
      await loadAllTasks(userProjects);
    } catch (error) {
      console.error('Error loading dashboard data:', error);

      // Show user-friendly message about Firestore setup
      Alert.alert(
        'Loading Projects',
        'Projects are being loaded in the background. This may take a moment for new accounts.',
        [{ text: 'OK' }]
      );

      // Set empty arrays to show empty state initially
      setProjects([]);
      setAllTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadAllTasks = async (projectList: Project[]) => {
    try {
      const allTasksPromises = projectList.map((project) =>
        FirestoreService.getProjectTasks(project.id)
      );
      const tasksArrays = await Promise.all(allTasksPromises);
      const flatTasks = tasksArrays.flat();
      setAllTasks(flatTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getInsights = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(
      (task) => task.status === 'done'
    ).length;
    const inProgressTasks = allTasks.filter(
      (task) => task.status === 'in_progress'
    ).length;
    const overdueTasks = allTasks.filter((task) => {
      if (!task.dueDate || task.status === 'done') return false;
      const dueDate =
        task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      return new Date() > dueDate;
    }).length;
    const criticalTasks = allTasks.filter(
      (task) => task.priority === 'critical' && task.status !== 'done'
    ).length;
    const myTasks = allTasks.filter(
      (task) => task.assigneeId === user?.id
    ).length;

    return {
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      criticalTasks,
      myTasks,
      completionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  };

  const getUpcomingDeadlines = () => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingTasks = allTasks.filter((task) => {
      if (!task.dueDate || task.status === 'done') return false;
      const dueDate =
        task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      return dueDate > now && dueDate <= sevenDaysFromNow;
    });

    const upcomingProjects = projects.filter((project) => {
      if (!project.deadline || project.status === 'completed') return false;
      const deadline =
        project.deadline instanceof Date
          ? project.deadline
          : new Date(project.deadline);
      return deadline > now && deadline <= sevenDaysFromNow;
    });

    return [...upcomingTasks, ...upcomingProjects];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#EF4444';
      case 'high':
        return '#F97316';
      case 'medium':
        return '#EAB308';
      case 'low':
        return '#22C55E';
      default:
        return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'planning':
        return '#3B82F6';
      case 'on-hold':
        return '#F59E0B';
      case 'completed':
        return '#22C55E';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderProjectCard = ({ item }: { item: Project }) => {
    const projectTasks = allTasks.filter((task) => task.projectId === item.id);
    const completedTasks = projectTasks.filter(
      (task) => task.status === 'done'
    ).length;
    const totalTasks = projectTasks.length;
    const progress =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : item.progress || 0;

    const overdueTasks = projectTasks.filter((task) => {
      if (!task.dueDate || task.status === 'done') return false;
      const dueDate =
        task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      return new Date() > dueDate;
    }).length;

    const criticalTasks = projectTasks.filter(
      (task) => task.priority === 'critical' && task.status !== 'done'
    ).length;

    return (
      <TouchableOpacity
        className="bg-white rounded-xl mb-4 shadow-sm border border-gray-100 overflow-hidden"
        onPress={() => router.push(`/project/${item.id}`)}
      >
        {/* Project Image */}
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-32"
            resizeMode="cover"
          />
        )}

        <View className="p-4">
          {/* Header with Priority & Status */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center mb-2">
                <View
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getPriorityColor(item.priority) }}
                />
                <Text className="text-lg font-semibold text-gray-900">
                  {item.name}
                </Text>
              </View>
              <Text className="text-sm text-gray-600" numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            <View className="items-end">
              <View
                className="px-2 py-1 rounded-full mb-2"
                style={{ backgroundColor: getStatusColor(item.status) + '20' }}
              >
                <Text
                  className="text-xs font-medium capitalize"
                  style={{ color: getStatusColor(item.status) }}
                >
                  {item.status.replace('-', ' ')}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="people" size={14} color="#6b7280" />
                <Text className="text-xs text-gray-600 ml-1">
                  {item.members.length}
                </Text>
              </View>
            </View>
          </View>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View className="flex-row flex-wrap mb-3">
              {item.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  className="bg-blue-50 px-2 py-1 rounded-full mr-2 mb-1"
                >
                  <Text className="text-xs text-blue-700">{tag}</Text>
                </View>
              ))}
              {item.tags.length > 3 && (
                <View className="bg-gray-50 px-2 py-1 rounded-full">
                  <Text className="text-xs text-gray-600">
                    +{item.tags.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Progress & Stats */}
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-500">
                {completedTasks}/{totalTasks} tasks completed
              </Text>
              <View className="flex-row items-center space-x-3">
                {criticalTasks > 0 && (
                  <View className="flex-row items-center">
                    <Ionicons name="alert-circle" size={14} color="#EF4444" />
                    <Text className="text-xs text-red-600 ml-1">
                      {criticalTasks} critical
                    </Text>
                  </View>
                )}
                {overdueTasks > 0 && (
                  <View className="flex-row items-center">
                    <Ionicons name="time" size={14} color="#F97316" />
                    <Text className="text-xs text-orange-600 ml-1">
                      {overdueTasks} overdue
                    </Text>
                  </View>
                )}
                <Text className="text-sm font-medium text-blue-600">
                  {Math.round(progress)}%
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="bg-gray-200 rounded-full h-2">
              <View
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>

            {/* Department & Deadline */}
            <View className="flex-row justify-between items-center">
              {item.department && (
                <View className="flex-row items-center">
                  <Ionicons name="business" size={12} color="#6b7280" />
                  <Text className="text-xs text-gray-600 ml-1">
                    {item.department}
                  </Text>
                </View>
              )}
              {item.deadline && (
                <View className="flex-row items-center">
                  <Ionicons name="calendar" size={12} color="#6b7280" />
                  <Text className="text-xs text-gray-600 ml-1">
                    Due{' '}
                    {item.deadline instanceof Date
                      ? item.deadline.toLocaleDateString()
                      : new Date(item.deadline).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const insights = getInsights();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Ionicons name="rocket" size={48} color="#3B82F6" />
          <Text className="text-lg text-gray-700 mt-4 font-medium">
            Loading your workspace...
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            Setting up your projects and tasks
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-100">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                SynergySphere
              </Text>
              <Text className="text-sm text-gray-600">
                Welcome back, {user?.name || 'User'}!
              </Text>
            </View>
            <View className="flex-row items-center space-x-3">
              <TouchableOpacity
                className="w-10 h-10 items-center justify-center"
                onPress={() => router.push('/profile')}
              >
                <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center">
                  <Text className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() ||
                      user?.email?.charAt(0)?.toUpperCase() ||
                      'U'}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center shadow-lg"
                onPress={() => router.push('/modal')}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Proactive Alerts */}
        {(insights.overdueTasks > 0 ||
          insights.criticalTasks > 0 ||
          getUpcomingDeadlines().length > 0) && (
          <View className="px-6 py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              ⚠️ Attention Required
            </Text>

            {/* Overdue Alert */}
            {insights.overdueTasks > 0 && (
              <TouchableOpacity className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="warning" size={20} color="#ef4444" />
                  <Text className="text-red-800 font-medium ml-2">
                    {insights.overdueTasks} overdue task
                    {insights.overdueTasks > 1 ? 's' : ''} need immediate
                    attention
                  </Text>
                </View>
                <Text className="text-red-600 text-sm mt-1">
                  Review and update these tasks to keep projects on track
                </Text>
              </TouchableOpacity>
            )}

            {/* Critical Tasks Alert */}
            {insights.criticalTasks > 0 && (
              <TouchableOpacity className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                  <Text className="text-orange-800 font-medium ml-2">
                    {insights.criticalTasks} critical task
                    {insights.criticalTasks > 1 ? 's' : ''} in progress
                  </Text>
                </View>
                <Text className="text-orange-600 text-sm mt-1">
                  These high-priority tasks require focused attention
                </Text>
              </TouchableOpacity>
            )}

            {/* Upcoming Deadlines Alert */}
            {getUpcomingDeadlines().length > 0 && (
              <TouchableOpacity className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                <View className="flex-row items-center">
                  <Ionicons name="time" size={20} color="#eab308" />
                  <Text className="text-yellow-800 font-medium ml-2">
                    {getUpcomingDeadlines().length} deadline
                    {getUpcomingDeadlines().length > 1 ? 's' : ''} approaching
                  </Text>
                </View>
                <Text className="text-yellow-600 text-sm mt-1">
                  Plan ahead to meet upcoming project milestones
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Insights Dashboard */}
        <View className="px-6 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Your Insights
          </Text>

          {/* Primary Stats */}
          <View className="flex-row space-x-4 mb-4">
            <View className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4">
              <Text className="text-2xl font-bold text-white">
                {insights.activeProjects}
              </Text>
              <Text className="text-sm text-blue-100">Active Projects</Text>
            </View>
            <View className="flex-1 bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4">
              <Text className="text-2xl font-bold text-white">
                {insights.completionRate}%
              </Text>
              <Text className="text-sm text-green-100">Completion Rate</Text>
            </View>
            <View className="flex-1 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4">
              <Text className="text-2xl font-bold text-white">
                {insights.myTasks}
              </Text>
              <Text className="text-sm text-purple-100">My Tasks</Text>
            </View>
          </View>

          {/* Alert Cards */}
          {(insights.overdueTasks > 0 || insights.criticalTasks > 0) && (
            <View className="space-y-3 mb-4">
              {insights.overdueTasks > 0 && (
                <View className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <View className="flex-row items-center">
                    <Ionicons name="warning" size={20} color="#EF4444" />
                    <Text className="text-red-800 font-medium ml-2">
                      {insights.overdueTasks} overdue tasks need immediate
                      attention
                    </Text>
                  </View>
                </View>
              )}
              {insights.criticalTasks > 0 && (
                <View className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <View className="flex-row items-center">
                    <Ionicons name="alert-circle" size={20} color="#F97316" />
                    <Text className="text-orange-800 font-medium ml-2">
                      {insights.criticalTasks} critical priority tasks in
                      progress
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Secondary Stats */}
          <View className="flex-row space-x-4 mb-6">
            <View className="flex-1 bg-white rounded-lg p-4 border border-gray-100">
              <Text className="text-lg font-semibold text-gray-900">
                {insights.totalTasks}
              </Text>
              <Text className="text-sm text-gray-600">Total Tasks</Text>
            </View>
            <View className="flex-1 bg-white rounded-lg p-4 border border-gray-100">
              <Text className="text-lg font-semibold text-green-600">
                {insights.completedTasks}
              </Text>
              <Text className="text-sm text-gray-600">Completed</Text>
            </View>
            <View className="flex-1 bg-white rounded-lg p-4 border border-gray-100">
              <Text className="text-lg font-semibold text-orange-600">
                {insights.inProgressTasks}
              </Text>
              <Text className="text-sm text-gray-600">In Progress</Text>
            </View>
          </View>
        </View>

        {/* Projects Section */}
        <View className="px-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              My Projects ({projects.length})
            </Text>
            <TouchableOpacity
              className="bg-blue-100 px-3 py-1 rounded-full"
              onPress={() => router.push('/modal')}
            >
              <Text className="text-blue-700 text-sm font-medium">
                New Project
              </Text>
            </TouchableOpacity>
          </View>

          {projects.length === 0 ? (
            <View className="bg-white rounded-lg p-8 items-center border border-gray-100">
              <Ionicons name="rocket-outline" size={64} color="#d1d5db" />
              <Text className="text-lg font-medium text-gray-500 mt-4">
                Ready to collaborate?
              </Text>
              <Text className="text-sm text-gray-400 text-center mt-2 px-4">
                Your projects are being set up! If you just signed up,
                they&apos;ll appear shortly. Otherwise, create your first
                project to get started.
              </Text>
              <View className="flex-row space-x-3 mt-4">
                <TouchableOpacity
                  className="bg-blue-600 px-6 py-3 rounded-lg"
                  onPress={() => router.push('/modal')}
                >
                  <Text className="text-white font-medium">Create Project</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-green-600 px-6 py-3 rounded-lg"
                  onPress={async () => {
                    if (user) {
                      const { ProjectSeedingService } = await import(
                        '~/services/projectSeeding'
                      );
                      await ProjectSeedingService.seedUserProjects(
                        user.id,
                        user.email,
                        user.name
                      );
                      await loadDashboardData();
                      Alert.alert(
                        'Success',
                        '3 demo projects have been created for you!'
                      );
                    }
                  }}
                >
                  <Text className="text-white font-medium">
                    Get Demo Projects
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <FlatList
              data={projects}
              renderItem={renderProjectCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
