import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '~/contexts/AuthProvider';
import { useDiscussionsStore, useProjectsStore } from '~/store/store';
import { FirestoreService } from '~/services/firestore';
import { Discussion } from '~/types';

export default function Chat() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { user } = useAuth();
  const { discussions, addDiscussion } = useDiscussionsStore();
  const { projects } = useProjectsStore();

  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const project = projects.find((p) => p.id === projectId);
  const projectDiscussions = discussions.filter(
    (d) => d.projectId === projectId
  );

  const sendMessage = async () => {
    if (!newMessage.trim() || !projectId || !user) return;

    setIsLoading(true);
    try {
      const now = new Date();
      const discussionData: Omit<Discussion, 'id'> = {
        projectId,
        title: newMessage.trim().substring(0, 50) + '...',
        content: newMessage.trim(),
        authorId: user.uid,
        createdAt: now,
        updatedAt: now,
        replies: [],
      };

      const discussionId =
        await FirestoreService.createDiscussion(discussionData);

      const newDiscussion: Discussion = {
        id: discussionId,
        ...discussionData,
      };

      addDiscussion(newDiscussion);
      setNewMessage('');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send message: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Discussion }) => (
    <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <View className="flex-row items-start">
        <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center mr-3">
          <Text className="text-white text-sm font-medium">
            {item.authorId.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-medium text-gray-900">Team Member</Text>
            <Text className="text-xs text-gray-500">
              {item.createdAt.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <Text className="text-gray-700 mb-2">{item.content}</Text>

          {item.replies.length > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="chatbubble-outline" size={14} color="#6b7280" />
              <Text className="text-xs text-gray-500 ml-1">
                {item.replies.length} repl
                {item.replies.length === 1 ? 'y' : 'ies'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: project?.name || 'Discussion',
          headerBackTitle: 'Project',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Messages */}
        <View className="flex-1 px-4 py-4">
          {projectDiscussions.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
              <Text className="text-lg font-medium text-gray-500 mt-4">
                No messages yet
              </Text>
              <Text className="text-sm text-gray-400 text-center mt-2">
                Start the conversation with your team
              </Text>
            </View>
          ) : (
            <FlatList
              data={projectDiscussions.sort(
                (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
              )}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Message Input */}
        <View className="bg-white border-t border-gray-100 px-4 py-3">
          <View className="flex-row items-end space-x-3">
            <TextInput
              className="flex-1 border border-gray-300 rounded-full px-4 py-3 bg-gray-50 text-gray-900"
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              onPress={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                newMessage.trim() && !isLoading ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <Ionicons
                name="send"
                size={20}
                color={newMessage.trim() && !isLoading ? 'white' : '#6b7280'}
              />
            </TouchableOpacity>
          </View>

          <Text className="text-xs text-gray-500 mt-1 px-4">
            {newMessage.length}/500 characters
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
