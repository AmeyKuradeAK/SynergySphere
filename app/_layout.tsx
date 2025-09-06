import '../global.css';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { AuthProvider } from '~/contexts/AuthProvider';
import { FloatingChatButton } from '~/components/FloatingChatButton';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        <Slot />
        <FloatingChatButton />
      </View>
    </AuthProvider>
  );
}
