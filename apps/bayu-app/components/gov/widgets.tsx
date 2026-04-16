import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated as RNAnimated } from 'react-native';
import Svg, { Circle, G, Path, Line, Text as SvgText, LinearGradient, Stop, Defs } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
  FadeInDown,
  FadeOutUp,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import type { LiveBooking } from '@/types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// --- LiveCounter: number ticking up in real time ---------------------------
export function LiveCounter({ value, ratePerSec, format, style }: { value: number; ratePerSec: number; format?: (v: number) => string; style?: any }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const id = setInterval(() => {
      setDisplay((v) => v + Math.max(1, Math.round(ratePerSec * (0.7 + Math.random() * 0.6))));
    }, 1000);
    return () => clearInterval(id);
  }, [ratePerSec]);
  return <Text style={style}>{format ? format(display) : display.toLocaleString('en-MY')}</Text>;
}

// --- Live indicator dot (pulses red) ---------------------------------------
export function LiveDot({ color = '#F5362F', size = 8 }: { color?: string; size?: number }) {
  const opacity = useRef(new RNAnimated.Value(1)).current;
  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(opacity, { toValue: 0.25, duration: 700, useNativeDriver: true }),
        RNAnimated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <RNAnimated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity }} />
      <Text style={{ fontSize: 10, fontFamily: Typography.fonts.bodySemiBold, color, letterSpacing: 0.5 }}>LIVE</Text>
    </View>
  );
}

// --- Sparkline -------------------------------------------------------------
export function Sparkline({ data, width = 80, height = 28, color = Colors.primary, fill = true }: { data: number[]; width?: number; height?: number; color?: string; fill?: boolean }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${(i * step).toFixed(1)},${(height - ((v - min) / range) * height).toFixed(1)}`);
  const linePath = 'M ' + points.join(' L ');
  const fillPath = linePath + ` L ${width},${height} L 0,${height} Z`;
  return (
    <Svg width={width} height={height}>
      {fill && <Path d={fillPath} fill={color} fillOpacity={0.18} />}
      <Path d={linePath} stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// --- DonutChart ------------------------------------------------------------
export function DonutChart({
  segments,
  size = 160,
  thickness = 22,
  centerLabel,
  centerValue,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * radius;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;

  let offset = 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={radius} stroke={Colors.surface} strokeWidth={thickness} fill="none" />
        {segments.map((s, i) => {
          const len = (s.value / total) * circ;
          const rotation = `rotate(${(offset / circ) * 360 - 90} ${cx} ${cy})`;
          offset += len;
          return (
            <Circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              stroke={s.color}
              strokeWidth={thickness}
              fill="none"
              strokeDasharray={`${len} ${circ}`}
              strokeLinecap="butt"
              transform={rotation}
            />
          );
        })}
      </Svg>
      {(centerValue || centerLabel) && (
        <View style={{ position: 'absolute', alignItems: 'center' }}>
          {centerValue && <Text style={styles.donutValue}>{centerValue}</Text>}
          {centerLabel && <Text style={styles.donutLabel}>{centerLabel}</Text>}
        </View>
      )}
    </View>
  );
}

// --- SustainabilityGauge: circular progress --------------------------------
export function SustainabilityGauge({ score, size = 140 }: { score: number; size?: number }) {
  const thickness = 14;
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score / 100, { duration: 1500, easing: Easing.out(Easing.cubic) });
  }, [score]);

  const ap = useAnimatedProps(() => ({
    strokeDasharray: `${circ * progress.value} ${circ}`,
  }));

  const color = score >= 75 ? Colors.secondary : score >= 50 ? Colors.accent : Colors.error;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="gaugeFill" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={Colors.secondary} />
            <Stop offset="100%" stopColor="#34D399" />
          </LinearGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={radius} stroke={Colors.surfaceSecondary} strokeWidth={thickness} fill="none" />
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="url(#gaugeFill)"
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          animatedProps={ap}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={[styles.gaugeValue, { color }]}>{score}</Text>
        <Text style={styles.gaugeLabel}>/ 100</Text>
      </View>
    </View>
  );
}

// --- Peak season heatmap grid ----------------------------------------------
export function HeatmapGrid({
  data,
  categories,
}: {
  data: { month: string; categories: Record<string, number> }[];
  categories: string[];
}) {
  function heatColor(v: number) {
    const t = v / 100;
    // cool (low) to hot (high): light blue → sunset gold
    if (t < 0.5) {
      const tt = t * 2;
      return mix('#E8F1F8', '#F7B731', tt);
    } else {
      const tt = (t - 0.5) * 2;
      return mix('#F7B731', '#F5362F', tt);
    }
  }
  return (
    <View>
      {/* Header row */}
      <View style={styles.hmRow}>
        <View style={[styles.hmCell, styles.hmLabel]} />
        {data.map((d) => (
          <View key={d.month} style={[styles.hmCell, styles.hmHeader]}>
            <Text style={styles.hmMonth}>{d.month.slice(0, 1)}</Text>
          </View>
        ))}
      </View>
      {categories.map((cat) => (
        <View key={cat} style={styles.hmRow}>
          <View style={[styles.hmCell, styles.hmLabel]}>
            <Text style={styles.hmCatText} numberOfLines={1}>{cat}</Text>
          </View>
          {data.map((d) => {
            const v = d.categories[cat] ?? 0;
            return (
              <View key={d.month + cat} style={[styles.hmCell, { backgroundColor: heatColor(v) }]}>
                <Text style={[styles.hmVal, { color: v > 75 ? '#FFFFFF' : Colors.text }]}>{v}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function hex2rgb(h: string) {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = hex2rgb(a);
  const [r2, g2, b2] = hex2rgb(b);
  const h = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return '#' + h(r1 + (r2 - r1) * t) + h(g1 + (g2 - g1) * t) + h(b1 + (b2 - b1) * t);
}

// --- Live booking feed -----------------------------------------------------
export function LiveBookingFeed({ bookings }: { bookings: LiveBooking[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % bookings.length), 3200);
    return () => clearInterval(id);
  }, [bookings.length]);

  const tierColors: Record<string, string> = {
    budget: Colors.budget,
    comfort: Colors.comfort,
    luxury: Colors.luxury,
  };

  // Show 3 bookings starting at index, wrapping
  const visible = [0, 1, 2].map((offset) => bookings[(index + offset) % bookings.length]);

  return (
    <View style={styles.feedContainer}>
      {visible.map((b, i) => (
        <Animated.View
          key={`${b.id}-${index}-${i}`}
          entering={FadeInDown.duration(400).delay(i * 80)}
          style={styles.feedRow}
        >
          <View style={[styles.feedTier, { backgroundColor: tierColors[b.tier] }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.feedName} numberOfLines={1}>
              <Text style={styles.feedFlag}>{b.flag} </Text>
              {b.name} · {b.from}
            </Text>
            <Text style={styles.feedPackage} numberOfLines={1}>
              {b.package}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.feedAmount}>RM {b.amount.toLocaleString('en-MY')}</Text>
            <Text style={styles.feedTime}>{b.minutesAgo}m ago</Text>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

// --- Source market row -----------------------------------------------------
export function SourceMarketRow({
  flag,
  country,
  visitors,
  growth,
  avgSpend,
  max,
}: {
  flag: string;
  country: string;
  visitors: number;
  growth: number;
  avgSpend: number;
  max: number;
}) {
  const pct = (visitors / max) * 100;
  const growthColor = growth >= 0 ? Colors.secondary : Colors.error;
  return (
    <View style={styles.marketRow}>
      <Text style={styles.marketFlag}>{flag}</Text>
      <View style={{ flex: 1 }}>
        <View style={styles.marketHeader}>
          <Text style={styles.marketCountry} numberOfLines={1}>{country}</Text>
          <Text style={styles.marketVisitors}>{(visitors / 1000).toFixed(0)}K</Text>
        </View>
        <View style={styles.marketBarBg}>
          <View style={[styles.marketBarFill, { width: `${pct}%` }]} />
        </View>
        <View style={styles.marketMeta}>
          <Text style={[styles.marketGrowth, { color: growthColor }]}>
            {growth >= 0 ? '▲' : '▼'} {Math.abs(growth).toFixed(1)}% YoY
          </Text>
          <Text style={styles.marketSpend}>RM {avgSpend.toLocaleString('en-MY')} avg</Text>
        </View>
      </View>
    </View>
  );
}

// --- Dual-axis monthly trend chart ----------------------------------------
export function MonthlyTrendChart({
  data,
  height = 140,
}: {
  data: { month: string; visitors: number; revenue: number }[];
  height?: number;
}) {
  const width = 320; // internal viewbox
  const padL = 10;
  const padR = 10;
  const padB = 20;
  const padT = 8;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const maxV = Math.max(...data.map((d) => d.visitors));
  const maxR = Math.max(...data.map((d) => d.revenue));
  const barW = chartW / data.length;

  // Line path for revenue
  const linePoints = data.map((d, i) => {
    const x = padL + i * barW + barW / 2;
    const y = padT + chartH - (d.revenue / maxR) * chartH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const linePath = 'M ' + linePoints.join(' L ');

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={Colors.primaryLight} />
            <Stop offset="100%" stopColor={Colors.primary} />
          </LinearGradient>
        </Defs>
        {/* gridlines */}
        {[0, 0.5, 1].map((t) => (
          <Line key={t} x1={padL} y1={padT + chartH * (1 - t)} x2={width - padR} y2={padT + chartH * (1 - t)} stroke={Colors.borderLight} strokeWidth={0.5} />
        ))}
        {/* bars */}
        {data.map((d, i) => {
          const x = padL + i * barW + 2;
          const h = (d.visitors / maxV) * chartH;
          const y = padT + chartH - h;
          return <Path key={d.month} d={`M ${x} ${y + 2} Q ${x} ${y} ${x + 2} ${y} L ${x + barW - 6} ${y} Q ${x + barW - 4} ${y} ${x + barW - 4} ${y + 2} L ${x + barW - 4} ${y + h} L ${x} ${y + h} Z`} fill="url(#barFill)" />;
        })}
        {/* revenue line */}
        <Path d={linePath} stroke={Colors.accent} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = padL + i * barW + barW / 2;
          const y = padT + chartH - (d.revenue / maxR) * chartH;
          return <Circle key={d.month + 'p'} cx={x} cy={y} r={2.5} fill={Colors.accent} stroke="#FFFFFF" strokeWidth={1} />;
        })}
        {/* x labels */}
        {data.map((d, i) => (
          <SvgText key={d.month + 'l'} x={padL + i * barW + barW / 2} y={height - 6} fontSize={8} fill={Colors.textTertiary} textAnchor="middle">
            {d.month.slice(0, 1)}
          </SvgText>
        ))}
      </Svg>
      <View style={styles.trendLegend}>
        <View style={styles.trendLegendItem}>
          <View style={[styles.trendSwatch, { backgroundColor: Colors.primary }]} />
          <Text style={styles.trendLegendText}>Visitors</Text>
        </View>
        <View style={styles.trendLegendItem}>
          <View style={[styles.trendDash, { backgroundColor: Colors.accent }]} />
          <Text style={styles.trendLegendText}>Revenue (RM M)</Text>
        </View>
      </View>
    </View>
  );
}

// --- Styles ----------------------------------------------------------------
const styles = StyleSheet.create({
  donutValue: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  donutLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary, marginTop: -2 },
  gaugeValue: { fontSize: 36, fontFamily: Typography.fonts.headingBold, lineHeight: 40 },
  gaugeLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary, marginTop: -2 },

  hmRow: { flexDirection: 'row', gap: 2, marginBottom: 2 },
  hmCell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 3, minHeight: 22 },
  hmLabel: { flex: 2, aspectRatio: undefined, backgroundColor: 'transparent', alignItems: 'flex-start', paddingLeft: 0, minHeight: 22 },
  hmHeader: { backgroundColor: 'transparent' },
  hmCatText: { fontSize: 10, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  hmMonth: { fontSize: 10, fontFamily: Typography.fonts.bodyMedium, color: Colors.textTertiary },
  hmVal: { fontSize: 9, fontFamily: Typography.fonts.bodySemiBold },

  feedContainer: { gap: Spacing.sm },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
  },
  feedTier: { width: 4, height: 32, borderRadius: 2 },
  feedName: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  feedFlag: { fontSize: Typography.sizes.sm },
  feedPackage: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 1 },
  feedAmount: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.primary },
  feedTime: { fontSize: 10, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginTop: 1 },

  marketRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  marketFlag: { fontSize: 24 },
  marketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  marketCountry: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text, flex: 1 },
  marketVisitors: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.primary },
  marketBarBg: { height: 6, backgroundColor: Colors.surfaceSecondary, borderRadius: 3, overflow: 'hidden' },
  marketBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  marketMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  marketGrowth: { fontSize: 10, fontFamily: Typography.fonts.bodySemiBold },
  marketSpend: { fontSize: 10, fontFamily: Typography.fonts.body, color: Colors.textTertiary },

  trendLegend: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.base, marginTop: 4 },
  trendLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendSwatch: { width: 10, height: 10, borderRadius: 2 },
  trendDash: { width: 14, height: 2, borderRadius: 1 },
  trendLegendText: { fontSize: 10, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
});
