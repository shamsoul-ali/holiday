import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { SabahDestination } from '@/types';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';

const { width, height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  destination: SabahDestination;
  onClose: () => void;
}

export const ARPreviewModal: React.FC<Props> = ({ visible, destination, onClose }) => {
  const scan = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scan.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
      pulse.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }), -1, false);
    }
  }, [visible, scan, pulse]);

  const scanStyle = useAnimatedStyle(() => ({
    top: scan.value * (height - 200) + 100,
    opacity: 0.5 + (1 - Math.abs(scan.value - 0.5) * 2) * 0.5,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.3 }],
    opacity: 1 - pulse.value,
  }));

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.container}>
        <Image source={{ uri: destination.image }} style={styles.bg} contentFit="cover" />
        <LinearGradient
          colors={['rgba(9,109,187,0.45)', 'rgba(0,43,127,0.85)']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Scanner line */}
        <Animated.View style={[styles.scanLine, scanStyle]}>
          <LinearGradient
            colors={['transparent', '#FDE68A', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scanGradient}
          />
        </Animated.View>

        {/* Viewfinder corners */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        {/* Top bar */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.topBar}>
          <View style={styles.arPill}>
            <View style={styles.arDot} />
            <Text style={styles.arText}>AR PREVIEW · LIVE</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Central anchor */}
        <View style={styles.centralAnchor}>
          <Animated.View style={[styles.anchorPulse, pulseStyle]} />
          <View style={styles.anchorCore}>
            <Ionicons name="location" size={18} color="#FFFFFF" />
          </View>
        </View>

        {/* Info overlays */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.destLabel}>
          <Text style={styles.destLabelEyebrow}>AR ANCHOR DETECTED</Text>
          <Text style={styles.destLabelTitle}>{destination.name}</Text>
          <Text style={styles.destLabelDist}>{destination.district}, Sabah</Text>
        </Animated.View>

        {/* Data overlays */}
        <View style={styles.dataOverlays}>
          <Animated.View entering={FadeIn.delay(700).duration(400)} style={styles.dataTag}>
            <View style={styles.dataLine} />
            <View style={styles.dataCard}>
              <Ionicons name="water" size={12} color={Colors.ocean} />
              <Text style={styles.dataText}>Visibility 25m</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(900).duration(400)} style={[styles.dataTag, { right: Spacing.lg, left: 'auto', top: '38%' }]}>
            <View style={[styles.dataLine, { transform: [{ rotate: '-30deg' }] }]} />
            <View style={styles.dataCard}>
              <Ionicons name="people" size={12} color={Colors.sunset} />
              <Text style={styles.dataText}>Crowd: {destination.crowdLevel}</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(1100).duration(400)} style={[styles.dataTag, { bottom: 200, top: 'auto', left: Spacing.lg }]}>
            <View style={[styles.dataLine, { transform: [{ rotate: '45deg' }] }]} />
            <View style={styles.dataCard}>
              <Ionicons name="leaf" size={12} color={Colors.secondary} />
              <Text style={styles.dataText}>Eco {destination.ecoRating}/5</Text>
            </View>
          </Animated.View>
        </View>

        {/* Bottom hint */}
        <Animated.View entering={FadeInDown.delay(1300).duration(400)} style={styles.bottomHint}>
          <View style={styles.bottomCard}>
            <Ionicons name="phone-portrait-outline" size={14} color="#FFFFFF" />
            <Text style={styles.bottomText}>Move your phone to explore · Tap to anchor</Text>
          </View>
          <Text style={styles.betaTag}>AR BETA · Visual concept</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const CORNER = 28;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  bg: { ...StyleSheet.absoluteFillObject, opacity: 0.5 },

  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 60,
    zIndex: 5,
  },
  scanGradient: { flex: 1, opacity: 0.6 },

  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: '#FDE68A',
    borderWidth: 3,
  },
  cornerTL: { top: 110, left: 30, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 110, right: 30, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 200, left: 30, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 200, right: 30, borderLeftWidth: 0, borderTopWidth: 0 },

  topBar: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    zIndex: 10,
  },
  arPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  arDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FDE68A' },
  arText: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FDE68A',
    letterSpacing: 1.5,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  centralAnchor: {
    position: 'absolute',
    top: height / 2 - 40,
    left: width / 2 - 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anchorPulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDE68A',
  },
  anchorCore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
  },

  destLabel: {
    position: 'absolute',
    top: height / 2 + 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  destLabelEyebrow: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FDE68A',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  destLabelTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
  },
  destLabelDist: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodyMedium,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  dataOverlays: { ...StyleSheet.absoluteFillObject, pointerEvents: 'none' },
  dataTag: {
    position: 'absolute',
    left: Spacing.lg,
    top: '28%',
    alignItems: 'center',
  },
  dataLine: {
    width: 40,
    height: 1,
    backgroundColor: '#FDE68A',
    opacity: 0.6,
  },
  dataCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 4,
  },
  dataText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
    color: '#FFFFFF',
  },

  bottomHint: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  bottomText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
    color: '#FFFFFF',
  },
  betaTag: {
    marginTop: Spacing.sm,
    fontSize: 10,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
  },
});
