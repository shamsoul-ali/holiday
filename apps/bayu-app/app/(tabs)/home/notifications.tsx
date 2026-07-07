import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { ScreenHeader } from '@/components/shared';
import { mockNotifications } from '@/data';

const iconMap: Record<string, { name: string; color: string }> = {
  booking_confirmation: { name: 'checkmark-circle', color: Colors.success },
  weather_alert: { name: 'cloud', color: Colors.warning },
  payment_reminder: { name: 'card', color: Colors.error },
  check_in_reminder: { name: 'airplane', color: Colors.info },
  flight_delay: { name: 'time', color: Colors.warning },
};

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Notifications" />
      <FlatList
        data={mockNotifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: Spacing.base, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        renderItem={({ item }) => {
          const iconInfo = iconMap[item.type] || { name: 'notifications', color: Colors.textTertiary };
          return (
            <TouchableOpacity style={[styles.notifCard, !item.read && styles.unread]}>
              <View style={[styles.iconCircle, { backgroundColor: iconInfo.color + '15' }]}>
                <Ionicons name={iconInfo.name as any} size={22} color={iconInfo.color} />
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.notifTime}>{item.time}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  notifCard: { flexDirection: 'row', padding: Spacing.base, borderRadius: BorderRadius.md, backgroundColor: Colors.background, gap: Spacing.md },
  unread: { backgroundColor: Colors.primary + '08' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  notifMessage: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2, lineHeight: 20 },
  notifTime: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginTop: Spacing.xs },
});
