import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function TaskProgress() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">
              Task Progress
            </Text>
            <View className="w-10" />
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="analytics-outline" size={64} color="#d1d5db" />
          <Text className="text-lg font-medium text-gray-500 mt-4">
            Analytics Dashboard
          </Text>
          <Text className="text-sm text-gray-400 text-center mt-2">
            Task progress analytics will be implemented here
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
