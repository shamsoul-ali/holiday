import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useTripStore } from '@/store';

const { width } = Dimensions.get('window');
const GLOBE_SIZE = 220;

const heroImages = [
  'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800',
  'https://images.unsplash.com/photo-1600586103402-4d1e0e05e1c5?w=800',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'https://images.unsplash.com/photo-1605552955090-56ca0a56e2ee?w=800',
];

const scanningStats = [
  { label: 'Flight routes', target: 247, icon: 'airplane', color: Colors.primary },
  { label: 'Dive operators', target: 42, icon: 'water', color: Colors.ocean },
  { label: 'Halal eateries', target: 187, icon: 'restaurant', color: Colors.secondary },
  { label: 'Live tide stations', target: 12, icon: 'analytics', color: Colors.sunset },
  { label: 'Weather forecasts', target: 5, icon: 'cloud', color: Colors.info },
  { label: 'Licensed guides', target: 89, icon: 'people', color: Colors.category.cultural },
];

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function LoadingScreen() {
  const router = useRouter();
  const { generateTrip, generationMessage, wizard } = useTripStore();
  const [imageIdx, setImageIdx] = useState(0);

  // Pulsing orb animation
  const orbPulse = useSharedValue(0);
  const orbSpin = useSharedValue(0);
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);

  useEffect(() => {
    orbPulse.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
    orbSpin.value = withRepeat(withTiming(360, { duration: 8000, easing: Easing.linear }), -1, false);
    ring1.value = withRepeat(withTiming(1, { duration: 2200 }), -1, false);
    ring2.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 800 }),
        withTiming(1, { duration: 2200 }),
      ),
      -1,
      false,
    );

    const imageTimer = setInterval(() => {
      setImageIdx((i) => (i + 1) % heroImages.length);
    }, 1800);

    const run = async () => {
      await generateTrip();
      router.replace('/(tabs)/explore/results');
    };
    run();

    return () => clearInterval(imageTimer);
  }, []);

  const orbCoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + orbPulse.value * 0.08 }],
  }));
  const orbSpinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbSpin.value}deg` }],
  }));
  const ring1Props = useAnimatedProps(() => ({
    r: 90 + ring1.value * 30,
    opacity: 1 - ring1.value,
  }));
  const ring2Props = useAnimatedProps(() => ({
    r: 90 + ring2.value * 40,
    opacity: (1 - ring2.value) * 0.6,
  }));

  const dest = wizard.destination || 'Sabah';
  const dur = wizard.duration || '3D2N';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#002B7F', '#096DBB', '#0A1628']}
        locations={[0, 0.5, 1]}
        style={styles.bg}
      />

      <View style={styles.orbWrap}>
        <Svg width={GLOBE_SIZE * 2} height={GLOBE_SIZE * 2} style={{ position: 'absolute' }}>
          <Defs>
            <RadialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#2EAFE8" stopOpacity="0.6" />
              <Stop offset="0.5" stopColor="#2EAFE8" stopOpacity="0.2" />
              <Stop offset="1" stopColor="#2EAFE8" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={GLOBE_SIZE} cy={GLOBE_SIZE} r={GLOBE_SIZE} fill="url(#orbGlow)" />
          <AnimatedCircle cx={GLOBE_SIZE} cy={GLOBE_SIZE} r={90} stroke="#2EAFE8" strokeWidth={1.5} fill="none" animatedProps={ring1Props} />
          <AnimatedCircle cx={GLOBE_SIZE} cy={GLOBE_SIZE} r={90} stroke="#FDE68A" strokeWidth={1.5} fill="none" animatedProps={ring2Props} />
        </Svg>

        <Animated.View style={[styles.orb, orbCoreStyle]}>
          <Animated.View style={[styles.orbRing, orbSpinStyle]}>
            <View style={styles.dashMark} />
          </Animated.View>

          {/* Rotating hero image window */}
          <View style={styles.orbCore}>
            <Animated.View
              key={imageIdx}
              entering={FadeIn.duration(450)}
              exiting={FadeOut.duration(450)}
              style={StyleSheet.absoluteFill}
            >
              <Image source={{ uri: heroImages[imageIdx] }} style={styles.orbImage} contentFit="cover" />
              <LinearGradient
                colors={['rgba(9,109,187,0.2)', 'rgba(9,109,187,0.7)']}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            <View style={styles.orbOverlay}>
              <Ionicons name="sparkles" size={28} color="#FFFFFF" />
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={styles.copyWrap}>
        <View style={styles.aiPill}>
          <View style={styles.aiLive} />
          <Text style={styles.aiPillText}>BAYU AI · LIVE</Text>
        </View>
        <Text style={styles.title}>Crafting your {dur} adventure</Text>
        <Text style={styles.destLine}>to {dest}</Text>

        <Animated.Text key={generationMessage} entering={FadeIn.duration(300)} style={styles.message}>
          {generationMessage || 'Initializing neural travel engine...'}
        </Animated.Text>
      </View>

      <View style={styles.statsGrid}>
        {scanningStats.map((s, i) => (
          <Animated.View
            key={s.label}
            entering={FadeIn.delay(i * 120).duration(500)}
            style={styles.statPill}
          >
            <Ionicons name={s.icon as any} size={13} color={s.color} />
            <Text style={styles.statNumber}>{s.target.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bg: { ...StyleSheet.absoluteFillObject },

  orbWrap: {
    width: GLOBE_SIZE * 2,
    height: GLOBE_SIZE * 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
  },
  orb: {
    width: GLOBE_SIZE,
    height: GLOBE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbRing: {
    position: 'absolute',
    width: GLOBE_SIZE,
    height: GLOBE_SIZE,
    borderRadius: GLOBE_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    borderTopColor: '#FDE68A',
  },
  dashMark: {
    position: 'absolute',
    top: -4,
    left: '50%',
    width: 8,
    height: 8,
    marginLeft: -4,
    borderRadius: 4,
    backgroundColor: '#FDE68A',
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  orbCore: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  orbImage: { width: '100%', height: '100%' },
  orbOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },

  copyWrap: { alignItems: 'center', paddingHorizontal: Spacing.xl, marginTop: -40 },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: Spacing.md,
  },
  aiLive: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FDE68A' },
  aiPillText: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FFFFFF',
    letterSpacing: 1.4,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  destLine: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.heading,
    color: '#FDE68A',
    marginTop: 2,
  },
  message: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    marginTop: Spacing.md,
    minHeight: 22,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: Spacing.base,
    marginTop: Spacing['2xl'],
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  statNumber: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.headingBold,
    color: '#FDE68A',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodyMedium,
    color: 'rgba(255,255,255,0.8)',
  },
});
