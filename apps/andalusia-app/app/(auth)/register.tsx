import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useAuthStore } from '@/store';
import { Button, Input } from '@/components/ui';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    await login(email, password);
    setLoading(false);
    router.replace('/(tabs)/home');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Daftar Akaun</Text>
        <Text style={styles.subtitle}>Mulakan perjalanan umrah impian anda</Text>

        <View style={styles.form}>
          <Input label="Nama Penuh" placeholder="Masukkan nama anda" value={name} onChangeText={setName} icon={<Ionicons name="person-outline" size={20} color={Colors.textTertiary} />} />
          <Input label="Emel" placeholder="Masukkan emel anda" value={email} onChangeText={setEmail} keyboardType="email-address" icon={<Ionicons name="mail-outline" size={20} color={Colors.textTertiary} />} />
          <Input label="Kata Laluan" placeholder="Cipta kata laluan" value={password} onChangeText={setPassword} secureTextEntry icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} />} />

          <Button title="Daftar Sekarang" onPress={handleRegister} size="lg" fullWidth loading={loading} style={{ marginTop: Spacing.lg }} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Sudah ada akaun?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginText}> Masuk</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, paddingHorizontal: Spacing.xl },
  backBtn: { width: 40, height: 40, justifyContent: 'center', marginBottom: Spacing.lg },
  title: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.headingBold, color: Colors.text, marginBottom: Spacing.xs },
  subtitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginBottom: Spacing['2xl'] },
  form: { flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  loginText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.primary },
});
