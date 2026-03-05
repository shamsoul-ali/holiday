import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'earth' as const,
    title: 'Discover Sabah',
    description: 'Explore pristine islands, dive Sipadan, conquer Mount Kinabalu — all powered by AI planning.',
    gradient: ['#0891b2', '#06B6D4'] as const,
  },
  {
    id: '2',
    icon: 'sparkles' as const,
    title: 'AI Concierge',
    description: 'Smart trip planning, real-time crowd monitoring, and verified local guides — your personal Sabah assistant.',
    gradient: ['#059669', '#10B981'] as const,
  },
  {
    id: '3',
    icon: 'shield-checkmark' as const,
    title: 'Travel with Confidence',
    description: 'Safety alerts, tide updates, verified agents, and secure payments. Explore Sabah worry-free.',
    gradient: ['#d97706', '#F59E0B'] as const,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setHasSeenOnboarding } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      setHasSeenOnboarding(true);
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    setHasSeenOnboarding(true);
    router.replace('/(auth)/login');
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <LinearGradient colors={[...item.gradient]} style={[styles.slide, { width }]}>
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.iconContainer}>
        <Ionicons name={item.icon} size={80} color="rgba(255,255,255,0.9)" />
      </Animated.View>
      <Animated.Text entering={FadeInDown.delay(400).duration(600)} style={styles.title}>{item.title}</Animated.Text>
      <Animated.Text entering={FadeInDown.delay(600).duration(600)} style={styles.description}>{item.description}</Animated.Text>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.skipBtn, { top: insets.top + Spacing.sm }]} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>
        <Button
          title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          size="lg"
          fullWidth
          style={{ backgroundColor: Colors.background }}
          textStyle={{ color: Colors.primary }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  skipBtn: { position: 'absolute', right: Spacing.lg, zIndex: 10 },
  skipText: { color: 'rgba(255,255,255,0.8)', fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodyMedium },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing['2xl'] },
  iconContainer: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing['2xl'] },
  title: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', textAlign: 'center', marginBottom: Spacing.base },
  description: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.lg, gap: Spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { width: 24, backgroundColor: '#FFFFFF' },
});
