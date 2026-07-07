import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Dimensions, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 4000;

interface StorySlide {
  image: string;
  title: string;
  caption: string;
  eyebrow: string;
  cta?: string;
}

interface Story {
  id: string;
  title: string;
  cover: string;
  accent: string;
  slides: StorySlide[];
}

const stories: Story[] = [
  {
    id: 's1',
    title: 'Today in Semporna',
    cover: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=400',
    accent: '#096DBB',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
        title: 'Crystal visibility',
        caption: '25m visibility at Sipadan today — barracuda tornado spotted',
        eyebrow: 'LIVE FROM SEMPORNA',
      },
      {
        image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800',
        title: 'Mabul macro heaven',
        caption: 'Blue-ringed octopus sighting on house reef night dive',
        eyebrow: 'UPDATE · 2H AGO',
      },
      {
        image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800',
        title: 'Book this weekend',
        caption: 'Kapalai overwater villas at 20% off — 4 rooms left',
        eyebrow: 'FLASH OFFER',
        cta: 'Book now',
      },
    ],
  },
  {
    id: 's2',
    title: 'Kinabalu sunrise',
    cover: 'https://images.unsplash.com/photo-1600586103402-4d1e0e05e1c5?w=400',
    accent: '#F7B731',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1600586103402-4d1e0e05e1c5?w=800',
        title: 'Clear window confirmed',
        caption: 'Next 3 days 70% chance of summit view — rare for April',
        eyebrow: 'WEATHER UPDATE',
      },
      {
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        title: 'Kundasang highland',
        caption: 'Dairy farm in full bloom · 18°C crisp mornings',
        eyebrow: 'TRENDING',
      },
    ],
  },
  {
    id: 's3',
    title: 'Wildlife alerts',
    cover: 'https://images.unsplash.com/photo-1605552955090-56ca0a56e2ee?w=400',
    accent: '#059669',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
        title: 'Pygmy elephant herd',
        caption: 'Spotted 3km upstream of Sukau village 20 min ago',
        eyebrow: 'LIVE SIGHTING',
      },
      {
        image: 'https://images.unsplash.com/photo-1605552955090-56ca0a56e2ee?w=800',
        title: 'Orangutan feeding',
        caption: 'Morning platform — 11 rehabilitant orangutans observed',
        eyebrow: 'SEPILOK · TODAY',
      },
    ],
  },
  {
    id: 's4',
    title: 'Food trending',
    cover: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
    accent: '#F5362F',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
        title: 'Alu-Alu Kitchen',
        caption: "Butter prawns voted #1 by this week's 1.2k diners",
        eyebrow: 'VIRAL SPOT',
      },
      {
        image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800',
        title: 'Semporna Ocean King',
        caption: 'Mantis shrimp season is peak — locals recommend 11am arrival',
        eyebrow: 'LOCAL TIP',
      },
    ],
  },
  {
    id: 's5',
    title: 'Eco highlights',
    cover: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400',
    accent: '#10B981',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800',
        title: 'Danum Valley rainforest',
        caption: "130 million years old — Borneo's last untouched frontier",
        eyebrow: 'ECO FEATURED',
      },
    ],
  },
];

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ story, onClose, onNext, onPrev }) => {
  const [slideIdx, setSlideIdx] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: STORY_DURATION, easing: Easing.linear });
    const t = setTimeout(() => {
      if (slideIdx < story.slides.length - 1) {
        setSlideIdx(slideIdx + 1);
      } else {
        onNext();
      }
    }, STORY_DURATION);
    return () => clearTimeout(t);
  }, [slideIdx, story.id]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
  }));

  const slide = story.slides[slideIdx];

  const tapSide = (side: 'left' | 'right') => {
    if (side === 'left' && slideIdx > 0) setSlideIdx(slideIdx - 1);
    else if (side === 'left' && slideIdx === 0) onPrev();
    else if (side === 'right' && slideIdx < story.slides.length - 1) setSlideIdx(slideIdx + 1);
    else onNext();
  };

  return (
    <View style={viewerStyles.container}>
      <Image source={{ uri: slide.image }} style={StyleSheet.absoluteFillObject} contentFit="cover" transition={200} />
      <LinearGradient
        colors={['rgba(0,0,0,0.65)', 'transparent', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Progress bars */}
      <View style={viewerStyles.progressRow}>
        {story.slides.map((_, i) => (
          <View key={i} style={viewerStyles.progressTrack}>
            <Animated.View
              style={[
                viewerStyles.progressFill,
                i < slideIdx && { width: '100%' as any },
                i === slideIdx && barStyle,
              ]}
            />
          </View>
        ))}
      </View>

      {/* Header */}
      <View style={viewerStyles.header}>
        <View style={[viewerStyles.avatarOuter, { borderColor: story.accent }]}>
          <Image source={{ uri: story.cover }} style={viewerStyles.avatar} contentFit="cover" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={viewerStyles.handle}>{story.title}</Text>
          <Text style={viewerStyles.sub}>Bayu Live · now</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={viewerStyles.closeBtn}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tap zones */}
      <Pressable style={viewerStyles.tapLeft} onPress={() => tapSide('left')} />
      <Pressable style={viewerStyles.tapRight} onPress={() => tapSide('right')} />

      {/* Content */}
      <Animated.View key={slideIdx} entering={FadeIn.duration(300)} style={viewerStyles.body}>
        <Text style={[viewerStyles.eyebrow, { color: story.accent }]}>{slide.eyebrow}</Text>
        <Text style={viewerStyles.title}>{slide.title}</Text>
        <Text style={viewerStyles.caption}>{slide.caption}</Text>
        {slide.cta && (
          <TouchableOpacity style={[viewerStyles.ctaBtn, { backgroundColor: story.accent }]}>
            <Text style={viewerStyles.ctaText}>{slide.cta}</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

export const StoriesRow: React.FC = () => {
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);

  const openAt = (idx: number) => setViewerIdx(idx);
  const close = () => setViewerIdx(null);
  const next = () => {
    if (viewerIdx === null) return;
    if (viewerIdx < stories.length - 1) setViewerIdx(viewerIdx + 1);
    else close();
  };
  const prev = () => {
    if (viewerIdx === null) return;
    if (viewerIdx > 0) setViewerIdx(viewerIdx - 1);
    else close();
  };

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={styles.scroll}
      >
        {stories.map((s, i) => (
          <TouchableOpacity key={s.id} activeOpacity={0.85} onPress={() => openAt(i)} style={styles.storyCell}>
            <LinearGradient
              colors={[s.accent, '#FDE68A'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ring}
            >
              <View style={styles.ringInner}>
                <Image source={{ uri: s.cover }} style={styles.cover} contentFit="cover" />
              </View>
            </LinearGradient>
            <Text style={styles.label} numberOfLines={2}>{s.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={viewerIdx !== null} animationType="fade" presentationStyle="fullScreen" onRequestClose={close}>
        {viewerIdx !== null && (
          <StoryViewer
            story={stories[viewerIdx]}
            onClose={close}
            onNext={next}
            onPrev={prev}
          />
        )}
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  scroll: { marginTop: Spacing.md },
  row: { paddingHorizontal: Spacing.base, gap: Spacing.sm },
  storyCell: { width: 72, alignItems: 'center' },
  ring: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#000',
  },
  cover: { width: '100%', height: '100%' },
  label: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 5,
  },
});

const viewerStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  progressRow: {
    position: 'absolute',
    top: 50,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },

  header: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    zIndex: 10,
  },
  avatarOuter: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    padding: 1.5,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 19 },
  handle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FFFFFF',
  },
  sub: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.75)',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tapLeft: { position: 'absolute', top: 0, bottom: 0, left: 0, width: width / 3 },
  tapRight: { position: 'absolute', top: 0, bottom: 0, right: 0, width: (width * 2) / 3 },

  body: {
    position: 'absolute',
    bottom: 60,
    left: Spacing.lg,
    right: Spacing.lg,
    gap: 6,
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodySemiBold,
    letterSpacing: 1.4,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
    lineHeight: Typography.sizes['2xl'] * 1.15,
  },
  caption: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: Typography.sizes.base * 1.4,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  ctaText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FFFFFF',
  },
});
