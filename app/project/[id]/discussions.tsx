import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FirestoreService } from '~/services/firestore';
import { Discussion } from '~/types';
import { useAuth } from '~/contexts/AuthProvider';
import { BackButton } from '~/components/BackButton';

export default function ProjectDiscussionsScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [showReplyInput, setShowReplyInput] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    if (!projectId || !user) return;

    const unsubscribe = FirestoreService.listenToProjectDiscussions(
      projectId,
      (updatedDiscussions) => {
        setDiscussions(updatedDiscussions);
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [projectId, user]);

  const handleCreateDiscussion = async () => {
    if (
      !newDiscussionTitle.trim() ||
      !newDiscussion.trim() ||
      !user ||
      !projectId
    )
      return;

    try {
      await FirestoreService.createDiscussion({
        title: newDiscussionTitle.trim(),
        content: newDiscussion.trim(),
        projectId,
        authorId: user.id,
        authorName: user.displayName || user.email || 'Unknown User',
        replies: [],
      });

      setNewDiscussion('');
      setNewDiscussionTitle('');
      Alert.alert('Success', 'Discussion created successfully!');
    } catch (error) {
      console.error('Error creating discussion:', error);
      Alert.alert('Error', 'Failed to create discussion. Please try again.');
    }
  };

  const handleAddReply = async (discussionId: string) => {
    const reply = replyText[discussionId]?.trim();
    if (!reply || !user) return;

    try {
      await FirestoreService.addDiscussionReply(
        discussionId,
        reply,
        user.id,
        user.displayName || user.email || 'Unknown User'
      );

      setReplyText((prev) => ({ ...prev, [discussionId]: '' }));
      setShowReplyInput((prev) => ({ ...prev, [discussionId]: false }));
    } catch (error) {
      console.error('Error adding reply:', error);
      Alert.alert('Error', 'Failed to add reply. Please try again.');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderDiscussion = (discussion: Discussion) => (
    <View
      key={discussion.id}
      className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-100"
    >
      {/* Discussion Header */}
      <View className="mb-3">
        <Text className="text-lg font-semibold text-gray-900 mb-1">
          {discussion.title}
        </Text>
        <View className="flex-row items-center mb-2">
          <Ionicons name="person-circle" size={16} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-1">
            {discussion.authorName}
          </Text>
          <Text className="text-sm text-gray-400 ml-2">
            • {formatDate(discussion.createdAt)}
          </Text>
        </View>
        <Text className="text-gray-700 leading-5">{discussion.content}</Text>
      </View>

      {/* Replies */}
      {discussion.replies && discussion.replies.length > 0 && (
        <View className="border-t border-gray-100 pt-3">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            {discussion.replies.length}{' '}
            {discussion.replies.length === 1 ? 'Reply' : 'Replies'}
          </Text>
          {discussion.replies.map((reply) => (
            <View
              key={reply.id}
              className="bg-gray-50 rounded-lg p-3 mb-2 ml-4"
            >
              <View className="flex-row items-center mb-1">
                <Ionicons name="person-circle" size={14} color="#6b7280" />
                <Text className="text-sm font-medium text-gray-700 ml-1">
                  {reply.authorName}
                </Text>
                <Text className="text-xs text-gray-400 ml-2">
                  • {formatDate(reply.createdAt)}
                </Text>
              </View>
              <Text className="text-sm text-gray-700 leading-4">
                {reply.content}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Reply Input */}
      {showReplyInput[discussion.id] ? (
        <View className="border-t border-gray-100 pt-3 mt-3">
          <TextInput
            value={replyText[discussion.id] || ''}
            onChangeText={(text) =>
              setReplyText((prev) => ({ ...prev, [discussion.id]: text }))
            }
            placeholder="Write a reply..."
            multiline
            className="bg-gray-50 rounded-lg p-3 min-h-[80px] text-gray-900 mb-3"
            textAlignVertical="top"
          />
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => handleAddReply(discussion.id)}
              className="bg-blue-600 px-4 py-2 rounded-lg flex-1"
              disabled={!replyText[discussion.id]?.trim()}
            >
              <Text className="text-white font-medium text-center">
                Post Reply
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setShowReplyInput((prev) => ({
                  ...prev,
                  [discussion.id]: false,
                }))
              }
              className="bg-gray-300 px-4 py-2 rounded-lg flex-1"
            >
              <Text className="text-gray-700 font-medium text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() =>
            setShowReplyInput((prev) => ({ ...prev, [discussion.id]: true }))
          }
          className="border-t border-gray-100 pt-3 mt-3"
        >
          <View className="flex-row items-center">
            <Ionicons name="chatbubble-outline" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-2">Reply</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center">
          <BackButton />
          <Text className="text-lg font-semibold text-gray-900 ml-3">
            Project Discussions
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* New Discussion Form */}
        <View className="bg-white rounded-lg p-4 my-4 shadow-sm border border-gray-100">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Start a Discussion
          </Text>

          <TextInput
            value={newDiscussionTitle}
            onChangeText={setNewDiscussionTitle}
            placeholder="Discussion title..."
            className="bg-gray-50 rounded-lg p-3 mb-3 text-gray-900"
          />

          <TextInput
            value={newDiscussion}
            onChangeText={setNewDiscussion}
            placeholder="What would you like to discuss?"
            multiline
            className="bg-gray-50 rounded-lg p-3 min-h-[100px] text-gray-900 mb-3"
            textAlignVertical="top"
          />

          <TouchableOpacity
            onPress={handleCreateDiscussion}
            className="bg-blue-600 py-3 rounded-lg"
            disabled={!newDiscussionTitle.trim() || !newDiscussion.trim()}
          >
            <Text className="text-white font-semibold text-center">
              Start Discussion
            </Text>
          </TouchableOpacity>
        </View>

        {/* Discussions List */}
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500">Loading discussions...</Text>
          </View>
        ) : discussions.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-center mt-4 text-base">
              No discussions yet
            </Text>
            <Text className="text-gray-400 text-center mt-1">
              Start the first discussion above
            </Text>
          </View>
        ) : (
          discussions.map(renderDiscussion)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
