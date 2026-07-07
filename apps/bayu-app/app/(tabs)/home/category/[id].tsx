import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { categories, sabahDestinations } from '@/data';
import { formatCurrency } from '@/utils';
import { Badge, StarRating, Card } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';

const categoryTagMap: Record<string, string[]> = {
  islands: ['Island', 'Beach', 'Snorkeling'],
  diving: ['Diving', 'Snorkeling', 'Marine Life'],
  mountains: ['Hiking', 'Mountain', 'Trek', 'Highland'],
  wildlife: ['Wildlife', 'Nature', 'Rainforest', 'Orangutan'],
  cultural: ['Cultural', 'Heritage', 'Indigenous', 'Village'],
  'food-tours': ['Food', 'Cuisine', 'Seafood'],
  'eco-tourism': ['Eco', 'Conservation', 'Sustainable'],
  adventure: ['Adventure', 'Rafting', 'Climbing', 'Paragliding'],
};

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const category = categories.find((c) => c.id === id);
  const matchTags = categoryTagMap[id || ''] || [];

  const filtered = sabahDestinations.filter((dest) =>
    dest.tags.some((tag) => matchTags.some((mt) => tag.toLowerCase().includes(mt.toLowerCase())))
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={category?.name || 'Category'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category header */}
        {category && (
          <View style={styles.headerCard}>
            <View style={[styles.headerIcon, { backgroundColor: category.color + '15' }]}>
              <Ionicons name={category.icon as any} size={28} color={category.color} />
            </View>
            <Text style={styles.headerDesc}>{category.description}</Text>
            <Text style={styles.resultCount}>{filtered.length} destination{filtered.length !== 1 ? 's' : ''} found</Text>
          </View>
        )}

        {/* Destination list */}
        {filtered.length > 0 ? (
          filtered.map((dest) => (
            <TouchableOpacity
              key={dest.id}
              style={styles.destCard}
              activeOpacity={0.9}
              onPress={() => router.push({ pathname: '/(tabs)/home/destination/[id]', params: { id: dest.id } })}
            >
              <Image source={{ uri: dest.image }} style={styles.destImage} contentFit="cover" />
              <View style={styles.destInfo}>
                <Text style={styles.destName}>{dest.name}</Text>
                <Text style={styles.destDistrict}>{dest.district}, Sabah</Text>
                <View style={styles.destTags}>
                  {dest.tags.slice(0, 3).map((tag, i) => (
                    <Badge key={i} label={tag} color={Colors.primary + '15'} textColor={Colors.primary} size="sm" />
                  ))}
                </View>
                <View style={styles.destBottom}>
                  <StarRating rating={dest.rating} size={14} />
                  <Text style={styles.destPrice}>From {formatCurrency(dest.price)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="search" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No destinations found for this category yet.</Text>
            <Text style={styles.emptySubtext}>Check back soon — we're adding new spots!</Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 100 },
  headerCard: { alignItems: 'center', paddingVertical: Spacing.xl, marginBottom: Spacing.lg },
  headerIcon: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  headerDesc: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary, textAlign: 'center' },
  resultCount: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.primary, marginTop: Spacing.sm },
  destCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: Spacing.md, ...Shadows.sm },
  destImage: { width: 120, height: 130 },
  destInfo: { flex: 1, padding: Spacing.md, justifyContent: 'space-between' },
  destName: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  destDistrict: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },
  destTags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.xs },
  destBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  destPrice: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.primary },
  emptyCard: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text, marginTop: Spacing.md },
  emptySubtext: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: Spacing.xs },
});
