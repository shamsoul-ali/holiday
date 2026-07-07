import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAuthStore } from '@/store';
import { Button, Input } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Edit Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <Input label="Full Name" value={name} onChangeText={setName} />
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Button title="Save Changes" onPress={() => router.back()} size="lg" fullWidth style={{ marginTop: Spacing.lg }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base },
});
