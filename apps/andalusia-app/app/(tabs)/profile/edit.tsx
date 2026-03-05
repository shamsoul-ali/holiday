import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAuthStore } from '@/store';
import { Button, Input } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  return (
    <View style={styles.container}>
      <ScreenHeader title="Edit Profil" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        <Input label="Nama Penuh" value={name} onChangeText={setName} icon={<Ionicons name="person-outline" size={20} color={Colors.textTertiary} />} />
        <Input label="Emel" value={email} onChangeText={setEmail} keyboardType="email-address" icon={<Ionicons name="mail-outline" size={20} color={Colors.textTertiary} />} />
        <Input label="Telefon" value={phone} onChangeText={setPhone} keyboardType="phone-pad" icon={<Ionicons name="call-outline" size={20} color={Colors.textTertiary} />} />
        <Input label="No. IC" value={user?.icNumber || ''} onChangeText={() => {}} icon={<Ionicons name="card-outline" size={20} color={Colors.textTertiary} />} />
        <Input label="No. Pasport" value={user?.passportNumber || ''} onChangeText={() => {}} icon={<Ionicons name="document-outline" size={20} color={Colors.textTertiary} />} />
        <Button title="Simpan" onPress={() => {}} size="lg" fullWidth style={{ marginTop: Spacing.lg }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl },
});
