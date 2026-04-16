import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Path, Circle, G, Defs, RadialGradient, Stop, Text as SvgText, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { MALAYSIA_STATES, MALAYSIA_VIEWBOX } from '@/data/malaysia-map';
import { governmentStats, BKI_COORDS } from '@/data/government';
import type { FlightPath } from '@/types';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Pad viewBox to accommodate origin markers at edges
const VB_PAD_X = 20;
const VB_PAD_Y = 30;
const VB_W = MALAYSIA_VIEWBOX.width + VB_PAD_X * 2;
const VB_H = MALAYSIA_VIEWBOX.height + VB_PAD_Y * 2;
const VB_X = -VB_PAD_X;
const VB_Y = -VB_PAD_Y;

// --- Color helpers ---------------------------------------------------------
function hex2rgb(h: string) {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
function rgb2hex(r: number, g: number, b: number) {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return '#' + h(r) + h(g) + h(b);
}
function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = hex2rgb(a);
  const [r2, g2, b2] = hex2rgb(b);
  return rgb2hex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

// --- Flight path bezier ----------------------------------------------------
function bezierPath(x0: number, y0: number, x1: number, y1: number) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  // perpendicular lift, proportional to distance
  const nx = -dy / dist;
  const ny = dx / dist;
  const lift = Math.min(dist * 0.22, 70);
  const cx = mx + nx * lift;
  const cy = my + ny * lift - 5; // slight upward bias
  return `M ${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}`;
}

// --- Pulsing destination marker (BKI) --------------------------------------
function DestinationPulse({ cx, cy }: { cx: number; cy: number }) {
  const r1 = useSharedValue(10);
  const o1 = useSharedValue(0.5);
  const r2 = useSharedValue(10);
  const o2 = useSharedValue(0.5);

  useEffect(() => {
    r1.value = withRepeat(withTiming(40, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false);
    o1.value = withRepeat(withTiming(0, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false);
    // second wave delayed
    setTimeout(() => {
      r2.value = withRepeat(withTiming(40, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false);
      o2.value = withRepeat(withTiming(0, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false);
    }, 900);
  }, []);

  const ap1 = useAnimatedProps(() => ({ r: r1.value, opacity: o1.value }));
  const ap2 = useAnimatedProps(() => ({ r: r2.value, opacity: o2.value }));

  return (
    <G>
      <AnimatedCircle cx={cx} cy={cy} fill="#F7B731" animatedProps={ap1} />
      <AnimatedCircle cx={cx} cy={cy} fill="#F7B731" animatedProps={ap2} />
      <Circle cx={cx} cy={cy} r={7} fill="#F7B731" stroke="#FFFFFF" strokeWidth={1.5} />
      <Circle cx={cx} cy={cy} r={3} fill="#FFFFFF" />
    </G>
  );
}

// --- Origin marker (flag + pulse dot) --------------------------------------
function OriginMarker({ cx, cy, flag, label, size = 'sm' }: { cx: number; cy: number; flag: string; label: string; size?: 'sm' | 'md' }) {
  const r = useSharedValue(4);
  const o = useSharedValue(0.8);
  useEffect(() => {
    r.value = withRepeat(withTiming(14, { duration: 1600, easing: Easing.out(Easing.quad) }), -1, false);
    o.value = withRepeat(withTiming(0, { duration: 1600, easing: Easing.out(Easing.quad) }), -1, false);
  }, []);
  const ap = useAnimatedProps(() => ({ r: r.value, opacity: o.value }));

  // position label above or below based on y
  const below = cy < 50;
  const ty = below ? cy + 22 : cy - 10;

  return (
    <G>
      <AnimatedCircle cx={cx} cy={cy} fill={Colors.primaryLight} animatedProps={ap} />
      <Circle cx={cx} cy={cy} r={3.5} fill="#FFFFFF" stroke={Colors.primary} strokeWidth={1.2} />
      <SvgText x={cx} y={ty} fontSize={size === 'md' ? 12 : 10} fontWeight="700" fill={Colors.text} textAnchor="middle">
        {flag} {label}
      </SvgText>
    </G>
  );
}

// --- Animated flight path --------------------------------------------------
function FlightArc({ fp, delay }: { fp: FlightPath; delay: number }) {
  const d = useMemo(() => bezierPath(fp.x0, fp.y0, BKI_COORDS.x, BKI_COORDS.y), [fp]);
  const offset = useSharedValue(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      offset.value = withRepeat(withTiming(-32, { duration: 1400, easing: Easing.linear }), -1, false);
    }, delay);
    return () => clearTimeout(timeout);
  }, []);
  const ap = useAnimatedProps(() => ({ strokeDashoffset: offset.value }));

  return (
    <G>
      {/* faint base line */}
      <Path d={d} stroke={Colors.primary} strokeWidth={0.6} strokeOpacity={0.15} fill="none" />
      {/* animated dashed line */}
      <AnimatedPath d={d} stroke={Colors.accent} strokeWidth={1.4} fill="none" strokeDasharray="5 6" animatedProps={ap} />
    </G>
  );
}

// --- Main MalaysiaMap ------------------------------------------------------
interface Props {
  onStateSelect?: (stateId: string) => void;
}

export const MalaysiaMap: React.FC<Props> = ({ onStateSelect }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const maxOrigin = useMemo(
    () => Math.max(...governmentStats.domesticOrigins.map((o) => o.visitors)),
    []
  );
  const originMap = useMemo(() => {
    const m: Record<string, number> = {};
    governmentStats.domesticOrigins.forEach((o) => (m[o.stateCode] = o.visitors));
    return m;
  }, []);

  function stateFill(stateId: string) {
    if (stateId === 'MY12') return '#F7B731'; // Sabah = destination gold
    const v = originMap[stateId] ?? 0;
    if (v === 0) return '#E8F1F8';
    const t = Math.pow(v / maxOrigin, 0.7); // nonlinear for contrast
    return mix('#D1E3EF', '#002B7F', t);
  }

  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%" viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <RadialGradient id="sabahGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#F7B731" stopOpacity="0.55" />
            <Stop offset="100%" stopColor="#F7B731" stopOpacity="0" />
          </RadialGradient>
          <SvgLinearGradient id="seaBG" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#F0F7FB" />
            <Stop offset="100%" stopColor="#E8F1F8" />
          </SvgLinearGradient>
        </Defs>

        {/* Sea background */}
        <Path d={`M ${VB_X} ${VB_Y} h ${VB_W} v ${VB_H} h -${VB_W} Z`} fill="url(#seaBG)" />

        {/* Sabah glow aura */}
        <Circle cx={BKI_COORDS.x} cy={BKI_COORDS.y} r={80} fill="url(#sabahGlow)" />

        {/* State paths */}
        <G>
          {MALAYSIA_STATES.map((s) => (
            <Path
              key={s.id}
              d={s.d}
              fill={stateFill(s.id)}
              stroke="#FFFFFF"
              strokeWidth={selected === s.id ? 1.6 : 0.6}
              opacity={selected && selected !== s.id ? 0.55 : 1}
              onPress={() => {
                setSelected(s.id);
                onStateSelect?.(s.id);
              }}
            />
          ))}
        </G>

        {/* Flight paths — staggered delays */}
        <G>
          {governmentStats.flightPaths.map((fp, i) => (
            <FlightArc key={fp.id} fp={fp} delay={i * 180} />
          ))}
        </G>

        {/* Origin markers */}
        <G>
          {governmentStats.flightPaths.map((fp) => (
            <OriginMarker key={fp.id} cx={fp.x0} cy={fp.y0} flag={fp.flag} label={fp.originLabel} />
          ))}
        </G>

        {/* BKI destination */}
        <DestinationPulse cx={BKI_COORDS.x} cy={BKI_COORDS.y} />
        <SvgText
          x={BKI_COORDS.x}
          y={BKI_COORDS.y - 20}
          fontSize={13}
          fontWeight="700"
          fill="#002B7F"
          textAnchor="middle"
        >
          🏝️ Sabah · BKI
        </SvgText>
      </Svg>

      {/* Legend overlay */}
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={[styles.legendSwatch, { backgroundColor: '#D1E3EF' }]} />
          <View style={[styles.legendSwatch, { backgroundColor: '#6795C4' }]} />
          <View style={[styles.legendSwatch, { backgroundColor: '#002B7F' }]} />
          <Text style={styles.legendText}>Visitors from</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#F7B731' }]} />
          <Text style={styles.legendText}>Sabah (destination)</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendDash} />
          <Text style={styles.legendText}>Live flight routes</Text>
        </View>
      </View>

      {/* Selected state info */}
      {selected && (
        <Pressable onPress={() => setSelected(null)} style={styles.selectedCard}>
          <SelectedStateInfo stateId={selected} />
        </Pressable>
      )}
    </View>
  );
};

function SelectedStateInfo({ stateId }: { stateId: string }) {
  const state = MALAYSIA_STATES.find((s) => s.id === stateId);
  const origin = governmentStats.domesticOrigins.find((o) => o.stateCode === stateId);
  if (!state) return null;
  const isSabah = stateId === 'MY12';
  return (
    <View style={styles.selectedInner}>
      <Text style={styles.selectedName}>{state.name}</Text>
      {isSabah ? (
        <Text style={styles.selectedSub}>Destination · {(governmentStats.totalVisitors / 1_000_000).toFixed(2)}M visitors/yr</Text>
      ) : origin && origin.visitors > 0 ? (
        <Text style={styles.selectedSub}>→ Sabah: {origin.visitors.toLocaleString('en-MY')} visitors/yr</Text>
      ) : (
        <Text style={styles.selectedSub}>No outbound-to-Sabah data</Text>
      )}
      <Text style={styles.selectedHint}>Tap to dismiss</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: VB_W / VB_H,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  legend: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendSwatch: { width: 10, height: 10, borderRadius: 2 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendDash: { width: 14, height: 2, backgroundColor: Colors.accent, borderRadius: 1 },
  legendText: { fontSize: 9, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary, marginLeft: 4 },
  selectedCard: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: '55%',
  },
  selectedInner: { gap: 2 },
  selectedName: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  selectedSub: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.primary },
  selectedHint: { fontSize: 9, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginTop: 2 },
});
