import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store';
import { Colors } from '@/constants/colors';

export default function Index() {
  const router = useRouter();
  const { isLoggedIn, hasSeenOnboarding } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasSeenOnboarding) {
        router.replace('/onboarding');
      } else if (!isLoggedIn) {
        router.replace('/(auth)/login');
      } else {
        router.replace('/(tabs)/home');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary },
});
