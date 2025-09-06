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
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '~/contexts/AuthProvider';
import { useTasksStore, useProjectsStore } from '~/store/store';
import { FirestoreService } from '~/services/firestore';
import { Task, TaskPriority, TaskStatus } from '~/types';

export default function CreateTask() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { user } = useAuth();
  const { addTask } = useTasksStore();
  const { projects } = useProjectsStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const project = projects.find((p) => p.id === projectId);

  const handleCreateTask = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (!projectId || !user) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    setIsLoading(true);
    try {
      const now = new Date();
      const taskData: Omit<Task, 'id'> = {
        title: title.trim(),
        description: description.trim(),
        projectId,
        creatorId: user.uid,
        status: 'todo' as TaskStatus,
        priority,
        dueDate,
        createdAt: now,
        updatedAt: now,
      };

      const taskId = await FirestoreService.createTask(taskData);

      const newTask: Task = {
        id: taskId,
        ...taskData,
      };

      addTask(newTask);
      router.back();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to create task: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
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
          <Text className="text-lg font-semibold text-gray-900">New Task</Text>
          <TouchableOpacity
            onPress={handleCreateTask}
            disabled={isLoading || !title.trim()}
            className={`px-4 py-2 rounded-lg ${
              isLoading || !title.trim() ? 'bg-gray-300' : 'bg-blue-600'
            }`}
          >
            <Text
              className={`font-medium ${
                isLoading || !title.trim() ? 'text-gray-500' : 'text-white'
              }`}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6">
          <View className="py-6">
            {/* Project Info */}
            <View className="bg-blue-50 rounded-lg p-4 mb-6">
              <Text className="text-sm font-medium text-blue-900 mb-1">
                Creating task for:
              </Text>
              <Text className="text-lg font-semibold text-blue-900">
                {project?.name}
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-6">
              <View>
                <Text className="text-lg font-semibold text-gray-900 mb-2">
                  Task Title
                </Text>
                <TextInput
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white text-gray-900 text-lg"
                  placeholder="What needs to be done?"
                  value={title}
                  onChangeText={setTitle}
                  autoFocus
                  maxLength={200}
                />
                <Text className="text-sm text-gray-500 mt-1">
                  {title.length}/200 characters
                </Text>
              </View>

              <View>
                <Text className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </Text>
                <TextInput
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white text-gray-900 text-base"
                  placeholder="Add more details about this task..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={1000}
                />
                <Text className="text-sm text-gray-500 mt-1">
                  {description.length}/1000 characters
                </Text>
              </View>

              {/* Priority */}
              <View>
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Priority
                </Text>
                <View className="flex-row space-x-3">
                  {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPriority(p)}
                      className={`flex-1 py-3 px-4 rounded-lg border ${
                        priority === p
                          ? getPriorityColor(p)
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-center font-medium ${
                          priority === p
                            ? getPriorityColor(p).split(' ')[1]
                            : 'text-gray-600'
                        }`}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Due Date */}
              <View>
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Due Date (Optional)
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="flex-row items-center justify-between p-4 border border-gray-300 rounded-xl bg-white"
                >
                  <Text
                    className={`text-base ${dueDate ? 'text-gray-900' : 'text-gray-500'}`}
                  >
                    {dueDate ? dueDate.toLocaleDateString() : 'Select due date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                </TouchableOpacity>

                {dueDate && (
                  <TouchableOpacity
                    onPress={() => setDueDate(null)}
                    className="mt-2"
                  >
                    <Text className="text-sm text-red-600 text-center">
                      Remove due date
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
