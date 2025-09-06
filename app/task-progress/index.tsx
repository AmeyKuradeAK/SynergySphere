import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTasksStore, useProjectsStore } from '~/store/store';
import { Task, TaskPriority } from '~/types';

export default function TaskProgress() {
  const { tasks } = useTasksStore();
  const { projects } = useProjectsStore();

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status === 'done'
    ).length;
    const inProgressTasks = tasks.filter(
      (task) => task.status === 'in_progress'
    ).length;
    const todoTasks = tasks.filter((task) => task.status === 'todo').length;

    // Priority distribution
    const highPriorityTasks = tasks.filter(
      (task) => task.priority === 'high'
    ).length;
    const mediumPriorityTasks = tasks.filter(
      (task) => task.priority === 'medium'
    ).length;
    const lowPriorityTasks = tasks.filter(
      (task) => task.priority === 'low'
    ).length;

    // Overdue tasks
    const now = new Date();
    const overdueTasks = tasks.filter(
      (task) => task.dueDate && task.dueDate < now && task.status !== 'done'
    ).length;

    // Completion rate
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
      overdueTasks,
      completionRate,
    };
  }, [tasks]);

  const projectStats = useMemo(() => {
    return projects.map((project) => {
      const projectTasks = tasks.filter(
        (task) => task.projectId === project.id
      );
      const completedTasks = projectTasks.filter(
        (task) => task.status === 'done'
      ).length;
      const totalTasks = projectTasks.length;
      const progress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...project,
        totalTasks,
        completedTasks,
        progress,
      };
    });
  }, [projects, tasks]);

  const recentTasks = useMemo(() => {
    return tasks
      .filter((task) => task.status !== 'done')
      .sort((a, b) => {
        // Sort by priority first (high, medium, low), then by due date
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];

        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }

        // If no due date, put at end
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return a.dueDate.getTime() - b.dueDate.getTime();
      })
      .slice(0, 10);
  }, [tasks]);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
    }
  };

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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: 'Task Progress' }} />

      <ScrollView className="flex-1">
        {/* Overall Progress */}
        <View className="bg-white p-6 m-4 rounded-xl shadow-sm">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Overall Progress
          </Text>

          <View className="items-center mb-6">
            <View className="w-32 h-32 rounded-full border-8 border-blue-100 items-center justify-center mb-4">
              <Text className="text-3xl font-bold text-blue-600">
                {stats.completionRate}%
              </Text>
              <Text className="text-sm text-gray-600">Complete</Text>
            </View>

            <Text className="text-base text-gray-600 text-center">
              {stats.completedTasks} of {stats.totalTasks} tasks completed
            </Text>
          </View>

          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-orange-600">
                {stats.todoTasks}
              </Text>
              <Text className="text-sm text-gray-600">To Do</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">
                {stats.inProgressTasks}
              </Text>
              <Text className="text-sm text-gray-600">In Progress</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">
                {stats.completedTasks}
              </Text>
              <Text className="text-sm text-gray-600">Done</Text>
            </View>
          </View>
        </View>

        {/* Priority Distribution */}
        <View className="bg-white p-6 mx-4 mb-4 rounded-xl shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Priority Distribution
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-4 h-4 bg-red-500 rounded mr-3" />
                <Text className="text-gray-700">High Priority</Text>
              </View>
              <Text className="text-gray-900 font-medium">
                {stats.highPriorityTasks}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-4 h-4 bg-yellow-500 rounded mr-3" />
                <Text className="text-gray-700">Medium Priority</Text>
              </View>
              <Text className="text-gray-900 font-medium">
                {stats.mediumPriorityTasks}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="w-4 h-4 bg-green-500 rounded mr-3" />
                <Text className="text-gray-700">Low Priority</Text>
              </View>
              <Text className="text-gray-900 font-medium">
                {stats.lowPriorityTasks}
              </Text>
            </View>
          </View>

          {stats.overdueTasks > 0 && (
            <View className="mt-4 p-3 bg-red-50 rounded-lg">
              <View className="flex-row items-center">
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <Text className="text-red-800 font-medium ml-2">
                  {stats.overdueTasks} overdue task
                  {stats.overdueTasks > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Project Progress */}
        <View className="bg-white p-6 mx-4 mb-4 rounded-xl shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Project Progress
          </Text>

          {projectStats.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">
              No projects yet
            </Text>
          ) : (
            <View className="space-y-4">
              {projectStats.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  className="p-4 bg-gray-50 rounded-lg"
                  onPress={() => router.push(`/project/${project.id}`)}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-medium text-gray-900 flex-1">
                      {project.name}
                    </Text>
                    <Text className="text-blue-600 font-medium">
                      {project.progress}%
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-gray-600">
                      {project.completedTasks}/{project.totalTasks} tasks
                    </Text>
                  </View>

                  <View className="bg-gray-200 rounded-full h-2">
                    <View
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Upcoming Tasks */}
        <View className="bg-white p-6 mx-4 mb-4 rounded-xl shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Priority Tasks
          </Text>

          {recentTasks.length === 0 ? (
            <Text className="text-gray-500 text-center py-4">
              No pending tasks
            </Text>
          ) : (
            <View className="space-y-3">
              {recentTasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                return (
                  <TouchableOpacity
                    key={task.id}
                    className="p-3 bg-gray-50 rounded-lg"
                    onPress={() => router.push(`/task/${task.id}`)}
                  >
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className="font-medium text-gray-900 flex-1 mr-2">
                        {task.title}
                      </Text>
                      <View
                        className={`px-2 py-1 rounded ${getStatusColor(task.status)}`}
                      >
                        <Text className="text-xs font-medium">
                          {task.status === 'todo' ? 'To Do' : 'In Progress'}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-gray-600">
                        {project?.name}
                      </Text>
                      <View className="flex-row items-center space-x-2">
                        <Text
                          className={`text-xs font-medium ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority.toUpperCase()}
                        </Text>
                        {task.dueDate && (
                          <Text className="text-xs text-gray-500">
                            {task.dueDate.toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
