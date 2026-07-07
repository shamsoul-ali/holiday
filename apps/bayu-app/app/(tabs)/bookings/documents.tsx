import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/shared';
import { EmptyState } from '@/components/shared';

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Documents" />
      <EmptyState
        icon="document-text-outline"
        title="No Documents"
        message="Your travel documents, e-tickets, and receipts will appear here."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
});
