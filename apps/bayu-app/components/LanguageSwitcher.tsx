import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';

interface Language {
  code: string;
  name: string;
  native: string;
  flag: string;
  greetings: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧', greetings: 'Hello, welcome to Sabah' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu', flag: '🇲🇾', greetings: 'Selamat datang ke Sabah' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳', greetings: '欢迎来到沙巴' },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷', greetings: '사바에 오신 것을 환영합니다' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', greetings: 'مرحبا بك في صباح' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵', greetings: 'サバへようこそ' },
];

interface Props {
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<Props> = ({ compact }) => {
  const [selected, setSelected] = useState<Language>(languages[0]);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (lang: Language) => {
    setSelected(lang);
    setModalVisible(false);
    setTimeout(
      () => Alert.alert(lang.name, `${lang.greetings}\n\nLanguage switched to ${lang.native}.\n(Demo only — full localisation coming soon.)`),
      150,
    );
  };

  return (
    <>
      <TouchableOpacity
        style={compact ? styles.compactTrigger : styles.trigger}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.flag}>{selected.flag}</Text>
        <View style={{ flex: 1 }}>
          {!compact && <Text style={styles.label}>Language</Text>}
          <Text style={styles.value}>{selected.native}</Text>
        </View>
        <Ionicons name="chevron-down" size={16} color={Colors.textTertiary} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Animated.View entering={FadeIn.duration(200)} style={styles.backdrop}>
          <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={() => setModalVisible(false)} />
          <Animated.View entering={SlideInDown.duration(320)} style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Choose your language</Text>
            <Text style={styles.sheetSubtitle}>Available in 6 ASEAN + global languages</Text>

            <View style={{ marginTop: Spacing.md }}>
              {languages.map((lang) => {
                const isSelected = lang.code === selected.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.row, isSelected && styles.rowSelected]}
                    onPress={() => handleSelect(lang)}
                  >
                    <Text style={styles.rowFlag}>{lang.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowNative}>{lang.native}</Text>
                      <Text style={styles.rowName}>{lang.name}</Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.footnote}>
              <Ionicons name="globe-outline" size={12} color={Colors.textTertiary} />
              <Text style={styles.footnoteText}>Built to serve Sabah's top inbound markets</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compactTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  flag: { fontSize: 24 },
  label: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.textTertiary,
  },
  value: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,22,40,0.55)',
    justifyContent: 'flex-end',
  },
  backdropTouch: { flex: 1 },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingTop: Spacing.md,
    ...Shadows.lg,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.headingBold,
    color: Colors.text,
  },
  sheetSubtitle: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    marginVertical: 3,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  rowSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  rowFlag: { fontSize: 28 },
  rowNative: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },
  rowName: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: 1,
  },

  footnote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  footnoteText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
  },
});
