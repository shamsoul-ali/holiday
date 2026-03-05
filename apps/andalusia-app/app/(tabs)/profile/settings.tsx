import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useAppStore } from '@/store';
import { ScreenHeader } from '@/components/shared';

export default function SettingsScreen() {
  const { theme, language, setTheme, setLanguage } = useAppStore();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Tetapan" />
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Paparan</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.settingLabel}>Mod Gelap</Text>
          </View>
          <Switch value={theme === 'dark'} onValueChange={(v) => setTheme(v ? 'dark' : 'light')} trackColor={{ true: Colors.primary }} />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Bahasa</Text>
        <View style={styles.langRow}>
          <TouchableOpacity style={[styles.langBtn, language === 'bm' && styles.langActive]} onPress={() => setLanguage('bm')}>
            <Text style={[styles.langText, language === 'bm' && styles.langTextActive]}>Bahasa Malaysia</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.langBtn, language === 'en' && styles.langActive]} onPress={() => setLanguage('en')}>
            <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>English</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Pemberitahuan</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.settingLabel}>Pemberitahuan Push</Text>
          </View>
          <Switch value={true} trackColor={{ true: Colors.primary }} />
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.settingLabel}>Pemberitahuan Emel</Text>
          </View>
          <Switch value={true} trackColor={{ true: Colors.primary }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl },
  sectionTitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.textTertiary, marginBottom: Spacing.md, textTransform: 'uppercase' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  settingLabel: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.text },
  langRow: { flexDirection: 'row', gap: Spacing.md },
  langBtn: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  langActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  langText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  langTextActive: { color: Colors.primary },
});
