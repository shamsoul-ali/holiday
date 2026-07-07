import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { ScreenHeader } from '@/components/shared';

const documents = [
  { id: 'd1', name: 'Pasport', type: 'PDF', size: '2.4 MB', icon: 'document-text' as const },
  { id: 'd2', name: 'Visa Umrah', type: 'PDF', size: '1.1 MB', icon: 'document-text' as const },
  { id: 'd3', name: 'E-Tiket MH8004', type: 'PDF', size: '850 KB', icon: 'airplane' as const },
  { id: 'd4', name: 'Baucar Hotel Pullman', type: 'PDF', size: '1.3 MB', icon: 'business' as const },
  { id: 'd5', name: 'Sijil Insurans Takaful', type: 'PDF', size: '980 KB', icon: 'shield-checkmark' as const },
  { id: 'd6', name: 'Sijil Vaksinasi', type: 'PDF', size: '520 KB', icon: 'medkit' as const },
];

export default function DocumentsScreen() {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Dokumen Perjalanan" />
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: Spacing.base }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.docCard}>
            <View style={styles.docIcon}>
              <Ionicons name={item.icon} size={24} color={Colors.primary} />
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docName}>{item.name}</Text>
              <Text style={styles.docMeta}>{item.type} - {item.size}</Text>
            </View>
            <Ionicons name="download-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  docCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, gap: Spacing.md },
  docIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  docInfo: { flex: 1 },
  docName: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  docMeta: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginTop: 2 },
});
