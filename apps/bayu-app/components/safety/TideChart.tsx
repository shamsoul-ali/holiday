import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { TidePoint } from '@/types';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';

interface Props {
  data: TidePoint[];
  currentHour?: number;
  width?: number;
  height?: number;
}

export const TideChart: React.FC<Props> = ({ data, currentHour = 3, width = 320, height = 120 }) => {
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.heightM));
  const min = Math.min(...data.map((d) => d.heightM));
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const toY = (v: number) => height - ((v - min) / range) * (height - 20) - 10;

  const points = data.map((d, i) => ({ x: i * step, y: toY(d.heightM), v: d.heightM, hour: d.hour }));
  const linePath = 'M ' + points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ');
  const fillPath = linePath + ` L ${width},${height} L 0,${height} Z`;

  const maxIdx = points.findIndex((p) => p.v === max);
  const minIdx = points.findIndex((p) => p.v === min);
  const currentIdx = Math.min(currentHour, points.length - 1);
  const current = points[currentIdx];

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Tide · next 12 hours</Text>
          <Text style={styles.value}>{data[currentIdx].heightM.toFixed(1)}m</Text>
        </View>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>High</Text>
            <Text style={styles.statValue}>{max.toFixed(1)}m</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Low</Text>
            <Text style={styles.statValue}>{min.toFixed(1)}m</Text>
          </View>
        </View>
      </View>

      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="tideFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.ocean} stopOpacity="0.28" />
            <Stop offset="1" stopColor={Colors.ocean} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={fillPath} fill="url(#tideFill)" />
        <Path d={linePath} stroke={Colors.ocean} strokeWidth={2.5} fill="none" />

        {/* Current hour indicator line */}
        <Line x1={current.x} y1={8} x2={current.x} y2={height - 8} stroke={Colors.ocean} strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />
        <Circle cx={current.x} cy={current.y} r={8} fill={Colors.ocean} opacity={0.2} />
        <Circle cx={current.x} cy={current.y} r={4.5} fill={Colors.ocean} />

        {/* High marker */}
        <Circle cx={points[maxIdx].x} cy={points[maxIdx].y} r={3} fill={Colors.error} />
        <Circle cx={points[minIdx].x} cy={points[minIdx].y} r={3} fill={Colors.sky} />
      </Svg>

      <View style={styles.xAxis}>
        <Text style={styles.axisLabel}>Now</Text>
        <Text style={styles.axisLabel}>+3h</Text>
        <Text style={styles.axisLabel}>+6h</Text>
        <Text style={styles.axisLabel}>+9h</Text>
        <Text style={styles.axisLabel}>+12h</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  label: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.bodyMedium, color: Colors.textTertiary, letterSpacing: 0.5, textTransform: 'uppercase' },
  value: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: Colors.ocean, marginTop: 2 },
  stats: { flexDirection: 'row', gap: Spacing.lg },
  stat: { alignItems: 'flex-end' },
  statLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary },
  statValue: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, marginTop: 2 },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs },
  axisLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary },
});
