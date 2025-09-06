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
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService } from '~/services/auth';
import { useAuthStore } from '~/store/store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const user = await AuthService.signIn(email, password);
      setUser(user);
      router.replace('/(drawer)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      await AuthService.sendPasswordResetEmail(email);
      Alert.alert('Success', 'Password reset email sent!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6">
          <View className="flex-1 justify-center">
            {/* Logo and Title */}
            <View className="items-center mb-12">
              <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-6">
                <Text className="text-white text-2xl font-bold">SS</Text>
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                SynergySphere
              </Text>
              <Text className="text-lg text-gray-600 text-center">
                Welcome Back!
              </Text>
            </View>

            {/* Login Form */}
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email
                </Text>
                <TextInput
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                  placeholder="john.doe@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Password
                </Text>
                <TextInput
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text className="text-blue-600 text-right text-sm font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`w-full py-4 rounded-lg ${
                  isLoading ? 'bg-blue-400' : 'bg-blue-600'
                }`}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-600">
                Don&apos;t have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text className="text-blue-600 font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
