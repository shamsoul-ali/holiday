import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FoodSpot } from '@/types';
import { SabahMap, MapPin } from '@/components/SabahMap';
import { SABAH_DISTRICTS, GEO_TO_DISTRICT, sabahDistricts } from '@/data';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';

interface Props {
  spots: FoodSpot[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

// Resolve each food spot to a district id via location string
function districtIdForFood(spot: FoodSpot): string | null {
  const loc = spot.location.toLowerCase();
  for (const d of sabahDistricts) {
    if (loc.includes(d.name.toLowerCase())) return d.id;
    if (d.id === 'kk' && (loc.includes('kk') || loc.includes('kota kinabalu'))) return d.id;
  }
  return null;
}

// Get the first polygon's centroid for a given district id (source coords)
function centroidForDistrict(districtId: string): { cx: number; cy: number } | null {
  const geoId = Object.entries(GEO_TO_DISTRICT).find(([, v]) => v === districtId)?.[0];
  if (!geoId) return null;
  const g = SABAH_DISTRICTS.find((p) => p.id === geoId);
  if (!g) return null;
  return { cx: g.cx, cy: g.cy };
}

// Jitter pins that share a district so they don't stack
function jitterPins(basePins: { spot: FoodSpot; cx: number; cy: number }[]): MapPin[] {
  const byDistrict: Record<string, { spot: FoodSpot; cx: number; cy: number }[]> = {};
  basePins.forEach((p) => {
    const key = `${Math.round(p.cx)},${Math.round(p.cy)}`;
    (byDistrict[key] = byDistrict[key] || []).push(p);
  });
  const out: MapPin[] = [];
  for (const key of Object.keys(byDistrict)) {
    const group = byDistrict[key];
    group.forEach((p, i) => {
      const angle = (i / Math.max(1, group.length)) * Math.PI * 2;
      const radius = group.length > 1 ? 10 : 0;
      out.push({
        id: p.spot.id,
        x: p.cx + Math.cos(angle) * radius,
        y: p.cy + Math.sin(angle) * radius,
        color: p.spot.tags.includes('viral-spot')
          ? Colors.error
          : p.spot.tags.includes('muslim-friendly')
            ? Colors.secondary
            : p.spot.tags.includes('local-gem')
              ? Colors.sunset
              : Colors.primary,
        label: p.spot.name,
      });
    });
  }
  return out;
}

export const FoodMapSVG: React.FC<Props> = ({ spots, activeId, onSelect }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const pins = useMemo(() => {
    const base: { spot: FoodSpot; cx: number; cy: number }[] = [];
    spots.forEach((s) => {
      const did = districtIdForFood(s);
      if (!did) return;
      const c = centroidForDistrict(did);
      if (!c) return;
      base.push({ spot: s, cx: c.cx, cy: c.cy });
    });
    return jitterPins(base);
  }, [spots]);

  const handleDistrictSelect = (districtId: string) => {
    setSelectedDistrict(districtId);
    // If there's a food spot in this district, surface it to the caller
    const firstSpot = spots.find((s) => districtIdForFood(s) === districtId);
    if (firstSpot) onSelect(firstSpot.id);
  };

  return (
    <View style={styles.wrap}>
      <SabahMap
        mode="food"
        overlayPins={pins}
        selectedDistrictId={selectedDistrict}
        onSelectDistrict={handleDistrictSelect}
        height={380}
      />

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

      <View style={styles.countPill}>
        <Ionicons name="restaurant" size={14} color={Colors.primary} />
        <Text style={styles.countText}>{spots.length} food spots</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#06101E',
    position: 'relative',
  },
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
