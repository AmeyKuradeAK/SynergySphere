import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { router } from 'expo-router';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useAuth } from '~/contexts/AuthProvider';

function CustomDrawerContent(props: any) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/(auth)/login');
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: 'home',
      label: 'Dashboard',
      route: '/(drawer)',
      color: '#3B82F6',
    },
    {
      icon: 'briefcase',
      label: 'My Projects',
      route: '/(drawer)',
      color: '#10B981',
    },
    {
      icon: 'checkmark-circle',
      label: 'My Tasks',
      route: '/task-progress',
      color: '#F59E0B',
    },
    {
      icon: 'chatbubbles',
      label: 'Messages',
      route: '/chat',
      color: '#8B5CF6',
    },
    {
      icon: 'analytics',
      label: 'Analytics',
      route: '/task-progress',
      color: '#EF4444',
    },
  ];

  return (
    <DrawerContentScrollView {...props} className="flex-1 bg-white">
      {/* Header with User Profile */}
      <View className="px-6 py-8 bg-gradient-to-br from-blue-600 to-blue-700">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={() => router.push('/profile')}
        >
          <View className="w-16 h-16 bg-white rounded-full items-center justify-center mr-4">
            <Text className="text-blue-600 font-bold text-xl">
              {user?.name?.charAt(0)?.toUpperCase() ||
                user?.email?.charAt(0)?.toUpperCase() ||
                'U'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold text-lg">
              {user?.name || 'User'}
            </Text>
            <Text className="text-blue-100 text-sm" numberOfLines={1}>
              {user?.email}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-blue-200 text-xs">View Profile</Text>
              <Ionicons
                name="chevron-forward"
                size={12}
                color="#BFDBFE"
                className="ml-1"
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Navigation Menu */}
      <View className="flex-1 py-4">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center px-6 py-4 active:bg-gray-50"
            onPress={() => {
              if (item.route !== props.state?.routeNames[props.state?.index]) {
                router.push(item.route as any);
              }
            }}
          >
            <View
              className="w-10 h-10 rounded-lg items-center justify-center mr-4"
              style={{ backgroundColor: item.color + '15' }}
            >
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text className="text-base font-medium text-gray-700 flex-1">
              {item.label}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
          </TouchableOpacity>
        ))}

        {/* Divider */}
        <View className="h-px bg-gray-200 mx-6 my-4" />

        {/* Settings */}
        <TouchableOpacity
          className="flex-row items-center px-6 py-4 active:bg-gray-50"
          onPress={() => router.push('/settings')}
        >
          <View className="w-10 h-10 rounded-lg items-center justify-center mr-4 bg-gray-100">
            <Ionicons name="settings" size={20} color="#6B7280" />
          </View>
          <Text className="text-base font-medium text-gray-700 flex-1">
            Settings
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
        </TouchableOpacity>

        {/* Help & Support */}
        <TouchableOpacity
          className="flex-row items-center px-6 py-4 active:bg-gray-50"
          onPress={() =>
            Alert.alert(
              'Help & Support',
              'Contact support at help@synergysphere.com'
            )
          }
        >
          <View className="w-10 h-10 rounded-lg items-center justify-center mr-4 bg-gray-100">
            <Ionicons name="help-circle" size={20} color="#6B7280" />
          </View>
          <Text className="text-base font-medium text-gray-700 flex-1">
            Help & Support
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
        </TouchableOpacity>
      </View>

      {/* Footer with Logout */}
      <View className="border-t border-gray-200 p-6">
        <TouchableOpacity
          className="flex-row items-center bg-red-50 p-4 rounded-lg"
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color="#EF4444" />
          <Text className="ml-3 text-base font-medium text-red-600">
            Sign Out
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <View className="mt-4 items-center">
          <Text className="text-xs text-gray-400">SynergySphere v1.0.0</Text>
          <Text className="text-xs text-gray-400">
            Enterprise Collaboration Platform
          </Text>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: 'white',
          width: 320,
        },
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Dashboard',
          title: 'Dashboard',
        }}
      />
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Projects',
          title: 'Projects',
        }}
      />
    </Drawer>
  );
}
