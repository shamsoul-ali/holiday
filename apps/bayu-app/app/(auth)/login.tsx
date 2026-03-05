import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useAuthStore } from '@/store';
import { Button, Input } from '@/components/ui';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('ahmad@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await login(email, password);
    setLoading(false);
    router.replace('/(tabs)/home');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="earth" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.brandName}>Bayu</Text>
          <Text style={styles.tagline}>Sabah Smart Tourism</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            icon={<Ionicons name="mail-outline" size={20} color={Colors.textTertiary} />}
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} />}
          />

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button title="Log In" onPress={handleLogin} size="lg" fullWidth loading={loading} />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-google" size={22} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-apple" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.signUpText}> Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, paddingHorizontal: Spacing.xl },
  logoContainer: { alignItems: 'center', marginBottom: Spacing['3xl'] },
  logo: { width: 64, height: 64, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  brandName: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.headingBold, color: Colors.text },
  tagline: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: Spacing.xs },
  form: { flex: 1 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: Spacing.xl },
  forgotText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.primary },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { marginHorizontal: Spacing.md, fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textTertiary },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.base },
  socialBtn: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  signUpText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.primary },
});
