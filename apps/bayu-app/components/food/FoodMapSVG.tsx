import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Path, Circle, Defs, RadialGradient, Stop, G, Text as SvgText, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { FoodSpot } from '@/types';
import { foodCoordinates } from '@/data';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Stylised Sabah outline on a 320x400 canvas — approximates north Borneo
const SABAH_PATH = `
M 40 220
Q 55 195 80 190
Q 110 175 135 185
Q 155 168 175 160
Q 200 148 225 165
Q 255 180 275 195
Q 290 200 285 220
Q 290 240 275 255
Q 270 280 255 290
Q 245 305 230 300
Q 210 310 190 305
Q 165 310 145 300
Q 125 310 100 310
Q 75 315 60 300
Q 40 290 38 270
Q 32 250 40 220 Z
`;

interface PinProps {
  x: number;
  y: number;
  color: string;
  isActive: boolean;
  delay: number;
}

const AnimatedPin: React.FC<PinProps> = ({ x, y, color, isActive, delay }) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, [pulse]);

  const ring1 = useAnimatedProps(() => ({
    r: 10 + pulse.value * 18,
    opacity: (1 - pulse.value) * (isActive ? 0.9 : 0.5),
  }));

  return (
    <G>
      <AnimatedCircle cx={x} cy={y} fill={color} animatedProps={ring1} />
      <Circle cx={x} cy={y} r={isActive ? 12 : 8} fill={color} opacity={0.3} />
      <Circle cx={x} cy={y} r={isActive ? 8 : 5} fill={color} />
      <Circle cx={x} cy={y} r={2.5} fill="#FFFFFF" />
    </G>
  );
};

interface Props {
  spots: FoodSpot[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

const regionLabels: { text: string; x: number; y: number }[] = [
  { text: 'KOTA KINABALU', x: 115, y: 265 },
  { text: 'KUNDASANG', x: 175, y: 150 },
  { text: 'SEMPORNA', x: 245, y: 220 },
  { text: 'BEAUFORT', x: 85, y: 330 },
];

export const FoodMapSVG: React.FC<Props> = ({ spots, activeId, onSelect }) => {
  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={380} viewBox="0 0 320 400">
        <Defs>
          <SvgLinearGradient id="sea" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#CFEDF9" />
            <Stop offset="1" stopColor="#7DD3FC" />
          </SvgLinearGradient>
          <SvgLinearGradient id="land" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#E0F2FE" />
            <Stop offset="1" stopColor="#BAE6FD" />
          </SvgLinearGradient>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#2EAFE8" stopOpacity="0.4" />
            <Stop offset="1" stopColor="#2EAFE8" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Sea background */}
        <Circle cx={160} cy={200} r={260} fill="url(#sea)" opacity={0.25} />

        {/* Sabah silhouette */}
        <Path d={SABAH_PATH} fill="url(#land)" stroke={Colors.primary} strokeWidth={1} opacity={0.95} />

        {/* Region labels */}
        {regionLabels.map((r) => (
          <SvgText
            key={r.text}
            x={r.x}
            y={r.y}
            fill="#4A6178"
            fontSize={9}
            fontWeight="600"
            textAnchor="middle"
            opacity={0.6}
          >
            {r.text}
          </SvgText>
        ))}

        {/* Pins */}
        {spots.map((spot, i) => {
          const coord = foodCoordinates[spot.id];
          if (!coord) return null;
          const isActive = activeId === spot.id;
          const color = spot.tags.includes('viral-spot')
            ? Colors.error
            : spot.tags.includes('muslim-friendly')
              ? Colors.secondary
              : spot.tags.includes('local-gem')
                ? Colors.sunset
                : Colors.primary;
          return <AnimatedPin key={spot.id} x={coord.x} y={coord.y} color={color} isActive={isActive} delay={i * 120} />;
        })}
      </Svg>

      {/* Clickable pin overlay (Svg Pressables are unreliable in RN — overlay with absolute Pressable) */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        {spots.map((spot) => {
          const coord = foodCoordinates[spot.id];
          if (!coord) return null;
          // convert SVG 320x400 coords to relative % (scales automatically with width="100%")
          return (
            <Pressable
              key={spot.id}
              onPress={() => onSelect(spot.id)}
              style={({ pressed }) => [
                styles.pinHit,
                {
                  left: `${(coord.x / 320) * 100}%`,
                  top: `${(coord.y / 400) * 95}%`,
                  transform: [{ translateX: -18 }, { translateY: -18 }, { scale: pressed ? 0.9 : 1 }],
                },
              ]}
            />
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
          <Text style={styles.legendText}>Viral</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
          <Text style={styles.legendText}>Halal</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: Colors.sunset }]} />
          <Text style={styles.legendText}>Hidden Gem</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Tourist-friendly</Text>
        </View>
      </View>

      {/* Active count overlay */}
      <View style={styles.countPill}>
        <Ionicons name="restaurant" size={14} color={Colors.primary} />
        <Text style={styles.countText}>{spots.length} food spots</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#EFF8FE',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pinHit: { position: 'absolute', width: 36, height: 36, borderRadius: 18 },
  legend: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: 4,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.text,
  },
  countPill: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  countText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.text,
  },
});
