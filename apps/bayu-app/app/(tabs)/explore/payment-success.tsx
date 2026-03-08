import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, BounceIn } from 'react-native-reanimated';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useTripStore, useBookingStore } from '@/store';
import { formatCurrency } from '@/utils';
import { hapticSuccess } from '@/utils';
import { Button } from '@/components/ui';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const confettiRef = useRef<any>(null);
  const { selectedPackage, resetWizard } = useTripStore();
  const { bookings } = useBookingStore();
  const latestBooking = bookings[0];

  useEffect(() => {
    hapticSuccess();
  }, []);

  const handleViewBooking = () => {
    resetWizard();
    router.replace('/(tabs)/bookings');
  };

  const handleViewJourney = () => {
    resetWizard();
    router.replace('/(tabs)/home/journey');
  };

  const handleGoHome = () => {
    resetWizard();
    router.replace('/(tabs)/home');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ConfettiCannon ref={confettiRef} count={100} origin={{ x: -10, y: 0 }} autoStart fadeOut />

      <View style={styles.content}>
        <Animated.View entering={BounceIn.delay(300)} style={styles.checkCircle}>
          <Ionicons name="checkmark" size={48} color="#FFFFFF" />
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(500)} style={styles.title}>Booking Confirmed!</Animated.Text>
        <Animated.Text entering={FadeInDown.delay(700)} style={styles.subtitle}>
          Your trip to {selectedPackage?.destination || 'your destination'} has been booked successfully.
        </Animated.Text>

        {latestBooking && (
          <Animated.View entering={FadeInDown.delay(900)} style={styles.refCard}>
            <Text style={styles.refLabel}>Booking Reference</Text>
            <Text style={styles.refValue}>{latestBooking.reference}</Text>
            <Text style={styles.refAmount}>{formatCurrency(latestBooking.totalCost)}</Text>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(1100)} style={styles.actions}>
          <Button title="View My Bookings" onPress={handleViewBooking} size="lg" fullWidth />
          <Button
            title="View My Journey"
            onPress={handleViewJourney}
            variant="outline"
            size="lg"
            fullWidth
            icon={<Ionicons name="map-outline" size={18} color={Colors.primary} />}
          />
          <Button title="Back to Home" onPress={handleGoHome} variant="outline" size="lg" fullWidth />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  checkCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  title: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.headingBold, color: Colors.text, marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: Spacing.xl },
  refCard: { alignItems: 'center', backgroundColor: Colors.surface, padding: Spacing.xl, borderRadius: 16, width: '100%', marginBottom: Spacing['2xl'] },
  refLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  refValue: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.headingBold, color: Colors.primary, marginTop: Spacing.xs, letterSpacing: 2 },
  refAmount: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.heading, color: Colors.text, marginTop: Spacing.sm },
  actions: { width: '100%', gap: Spacing.md },
});
