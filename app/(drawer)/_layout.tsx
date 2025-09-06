import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { router } from 'expo-router';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useAuth } from '~/contexts/AuthProvider';
import { AuthService } from '~/services/auth';

function CustomDrawerContent(props: any) {
  const { user } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await AuthService.signOut();
            router.replace('/(auth)/login');
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <DrawerContentScrollView {...props}>
        {/* User Profile Section */}
        <View className="p-6 border-b border-gray-100">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center">
              <Text className="text-white font-semibold text-lg">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {user?.displayName || 'User'}
              </Text>
              <Text className="text-sm text-gray-600" numberOfLines={1}>
                {user?.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Navigation Items */}
        <View className="py-4">
          <DrawerItem
            label="Projects"
            icon={({ color, size }) => (
              <Ionicons name="folder-outline" size={size} color={color} />
            )}
            onPress={() => router.push('/(drawer)')}
          />

          <DrawerItem
            label="Task Progress"
            icon={({ color, size }) => (
              <Ionicons name="analytics-outline" size={size} color={color} />
            )}
            onPress={() => router.push('/task-progress')}
          />

          <DrawerItem
            label="Settings"
            icon={({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            )}
            onPress={() => router.push('/modal')}
          />
        </View>
      </DrawerContentScrollView>

      {/* Logout Button */}
      <View className="border-t border-gray-100 p-4">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center py-3 px-4"
        >
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text className="ml-3 text-red-500 font-medium">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const DrawerLayout = () => (
  <Drawer
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerShown: false,
      drawerStyle: {
        width: 280,
      },
    }}
  >
    <Drawer.Screen name="index" />
  </Drawer>
);

export default DrawerLayout;
