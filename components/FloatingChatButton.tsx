import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '~/contexts/AuthProvider';
import { FirestoreService } from '~/services/firestore';
import { Chat } from '~/types';

export function FloatingChatButton() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [, setChats] = useState<Chat[]>([]);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = FirestoreService.listenToUserChats(
      user.id,
      (updatedChats) => {
        setChats(updatedChats);
        // For now, we'll show the total number of chats as a simple indicator
        // In a real implementation, you'd calculate actual unread messages
        setUnreadCount(updatedChats.length);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handlePress = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    router.push('/chat');
  };

  if (!user) return null;

  return (
    <View className="absolute bottom-6 right-6 z-50">
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={handlePress}
          className="bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          style={{
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
          }}
        >
          <Ionicons name="chatbubbles" size={24} color="white" />

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1">
              <Text className="text-white text-xs font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
