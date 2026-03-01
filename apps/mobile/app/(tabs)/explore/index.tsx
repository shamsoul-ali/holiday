import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useTripStore } from '@/store';
import { Button, Chip, ProgressBar, Card } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';
import { allDestinations } from '@/data';
import { formatCurrency } from '@/utils';
import { TierType } from '@/types';
import { hapticSelection } from '@/utils';

const interests = ['Sightseeing', 'Food & Cuisine', 'Shopping', 'Adventure', 'Culture', 'Relaxation', 'Photography', 'Nightlife', 'Nature', 'History', 'Art', 'Sports'];

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { wizard, setWizardStep, updateWizard, generateTrip, isGenerating, generationMessage } = useTripStore();

  const handleGenerate = async () => {
    router.push('/(tabs)/explore/loading');
  };

  const renderStep = () => {
    switch (wizard.step) {
      case 1:
        return (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
            <Text style={styles.stepTitle}>Where do you want to go?</Text>
            <Text style={styles.stepSubtitle}>Choose a destination for your trip</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {allDestinations.slice(0, 8).map((dest) => (
                <TouchableOpacity
                  key={dest.id}
                  style={[styles.destOption, wizard.destination === dest.name && styles.destSelected]}
                  onPress={() => { hapticSelection(); updateWizard({ destination: dest.name }); }}
                >
                  <View style={styles.destInfo}>
                    <Text style={styles.destName}>{dest.name}, {dest.country}</Text>
                    <Text style={styles.destDesc}>{dest.description}</Text>
                  </View>
                  {wizard.destination === dest.name && (
                    <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
            <Text style={styles.stepTitle}>Set your budget</Text>
            <Text style={styles.stepSubtitle}>Per person budget in MYR</Text>

            <Card style={styles.budgetCard}>
              <Text style={styles.budgetAmount}>{formatCurrency(wizard.budget)}</Text>
              <Text style={styles.budgetPer}>per person</Text>
              <View style={styles.budgetButtons}>
                {[1000, 3000, 5000, 10000, 20000, 50000].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[styles.budgetBtn, wizard.budget === amount && styles.budgetBtnActive]}
                    onPress={() => { hapticSelection(); updateWizard({ budget: amount }); }}
                  >
                    <Text style={[styles.budgetBtnText, wizard.budget === amount && styles.budgetBtnTextActive]}>
                      {amount >= 1000 ? `${amount / 1000}K` : amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            <Text style={[styles.stepTitle, { marginTop: Spacing.xl }]}>Travelers</Text>
            {(['adults', 'children', 'infants'] as const).map((type) => (
              <View key={type} style={styles.travelerRow}>
                <Text style={styles.travelerLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => updateWizard({ [type]: Math.max(type === 'adults' ? 1 : 0, wizard[type] - 1) })}
                  >
                    <Ionicons name="remove" size={20} color={Colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{wizard[type]}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => updateWizard({ [type]: wizard[type] + 1 })}
                  >
                    <Ionicons name="add" size={20} color={Colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
            <Text style={styles.stepTitle}>What interests you?</Text>
            <Text style={styles.stepSubtitle}>Select your travel interests</Text>
            <View style={styles.interestsGrid}>
              {interests.map((interest) => (
                <Chip
                  key={interest}
                  label={interest}
                  selected={wizard.interests.includes(interest)}
                  onPress={() => {
                    hapticSelection();
                    const current = wizard.interests;
                    updateWizard({
                      interests: current.includes(interest)
                        ? current.filter((i) => i !== interest)
                        : [...current, interest],
                    });
                  }}
                />
              ))}
            </View>

            <Text style={[styles.stepTitle, { marginTop: Spacing.xl }]}>Travel Style</Text>
            <View style={styles.styleCards}>
              {([
                { tier: 'budget' as TierType, icon: 'wallet-outline', title: 'Budget', desc: 'Best value for money', color: Colors.budget },
                { tier: 'comfort' as TierType, icon: 'heart-outline', title: 'Comfort', desc: 'Balanced experience', color: Colors.comfort },
                { tier: 'luxury' as TierType, icon: 'diamond-outline', title: 'Luxury', desc: 'Premium everything', color: Colors.luxury },
              ]).map((style) => (
                <TouchableOpacity
                  key={style.tier}
                  style={[styles.styleCard, wizard.travelStyle === style.tier && { borderColor: style.color, borderWidth: 2 }]}
                  onPress={() => { hapticSelection(); updateWizard({ travelStyle: style.tier }); }}
                >
                  <Ionicons name={style.icon as any} size={28} color={style.color} />
                  <Text style={[styles.styleTitle, { color: style.color }]}>{style.title}</Text>
                  <Text style={styles.styleDesc}>{style.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review your trip</Text>
            <Card style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Ionicons name="location" size={20} color={Colors.primary} />
                <Text style={styles.reviewLabel}>Destination</Text>
                <Text style={styles.reviewValue}>{wizard.destination || 'Not selected'}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Ionicons name="cash" size={20} color={Colors.primary} />
                <Text style={styles.reviewLabel}>Budget</Text>
                <Text style={styles.reviewValue}>{formatCurrency(wizard.budget)}/pax</Text>
              </View>
              <View style={styles.reviewRow}>
                <Ionicons name="people" size={20} color={Colors.primary} />
                <Text style={styles.reviewLabel}>Travelers</Text>
                <Text style={styles.reviewValue}>{wizard.adults}A {wizard.children > 0 ? `${wizard.children}C ` : ''}{wizard.infants > 0 ? `${wizard.infants}I` : ''}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Ionicons name="compass" size={20} color={Colors.primary} />
                <Text style={styles.reviewLabel}>Style</Text>
                <Text style={styles.reviewValue}>{wizard.travelStyle.charAt(0).toUpperCase() + wizard.travelStyle.slice(1)}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Ionicons name="heart" size={20} color={Colors.primary} />
                <Text style={styles.reviewLabel}>Interests</Text>
                <Text style={styles.reviewValue} numberOfLines={2}>{wizard.interests.join(', ') || 'None selected'}</Text>
              </View>
            </Card>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Plan Your Trip" showBack={wizard.step > 1} />

      <View style={styles.progressRow}>
        <ProgressBar progress={wizard.step / 4} />
        <Text style={styles.stepIndicator}>Step {wizard.step} of 4</Text>
      </View>

      <View style={styles.content}>
        {renderStep()}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        {wizard.step > 1 && (
          <Button title="Back" onPress={() => setWizardStep(wizard.step - 1)} variant="outline" size="lg" style={{ flex: 1, marginRight: Spacing.sm }} />
        )}
        <Button
          title={wizard.step === 4 ? 'Generate with AI' : 'Continue'}
          onPress={wizard.step === 4 ? handleGenerate : () => setWizardStep(wizard.step + 1)}
          size="lg"
          style={{ flex: 1 }}
          icon={wizard.step === 4 ? <Ionicons name="sparkles" size={18} color="#fff" /> : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progressRow: { paddingHorizontal: Spacing.base, marginBottom: Spacing.md },
  stepIndicator: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, textAlign: 'right', marginTop: Spacing.xs },
  content: { flex: 1 },
  stepContent: { flex: 1, paddingHorizontal: Spacing.base },
  stepTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.heading, color: Colors.text, marginBottom: Spacing.xs },
  stepSubtitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginBottom: Spacing.lg },
  destOption: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border, marginBottom: Spacing.sm },
  destSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  destInfo: { flex: 1 },
  destName: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  destDesc: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 2 },
  budgetCard: { alignItems: 'center', paddingVertical: Spacing.xl },
  budgetAmount: { fontSize: Typography.sizes['3xl'], fontFamily: Typography.fonts.headingBold, color: Colors.primary },
  budgetPer: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  budgetButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.lg, justifyContent: 'center' },
  budgetBtn: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  budgetBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  budgetBtnText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  budgetBtnTextActive: { color: '#FFFFFF' },
  travelerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  travelerLabel: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  counterBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  counterValue: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, minWidth: 24, textAlign: 'center' },
  interestsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  styleCards: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  styleCard: { flex: 1, alignItems: 'center', padding: Spacing.base, borderRadius: BorderRadius.lg, backgroundColor: Colors.surface, gap: Spacing.xs },
  styleTitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.heading },
  styleDesc: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textSecondary, textAlign: 'center' },
  reviewCard: { gap: Spacing.md },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  reviewLabel: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, width: 80 },
  reviewValue: { flex: 1, fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  footer: { flexDirection: 'row', paddingHorizontal: Spacing.base, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight },
});
