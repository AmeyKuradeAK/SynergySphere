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

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const user = await AuthService.signUp(email, password, name);
      setUser(user);
      router.replace('/(drawer)');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setIsLoading(false);
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
                Create your account
              </Text>
            </View>

            {/* Signup Form */}
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </Text>
                <TextInput
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                  placeholder="John Doe"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

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

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </Text>
                <TextInput
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                className={`w-full py-4 rounded-lg mt-6 ${
                  isLoading ? 'bg-blue-400' : 'bg-blue-600'
                }`}
                onPress={handleSignup}
                disabled={isLoading}
              >
                <Text className="text-white text-center text-lg font-semibold">
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="text-blue-600 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
