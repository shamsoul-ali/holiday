import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { SabahDestination, CrowdLevel } from '@/types';
import { sabahDestinations } from '@/data';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';

interface Props {
  visible: boolean;
  destinationId: string | null;
  onClose: () => void;
}

const crowdColors: Record<CrowdLevel, string> = {
  low: Colors.success,
  moderate: Colors.warning,
  high: Colors.sunset,
  'very-high': Colors.error,
};

const crowdLabels: Record<CrowdLevel, string> = {
  low: 'Quiet',
  moderate: 'Steady',
  high: 'Busy',
  'very-high': 'Peak',
};

export const DestinationCompareModal: React.FC<Props> = ({ visible, destinationId, onClose }) => {
  const left = destinationId ? sabahDestinations.find((d) => d.id === destinationId) : undefined;
  const [rightId, setRightId] = useState<string | null>(null);
  const right = rightId ? sabahDestinations.find((d) => d.id === rightId) : undefined;

  if (!left) return null;

  const alternatives = sabahDestinations.filter((d) => d.id !== left.id);

  const renderCell = (dest: SabahDestination | undefined, isLeft: boolean) => {
    if (!dest) {
      return (
        <View style={[styles.cell, styles.emptyCell]}>
          <Ionicons name="add-circle-outline" size={36} color={Colors.textTertiary} />
          <Text style={styles.emptyLabel}>Pick a destination{'\n'}to compare</Text>
        </View>
      );
    }

    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.cell}>
        <View style={styles.cellHero}>
          <Image source={{ uri: dest.image }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={StyleSheet.absoluteFillObject} />
          <View style={styles.cellHeroTag}>
            <Ionicons name="location" size={10} color="#FFFFFF" />
            <Text style={styles.cellHeroTagText}>{dest.district}</Text>
          </View>
          <View style={styles.cellHeroBottom}>
            <Text style={styles.cellTitle} numberOfLines={1}>{dest.name}</Text>
            <View style={styles.cellRating}>
              <Ionicons name="star" size={10} color={Colors.sunset} />
              <Text style={styles.cellRatingText}>{dest.rating}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cellBody}>
          <Row label="From">
            <Text style={styles.rowValue}>RM{dest.price}</Text>
          </Row>
          <Row label="Crowd">
            <View style={styles.crowdChip}>
              <View style={[styles.crowdDot, { backgroundColor: crowdColors[dest.crowdLevel] }]} />
              <Text style={[styles.rowValue, { color: crowdColors[dest.crowdLevel] }]}>
                {crowdLabels[dest.crowdLevel]}
              </Text>
            </View>
          </Row>
          <Row label="Eco">
            <Text style={styles.rowValue}>{'★'.repeat(dest.ecoRating || 3)}</Text>
          </Row>
          <Row label="Best time">
            <Text style={[styles.rowValue, { fontSize: Typography.sizes.xs }]} numberOfLines={1}>{dest.bestTimeToVisit}</Text>
          </Row>
          <Row label="Permit">
            <Text style={[styles.rowValue, { color: dest.permitRequired ? Colors.warning : Colors.success }]}>
              {dest.permitRequired ? 'Required' : 'None'}
            </Text>
          </Row>
          <Row label="Wildlife">
            <Text style={[styles.rowValue, { fontSize: 10 }]} numberOfLines={2}>
              {(dest.wildlifeTypes || []).slice(0, 2).join(', ') || '—'}
            </Text>
          </Row>

          <View style={styles.activityBlock}>
            <Text style={styles.activityLabel}>TOP ACTIVITIES</Text>
            <View style={styles.activityList}>
              {dest.tags.slice(0, 3).map((t, i) => (
                <View key={i} style={styles.activityChip}>
                  <Text style={styles.activityText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  const verdict = () => {
    if (!right) return null;
    const lines: { icon: string; text: string; color: string }[] = [];

    if (left.price < right.price)
      lines.push({ icon: 'cash-outline', text: `${left.name} is RM${right.price - left.price} cheaper`, color: Colors.success });
    else if (right.price < left.price)
      lines.push({ icon: 'cash-outline', text: `${right.name} is RM${left.price - right.price} cheaper`, color: Colors.success });

    const crowdOrder = { low: 0, moderate: 1, high: 2, 'very-high': 3 };
    if (crowdOrder[left.crowdLevel] < crowdOrder[right.crowdLevel])
      lines.push({ icon: 'people-outline', text: `${left.name} is quieter`, color: Colors.primary });
    else if (crowdOrder[right.crowdLevel] < crowdOrder[left.crowdLevel])
      lines.push({ icon: 'people-outline', text: `${right.name} is quieter`, color: Colors.primary });

    if ((left.ecoRating || 0) > (right.ecoRating || 0))
      lines.push({ icon: 'leaf-outline', text: `${left.name} scores higher on eco`, color: Colors.secondary });
    else if ((right.ecoRating || 0) > (left.ecoRating || 0))
      lines.push({ icon: 'leaf-outline', text: `${right.name} scores higher on eco`, color: Colors.secondary });

    if (left.permitRequired && !right.permitRequired)
      lines.push({ icon: 'document-text-outline', text: `${right.name} needs no permit`, color: Colors.warning });
    else if (right.permitRequired && !left.permitRequired)
      lines.push({ icon: 'document-text-outline', text: `${left.name} needs no permit`, color: Colors.warning });

    if (!lines.length) return null;

    return (
      <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.verdict}>
        <View style={styles.verdictHeader}>
          <Ionicons name="sparkles" size={14} color={Colors.primary} />
          <Text style={styles.verdictTitle}>Bayu AI verdict</Text>
        </View>
        {lines.map((l, i) => (
          <View key={i} style={styles.verdictRow}>
            <Ionicons name={l.icon as any} size={12} color={l.color} />
            <Text style={styles.verdictText}>{l.text}</Text>
          </View>
        ))}
      </Animated.View>
    );
  };

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.container}>
        <LinearGradient colors={[...Colors.gradients.sabahSky]} style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerEyebrow}>COMPARE</Text>
              <Text style={styles.headerTitle}>Side-by-side</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
          <Animated.View entering={SlideInUp.duration(400)} style={styles.grid}>
            {renderCell(left, true)}
            {renderCell(right, false)}
          </Animated.View>

          {verdict()}

          {!right && (
            <View style={styles.pickerWrap}>
              <Text style={styles.pickerTitle}>Choose second destination</Text>
              <View style={styles.pickerGrid}>
                {alternatives.map((alt) => (
                  <TouchableOpacity
                    key={alt.id}
                    style={styles.pickerCell}
                    activeOpacity={0.85}
                    onPress={() => setRightId(alt.id)}
                  >
                    <Image source={{ uri: alt.image }} style={styles.pickerImg} contentFit="cover" />
                    <Text style={styles.pickerName} numberOfLines={1}>{alt.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {right && (
            <TouchableOpacity style={styles.resetBtn} onPress={() => setRightId(null)}>
              <Ionicons name="refresh" size={14} color={Colors.primary} />
              <Text style={styles.resetText}>Compare with different destination</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: { paddingHorizontal: Spacing.base, paddingTop: 48, paddingBottom: Spacing.base },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEyebrow: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodySemiBold,
    color: 'rgba(255,255,255,0.82)',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
    marginTop: 1,
  },

  grid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  cell: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  emptyCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    minHeight: 240,
    borderStyle: 'dashed',
  },
  emptyLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  cellHero: { height: 100, position: 'relative' },
  cellHeroTag: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: BorderRadius.full,
  },
  cellHeroTagText: {
    fontSize: 9,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FFFFFF',
  },
  cellHeroBottom: {
    position: 'absolute',
    bottom: Spacing.xs,
    left: Spacing.xs,
    right: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cellTitle: {
    flex: 1,
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
  },
  cellRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: BorderRadius.full,
  },
  cellRatingText: {
    fontSize: 10,
    fontFamily: Typography.fonts.bodySemiBold,
    color: '#FFFFFF',
  },

  cellBody: { padding: Spacing.sm, gap: Spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  rowLabel: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
  },
  rowValue: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.headingBold,
    color: Colors.text,
  },
  crowdChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  crowdDot: { width: 6, height: 6, borderRadius: 3 },

  activityBlock: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  activityLabel: {
    fontSize: 9,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  activityList: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  activityChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: Colors.primary + '12',
    borderRadius: BorderRadius.sm,
  },
  activityText: {
    fontSize: 9,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.primary,
  },

  verdict: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    padding: Spacing.base,
    backgroundColor: Colors.primary + '08',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
    gap: 6,
  },
  verdictHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  verdictTitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.headingBold,
    color: Colors.primary,
  },
  verdictRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  verdictText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.text,
  },

  pickerWrap: { padding: Spacing.base, marginTop: Spacing.md },
  pickerTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  pickerCell: {
    width: '31%',
    alignItems: 'center',
    gap: 4,
  },
  pickerImg: { width: '100%', aspectRatio: 1, borderRadius: BorderRadius.md },
  pickerName: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.text,
    textAlign: 'center',
  },

  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetText: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.primary,
  },
});
