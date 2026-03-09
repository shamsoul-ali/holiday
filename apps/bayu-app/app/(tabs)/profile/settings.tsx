import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Card } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [pushNotifs, setPushNotifs] = React.useState(true);
  const [emailNotifs, setEmailNotifs] = React.useState(true);
  const [prayerAlerts, setPrayerAlerts] = React.useState(true);
  const [currency, setCurrency] = React.useState('MYR');
  const [language, setLanguage] = React.useState('English');
  const [prayerCalc, setPrayerCalc] = React.useState('ISNA');

  const showPicker = (title: string, options: string[], current: string, onSelect: (v: string) => void) => {
    Alert.alert(title, `Current: ${current}`, [
      ...options.map((opt) => ({ text: opt === current ? `${opt} ✓` : opt, onPress: () => onSelect(opt) })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Settings" />
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card variant="outlined" padding={0}>
          {[
            { label: 'Push Notifications', value: pushNotifs, onToggle: setPushNotifs },
            { label: 'Email Notifications', value: emailNotifs, onToggle: setEmailNotifs },
            { label: 'Prayer Time Alerts', value: prayerAlerts, onToggle: setPrayerAlerts },
          ].map((item, i) => (
            <View key={item.label} style={[styles.settingRow, i < 2 && styles.settingBorder]}>
              <Text style={styles.settingLabel}>{item.label}</Text>
              <Switch value={item.value} onValueChange={item.onToggle} trackColor={{ true: Colors.primary }} thumbColor="#fff" />
            </View>
          ))}
        </Card>

        <Text style={styles.sectionTitle}>App</Text>
        <Card variant="outlined" padding={0}>
          {[
            { label: 'Currency', value: currency, onPress: () => showPicker('Select Currency', ['MYR', 'USD', 'SGD', 'GBP', 'EUR'], currency, setCurrency) },
            { label: 'Language', value: language, onPress: () => showPicker('Select Language', ['English', 'Bahasa Melayu', '中文', '日本語'], language, setLanguage) },
            { label: 'Prayer Calculation', value: prayerCalc, onPress: () => showPicker('Prayer Calculation Method', ['ISNA', 'MWL', 'Egyptian', 'Umm Al-Qura', 'JAKIM'], prayerCalc, setPrayerCalc) },
          ].map((item, i) => (
            <TouchableOpacity key={item.label} style={[styles.settingRow, i < 2 && styles.settingBorder]} onPress={item.onPress}>
              <Text style={styles.settingLabel}>{item.label}</Text>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>{item.value}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 100 },
  sectionTitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.textTertiary, marginTop: Spacing.xl, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.base },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  settingLabel: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  settingValue: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
});
