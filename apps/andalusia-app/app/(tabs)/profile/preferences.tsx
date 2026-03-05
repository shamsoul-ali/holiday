import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Chip } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';

export default function PreferencesScreen() {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Keutamaan" />
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Pakej Pilihan</Text>
        <View style={styles.chips}>
          <Chip label="Umrah Standard" selected />
          <Chip label="Umrah Premium" />
          <Chip label="Umrah Plus" />
          <Chip label="Haji" />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Bandar Berlepas</Text>
        <View style={styles.chips}>
          <Chip label="Kuala Lumpur (KUL)" selected />
          <Chip label="Pulau Pinang (PEN)" />
          <Chip label="Johor Bahru (JHB)" />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Jenis Bilik</Text>
        <View style={styles.chips}>
          <Chip label="Twin" selected />
          <Chip label="Triple" />
          <Chip label="Quad" />
          <Chip label="Single" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl },
  sectionTitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.textTertiary, marginBottom: Spacing.md, textTransform: 'uppercase' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
