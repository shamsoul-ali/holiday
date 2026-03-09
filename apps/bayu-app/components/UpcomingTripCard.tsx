import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { Booking, Itinerary } from '@/types';
import { Badge } from '@/components/ui';

interface UpcomingTripCardProps {
  booking: Booking;
  itinerary: Itinerary;
  onPress: () => void;
}

export const UpcomingTripCard: React.FC<UpcomingTripCardProps> = ({ booking, itinerary, onPress }) => {
  const now = new Date();
  const start = new Date(booking.startDate);
  const daysToGo = Math.ceil((start.getTime() - now.getTime()) / 86400000);

  const countdownText = daysToGo > 0
    ? `${daysToGo} days to go`
    : daysToGo === 0
      ? 'Departing today!'
      : 'Trip in progress';

  const totalDays = itinerary.days.length;
  const totalNights = totalDays - 1;
  const totalTravelers = itinerary.travelers.adults + itinerary.travelers.children + itinerary.travelers.infants;

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(500)}>
      <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
        <Image source={{ uri: booking.image }} style={styles.image} contentFit="cover" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.overlay}>
          {/* Top badges */}
          <View style={styles.topRow}>
            <View style={styles.upcomingBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#fff" />
              <Text style={styles.upcomingText}>Upcoming</Text>
            </View>
            <View style={styles.countdownBadge}>
              <Ionicons name="time-outline" size={12} color="#fff" />
              <Text style={styles.countdownText}>{countdownText}</Text>
            </View>
          </View>

          {/* Bottom info */}
          <View style={styles.bottomContent}>
            <Text style={styles.destination}>{booking.destination}</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="airplane" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.infoText}>
                  {itinerary.flight.departure.code} → {itinerary.flight.arrival.code}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.infoText}>{totalDays}D{totalNights}N</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="people-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.infoText}>{totalTravelers} pax</Text>
              </View>
            </View>
            <Text style={styles.reference}>Ref: {booking.reference}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 180,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: Spacing.base,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  upcomingText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#fff',
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  countdownText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#fff',
  },
  bottomContent: {
    gap: Spacing.xs,
  },
  destination: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.headingBold,
    color: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodyMedium,
    color: 'rgba(255,255,255,0.9)',
  },
  reference: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.6)',
  },
});
