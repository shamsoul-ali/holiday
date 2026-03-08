import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
    title: 'Discover Sabah',
    description: 'Explore pristine islands, dive Sipadan, conquer Mount Kinabalu — all powered by AI planning.',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
    title: 'AI Travel Concierge',
    description: 'Smart trip planning, real-time crowd monitoring, and verified local guides — your personal Sabah assistant.',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    title: 'Travel with Confidence',
    description: 'Safety alerts, tide updates, verified agents, and secure payments. Explore Sabah worry-free.',
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
    <View style={[styles.slide, { width }]}>
      <Image source={{ uri: item.image }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0.3 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={styles.textContainer}>
        <Animated.Text entering={FadeInDown.delay(200).duration(600)} style={styles.title}>{item.title}</Animated.Text>
        <Animated.Text entering={FadeInDown.delay(400).duration(600)} style={styles.description}>{item.description}</Animated.Text>
      </View>
    </View>
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
  container: { flex: 1, backgroundColor: '#000' },
  skipBtn: { position: 'absolute', right: Spacing.lg, zIndex: 10 },
  skipText: { color: 'rgba(255,255,255,0.8)', fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodyMedium },
  slide: { flex: 1, height },
  textContainer: { position: 'absolute', bottom: 180, left: 0, right: 0, paddingHorizontal: Spacing['2xl'] },
  title: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', textAlign: 'center', marginBottom: Spacing.base },
  description: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 24 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.lg, gap: Spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { width: 24, backgroundColor: '#FFFFFF' },
});
