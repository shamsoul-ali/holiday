import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { ScreenHeader } from '@/components/shared';
import { IslandCard, Button } from '@/components/ui';
import { sabahIslands, islandRegions, islandActivities } from '@/data';
import { useTripStore } from '@/store';

export default function IslandsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateWizard, resetWizard, setWizardStep } = useTripStore();
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedActivity, setSelectedActivity] = useState<string>('All');

  const filteredIslands = useMemo(() => {
    let result = sabahIslands;
    if (selectedRegion !== 'All') {
      result = result.filter((i) => i.region === selectedRegion);
    }
    if (selectedActivity !== 'All') {
      result = result.filter((i) => i.activities.includes(selectedActivity));
    }
    return result;
  }, [selectedRegion, selectedActivity]);

  const handlePlanTrip = (islandName: string) => {
    resetWizard();
    updateWizard({ destination: islandName });
    setWizardStep(1);
    router.push('/(tabs)/explore');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Sabah Islands" />

      <Text style={styles.subtitle}>{filteredIslands.length} islands across {islandRegions.length} regions</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: Spacing.xs }}>
        {['All', ...islandRegions].map((region) => (
          <TouchableOpacity
            key={region}
            style={[styles.chip, selectedRegion === region && styles.chipActive]}
            onPress={() => setSelectedRegion(region)}
          >
            <Text style={[styles.chipText, selectedRegion === region && styles.chipTextActive]}>
              {region === 'All' ? 'All Regions' : region.split(' (')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: Spacing.xs }}>
        {['All', ...islandActivities].map((activity) => (
          <TouchableOpacity
            key={activity}
            style={[styles.chip, selectedActivity === activity && styles.chipActive]}
            onPress={() => setSelectedActivity(activity)}
          >
            <Text style={[styles.chipText, selectedActivity === activity && styles.chipTextActive]}>
              {activity === 'All' ? 'All Activities' : activity}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredIslands}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
            <IslandCard
              island={item}
              onPress={() => handlePlanTrip(item.name)}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No islands match your filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  subtitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  filterRow: { maxHeight: 40, marginBottom: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  chipTextActive: { color: '#FFFFFF' },
  list: { padding: Spacing.base, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textTertiary },
});
