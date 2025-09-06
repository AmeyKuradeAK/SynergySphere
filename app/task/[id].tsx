import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTasksStore, useProjectsStore } from '~/store/store';
import { FirestoreService } from '~/services/firestore';
import { Task, TaskStatus, TaskPriority } from '~/types';

export default function TaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, updateTask } = useTasksStore();
  const { projects } = useProjectsStore();
  const [isLoading, setIsLoading] = useState(false);

  const task = tasks.find((t) => t.id === id);
  const project = task ? projects.find((p) => p.id === task.projectId) : null;

  const updateTaskStatus = async (newStatus: TaskStatus) => {
    if (!task || !id) return;

    setIsLoading(true);
    try {
      const updates: Partial<Task> = {
        status: newStatus,
        updatedAt: new Date(),
      };

      if (newStatus === 'done' && task.status !== 'done') {
        updates.completedAt = new Date();
      } else if (newStatus !== 'done' && task.status === 'done') {
        updates.completedAt = undefined;
      }

      await FirestoreService.updateTask(id, updates);
      updateTask(id, updates);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update task: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async () => {
    if (!task || !id) return;

    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await FirestoreService.deleteTask(id);
              router.back();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete task: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'done':
        return 'bg-green-100 text-green-700';
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'done':
        return 'Done';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'low':
        return 'arrow-down';
      case 'medium':
        return 'remove';
      case 'high':
        return 'arrow-up';
    }
  };

  if (!task) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-500">Task not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: 'Task Details',
          headerRight: () => (
            <TouchableOpacity onPress={deleteTask}>
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1">
        {/* Task Header */}
        <View className="bg-white p-6 border-b border-gray-100">
          <View className="flex-row justify-between items-start mb-4">
            <Text className="text-2xl font-bold text-gray-900 flex-1 mr-4">
              {task.title}
            </Text>
            <View
              className={`px-3 py-1 rounded-full ${getStatusColor(task.status)}`}
            >
              <Text className="text-sm font-medium">
                {getStatusText(task.status)}
              </Text>
            </View>
          </View>

          {task.description && (
            <Text className="text-base text-gray-700 mb-4 leading-6">
              {task.description}
            </Text>
          )}

          {/* Project */}
          <TouchableOpacity
            className="flex-row items-center mb-3"
            onPress={() => router.push(`/project/${task.projectId}`)}
          >
            <Ionicons name="folder-outline" size={18} color="#6b7280" />
            <Text className="text-gray-600 ml-2">{project?.name}</Text>
          </TouchableOpacity>

          {/* Priority */}
          <View className="flex-row items-center mb-3">
            <Ionicons
              name={getPriorityIcon(task.priority)}
              size={18}
              color={getPriorityColor(task.priority).split('-')[1]}
            />
            <Text
              className={`ml-2 font-medium ${getPriorityColor(task.priority)}`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}{' '}
              Priority
            </Text>
          </View>

          {/* Due Date */}
          {task.dueDate && (
            <View className="flex-row items-center mb-3">
              <Ionicons name="calendar-outline" size={18} color="#6b7280" />
              <Text className="text-gray-600 ml-2">
                Due {task.dueDate.toLocaleDateString()}
              </Text>
            </View>
          )}

          {/* Created/Updated */}
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={18} color="#6b7280" />
            <Text className="text-gray-600 ml-2">
              Created {task.createdAt.toLocaleDateString()}
              {task.completedAt &&
                ` • Completed ${task.completedAt.toLocaleDateString()}`}
            </Text>
          </View>
        </View>

        {/* Status Actions */}
        <View className="bg-white p-6 mt-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Update Status
          </Text>

          <View className="space-y-3">
            {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => updateTaskStatus(status)}
                disabled={isLoading || task.status === status}
                className={`flex-row items-center justify-between p-4 rounded-lg border ${
                  task.status === status
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-4 h-4 rounded-full mr-3 ${
                      status === 'todo'
                        ? 'bg-gray-400'
                        : status === 'in_progress'
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                    }`}
                  />
                  <Text
                    className={`font-medium ${
                      task.status === status ? 'text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {getStatusText(status)}
                  </Text>
                </View>

                {task.status === status && (
                  <Ionicons name="checkmark" size={20} color="#2563eb" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Task Progress */}
        {task.status === 'done' && task.completedAt && (
          <View className="bg-green-50 p-6 mt-4">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
              <View className="ml-3">
                <Text className="text-green-900 font-medium">
                  Task Completed!
                </Text>
                <Text className="text-green-700 text-sm">
                  Completed on {task.completedAt.toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
