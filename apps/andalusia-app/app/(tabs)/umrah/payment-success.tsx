import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useBookingStore, useUmrahStore } from '@/store';
import { Button } from '@/components/ui';
import { hapticSuccess } from '@/utils';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const confettiRef = useRef<any>(null);
  const { bookings } = useBookingStore();
  const { resetWizard } = useUmrahStore();
  const latestBooking = bookings[0];

  useEffect(() => {
    hapticSuccess();
    confettiRef.current?.start();
  }, []);

  const handleDone = () => {
    resetWizard();
    router.replace('/(tabs)/home');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}>
      <ConfettiCannon ref={confettiRef} count={100} origin={{ x: -10, y: 0 }} fadeOut autoStart={false} colors={[Colors.primary, Colors.secondary, Colors.premium, '#10B981']} />

      <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Alhamdulillah!</Text>
        <Text style={styles.subtitle}>Tempahan anda berjaya</Text>

        <View style={styles.refCard}>
          <Text style={styles.refLabel}>Rujukan Tempahan</Text>
          <Text style={styles.refValue}>{latestBooking?.reference || 'AD-XXXXXX'}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pakej</Text>
            <Text style={styles.infoValue}>{latestBooking?.packageTitle}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mutawif</Text>
            <Text style={styles.infoValue}>{latestBooking?.mutawifName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status Visa</Text>
            <Text style={styles.infoValue}>Akan diproses</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.whatsappBtn}>
          <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          <Text style={styles.whatsappText}>Sertai Kumpulan WhatsApp</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.footer}>
        <Button title="Lihat Tempahan" onPress={() => { resetWizard(); router.replace('/(tabs)/bookings'); }} variant="outline" size="lg" fullWidth />
        <Button title="Kembali ke Beranda" onPress={handleDone} size="lg" fullWidth style={{ marginTop: Spacing.sm }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.xl },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { marginBottom: Spacing.lg },
  title: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.headingBold, color: Colors.primary, marginBottom: Spacing.xs },
  subtitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginBottom: Spacing.xl },
  refCard: { alignItems: 'center', backgroundColor: Colors.primary + '10', padding: Spacing.lg, borderRadius: BorderRadius.lg, width: '100%', marginBottom: Spacing.lg },
  refLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  refValue: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: Colors.primary, letterSpacing: 2, marginTop: 4 },
  infoCard: { width: '100%', backgroundColor: Colors.surface, padding: Spacing.base, borderRadius: BorderRadius.lg, gap: Spacing.sm, marginBottom: Spacing.lg },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  infoValue: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  whatsappBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.lg, backgroundColor: '#25D366' + '15' },
  whatsappText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodyMedium, color: '#25D366' },
  footer: { width: '100%' },
});
