import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '~/contexts/AuthProvider';
import { FirestoreService } from '~/services/firestore';
import { Chat, ChatMessage } from '~/types';
import { BackButton } from '~/components/BackButton';

export default function ChatScreen() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newChatEmail, setNewChatEmail] = useState('');
  const [showNewChatInput, setShowNewChatInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = FirestoreService.listenToUserChats(
      user.id,
      (updatedChats) => {
        setChats(updatedChats);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedChat) return;

    const unsubscribe = FirestoreService.listenToChatMessages(
      selectedChat.id,
      (updatedMessages) => {
        setMessages(updatedMessages);
        // Scroll to bottom when new messages arrive
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => unsubscribe();
  }, [selectedChat]);

  const handleStartNewChat = async () => {
    if (!newChatEmail.trim() || !user) return;

    try {
      const chatId = await FirestoreService.createOrGetDirectChat(
        user.id,
        user.email,
        user.name,
        newChatEmail.trim()
      );

      if (chatId) {
        // Find and select the new chat
        const updatedChats = await FirestoreService.getUserChats(user.id);
        const newChat = updatedChats.find((chat) => chat.id === chatId);
        if (newChat) {
          setSelectedChat(newChat);
        }
      }

      setNewChatEmail('');
      setShowNewChatInput(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start chat');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    try {
      await FirestoreService.sendMessage(
        selectedChat.id,
        user.id,
        user.name,
        user.email,
        newMessage.trim()
      );
      setNewMessage('');
    } catch {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const getChatDisplayName = (chat: Chat) => {
    if (!user) return 'Unknown';

    const otherParticipant = chat.participants.find(
      (p) => p.userId !== user.id
    );
    return otherParticipant ? otherParticipant.name : 'Unknown User';
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);

    if (now.toDateString() === messageDate.toDateString()) {
      return messageDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return messageDate.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.senderId === user?.id;

    return (
      <View className={`mb-3 ${isMyMessage ? 'items-end' : 'items-start'}`}>
        <View
          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
            isMyMessage
              ? 'bg-blue-600 rounded-br-sm'
              : 'bg-gray-200 rounded-bl-sm'
          }`}
        >
          {!isMyMessage && (
            <Text className="text-xs text-gray-600 mb-1 font-medium">
              {item.senderName}
            </Text>
          )}
          <Text
            className={`text-base ${isMyMessage ? 'text-white' : 'text-gray-900'}`}
          >
            {item.content}
          </Text>
          <Text
            className={`text-xs mt-1 ${
              isMyMessage ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      onPress={() => setSelectedChat(item)}
      className="bg-white border-b border-gray-100 px-4 py-4 active:bg-gray-50"
    >
      <View className="flex-row items-center">
        <View className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center mr-4">
          <Text className="text-white font-bold text-lg">
            {getChatDisplayName(item).charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className="text-base font-semibold text-gray-900 flex-1"
              numberOfLines={1}
            >
              {getChatDisplayName(item)}
            </Text>
            <Text className="text-xs text-gray-400 ml-2">
              {formatMessageTime(item.lastMessageAt)}
            </Text>
          </View>
          <Text className="text-sm text-gray-600" numberOfLines={1}>
            {item.participants.find((p) => p.userId !== user?.id)?.email ||
              'Unknown email'}
          </Text>
        </View>
        <View className="ml-3">
          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Please log in to access chat</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            {selectedChat ? (
              <TouchableOpacity
                onPress={() => setSelectedChat(null)}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>
            ) : (
              <BackButton onPress={() => router.back()} />
            )}
            <Text className="text-lg font-semibold text-gray-900 ml-3">
              {selectedChat ? getChatDisplayName(selectedChat) : 'Messages'}
            </Text>
          </View>
          {!selectedChat && (
            <TouchableOpacity
              onPress={() => setShowNewChatInput(!showNewChatInput)}
              className="bg-blue-600 px-3 py-1 rounded-lg"
            >
              <Text className="text-white text-sm font-medium">New Chat</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* New Chat Input */}
        {showNewChatInput && !selectedChat && (
          <View className="mt-3 flex-row items-center space-x-2">
            <TextInput
              value={newChatEmail}
              onChangeText={setNewChatEmail}
              placeholder="Enter user email..."
              className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-gray-900"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={handleStartNewChat}
              className="bg-green-600 px-4 py-2 rounded-lg"
              disabled={!newChatEmail.trim()}
            >
              <Text className="text-white font-medium">Start</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Mobile-Optimized Linear Layout */}
      {!selectedChat ? (
        /* Chat List View */
        <View className="flex-1">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500">Loading chats...</Text>
            </View>
          ) : chats.length === 0 ? (
            <View className="flex-1 items-center justify-center p-6">
              <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
              <Text className="text-gray-500 text-center mt-4 text-lg">
                No conversations yet
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-2">
                Start your first conversation using the &quot;New Chat&quot;
                button above
              </Text>
            </View>
          ) : (
            <FlatList
              data={chats}
              renderItem={renderChatItem}
              keyExtractor={(item) => item.id}
              className="flex-1"
            />
          )}
        </View>
      ) : (
        /* Messages View */
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            className="flex-1 px-4 py-2"
            inverted={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            showsVerticalScrollIndicator={false}
          />

          {/* Message Input */}
          <View className="bg-white border-t border-gray-200 px-4 py-3">
            <View className="flex-row items-center space-x-2">
              <TextInput
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                multiline
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 max-h-20 text-gray-900"
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                className="bg-blue-600 w-10 h-10 rounded-full items-center justify-center"
                disabled={!newMessage.trim()}
              >
                <Ionicons name="send" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
