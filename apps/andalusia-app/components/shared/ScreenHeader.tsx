import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, showBack = true, rightAction, transparent }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }, transparent && styles.transparent]}>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={transparent ? '#fff' : Colors.text} />
          </TouchableOpacity>
        ) : <View style={styles.placeholder} />}
        <Text style={[styles.title, transparent && styles.titleWhite]} numberOfLines={1}>{title}</Text>
        {rightAction || <View style={styles.placeholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.background, paddingHorizontal: Spacing.base, paddingBottom: Spacing.sm },
  transparent: { backgroundColor: 'transparent', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  placeholder: { width: 40 },
  title: { flex: 1, textAlign: 'center', fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text },
  titleWhite: { color: '#FFFFFF' },
});
