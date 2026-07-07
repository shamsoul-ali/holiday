import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { ScreenHeader } from '@/components/shared';
import { mockNotifications } from '@/data';
import { Notification } from '@/types';

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  visa_update: 'document-text',
  kursus_reminder: 'school',
  departure_reminder: 'airplane',
  payment_reminder: 'card',
  cabutan_result: 'gift',
  group_update: 'chatbubbles',
};

export default function NotificationsScreen() {
  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity style={[styles.item, !item.read && styles.unread]}>
      <View style={[styles.iconCircle, { backgroundColor: item.read ? Colors.surface : Colors.primary + '15' }]}>
        <Ionicons name={iconMap[item.type] || 'notifications'} size={20} color={item.read ? Colors.textTertiary : Colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Pemberitahuan" />
      <FlatList
        data={mockNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: Spacing.base }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  item: { flexDirection: 'row', padding: Spacing.base, gap: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm },
  unread: { backgroundColor: Colors.primary + '08' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  title: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  message: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },
  time: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginTop: 4 },
});
