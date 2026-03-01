import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Chip } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';

const dietaryOptions = ['Halal Only', 'Vegetarian', 'Vegan', 'Seafood', 'No Restrictions'];
const travelStyles = ['Budget', 'Comfort', 'Luxury', 'Backpacking', 'Family'];
const activities = ['Sightseeing', 'Shopping', 'Food Tours', 'Adventure', 'Culture', 'Relaxation', 'Photography', 'Nightlife'];

export default function PreferencesScreen() {
  const insets = useSafeAreaInsets();
  const [dietary, setDietary] = useState(['Halal Only']);
  const [style, setStyle] = useState(['Comfort']);
  const [interests, setInterests] = useState(['Sightseeing', 'Food Tours', 'Culture']);

  const toggle = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Travel Preferences" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Dietary Requirements</Text>
        <View style={styles.chipGrid}>{dietaryOptions.map((opt) => <Chip key={opt} label={opt} selected={dietary.includes(opt)} onPress={() => toggle(dietary, opt, setDietary)} />)}</View>

        <Text style={styles.sectionTitle}>Travel Style</Text>
        <View style={styles.chipGrid}>{travelStyles.map((opt) => <Chip key={opt} label={opt} selected={style.includes(opt)} onPress={() => toggle(style, opt, setStyle)} />)}</View>

        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.chipGrid}>{activities.map((opt) => <Chip key={opt} label={opt} selected={interests.includes(opt)} onPress={() => toggle(interests, opt, setInterests)} />)}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 40 },
  sectionTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, marginTop: Spacing.xl, marginBottom: Spacing.md },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
