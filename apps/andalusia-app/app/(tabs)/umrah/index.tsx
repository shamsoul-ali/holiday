import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useUmrahStore } from '@/store';
import { Button, Chip, Card } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';
import { TierType } from '@/types';

const tiers: { id: TierType; label: string; price: string; icon: string; color: string }[] = [
  { id: 'ekonomi', label: 'Ekonomi', price: 'RM6,367', icon: 'wallet', color: Colors.ekonomi },
  { id: 'standard', label: 'Standard', price: 'RM7,890', icon: 'star', color: Colors.standard },
  { id: 'premium', label: 'Premium', price: 'RM9,450', icon: 'diamond', color: Colors.premium },
  { id: 'vip', label: 'VIP', price: 'RM11,013', icon: 'trophy', color: Colors.vip },
];

const roomTypes = ['Twin', 'Triple', 'Quad', 'Single (+RM1,500)'];
const addOns = ['Umrah Plus Istanbul (+RM3,500)', 'Takaful Premium (+RM200)', 'VIP Lounge KLIA (+RM150)', 'Zamzam 10L (+RM80)'];

export default function UmrahWizardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { wizard, setWizardStep, updateWizard, generatePackages, toggleAddOn, addOns: selectedAddOns } = useUmrahStore();

  const handleNext = () => {
    if (wizard.step < 4) {
      setWizardStep(wizard.step + 1);
    } else {
      router.push('/(tabs)/umrah/loading');
      generatePackages().then(() => {
        router.replace('/(tabs)/umrah/results');
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Tempah Umrah" showBack={wizard.step > 1} />

      {/* Progress */}
      <View style={styles.progress}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={[styles.progressDot, s <= wizard.step && styles.progressActive, s < wizard.step && styles.progressDone]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {wizard.step === 1 && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.stepTitle}>Pilih Pakej</Text>
            <Text style={styles.stepDesc}>Pilih pakej yang sesuai dengan bajet anda</Text>
            <View style={styles.tierGrid}>
              {tiers.map((tier) => (
                <TouchableOpacity
                  key={tier.id}
                  style={[styles.tierCard, wizard.tier === tier.id && { borderColor: tier.color, borderWidth: 2 }]}
                  onPress={() => updateWizard({ tier: tier.id })}
                >
                  <View style={[styles.tierIcon, { backgroundColor: tier.color + '15' }]}>
                    <Ionicons name={tier.icon as any} size={24} color={tier.color} />
                  </View>
                  <Text style={styles.tierLabel}>{tier.label}</Text>
                  <Text style={[styles.tierPrice, { color: tier.color }]}>{tier.price}</Text>
                  {wizard.tier === tier.id && (
                    <View style={[styles.tierCheck, { backgroundColor: tier.color }]}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {wizard.step === 2 && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.stepTitle}>Tarikh & Penumpang</Text>
            <Text style={styles.stepDesc}>Tetapkan butiran perjalanan anda</Text>

            <Card style={{ marginBottom: Spacing.base }}>
              <Text style={styles.fieldLabel}>Bandar Berlepas</Text>
              <View style={styles.cityRow}>
                {['Kuala Lumpur (KUL)', 'Pulau Pinang (PEN)'].map((city) => (
                  <Chip key={city} label={city} selected={wizard.departureCity === city} onPress={() => updateWizard({ departureCity: city })} />
                ))}
              </View>
            </Card>

            <Card style={{ marginBottom: Spacing.base }}>
              <Text style={styles.fieldLabel}>Tarikh Berlepas</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => updateWizard({ startDate: '2026-05-10', endDate: '2026-05-19' })}>
                <Ionicons name="calendar" size={20} color={Colors.primary} />
                <Text style={styles.dateText}>{wizard.startDate || 'Pilih tarikh'}</Text>
              </TouchableOpacity>
            </Card>

            <Card style={{ marginBottom: Spacing.base }}>
              <Text style={styles.fieldLabel}>Penumpang</Text>
              {[
                { label: 'Dewasa', key: 'adults' as const, value: wizard.adults },
                { label: 'Kanak-kanak', key: 'children' as const, value: wizard.children },
                { label: 'Bayi', key: 'infants' as const, value: wizard.infants },
              ].map((item) => (
                <View key={item.key} style={styles.counterRow}>
                  <Text style={styles.counterLabel}>{item.label}</Text>
                  <View style={styles.counter}>
                    <TouchableOpacity style={styles.counterBtn} onPress={() => updateWizard({ [item.key]: Math.max(0, item.value - 1) })}>
                      <Ionicons name="remove" size={18} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{item.value}</Text>
                    <TouchableOpacity style={styles.counterBtn} onPress={() => updateWizard({ [item.key]: item.value + 1 })}>
                      <Ionicons name="add" size={18} color={Colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </Card>

            <Card>
              <Text style={styles.fieldLabel}>Jenis Bilik</Text>
              <View style={styles.cityRow}>
                {roomTypes.map((room) => (
                  <Chip key={room} label={room} selected={wizard.roomType === room.toLowerCase().split(' ')[0]} onPress={() => updateWizard({ roomType: room.toLowerCase().split(' ')[0] })} />
                ))}
              </View>
            </Card>
          </Animated.View>
        )}

        {wizard.step === 3 && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.stepTitle}>Tambahan</Text>
            <Text style={styles.stepDesc}>Tingkatkan pengalaman umrah anda</Text>
            {addOns.map((addOn) => (
              <TouchableOpacity
                key={addOn}
                style={[styles.addOnItem, selectedAddOns.includes(addOn) && styles.addOnSelected]}
                onPress={() => toggleAddOn(addOn)}
              >
                <View style={styles.addOnCheck}>
                  <Ionicons name={selectedAddOns.includes(addOn) ? 'checkbox' : 'square-outline'} size={24} color={selectedAddOns.includes(addOn) ? Colors.primary : Colors.textTertiary} />
                </View>
                <Text style={[styles.addOnText, selectedAddOns.includes(addOn) && { color: Colors.text }]}>{addOn}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {wizard.step === 4 && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.stepTitle}>Semakan</Text>
            <Text style={styles.stepDesc}>Pastikan semua butiran betul</Text>
            <Card style={{ gap: Spacing.sm }}>
              <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Pakej</Text><Text style={styles.reviewValue}>{wizard.tier.charAt(0).toUpperCase() + wizard.tier.slice(1)}</Text></View>
              <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Berlepas</Text><Text style={styles.reviewValue}>{wizard.departureCity}</Text></View>
              <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Tarikh</Text><Text style={styles.reviewValue}>{wizard.startDate || '10 Mei 2026'}</Text></View>
              <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Penumpang</Text><Text style={styles.reviewValue}>{wizard.adults} Dewasa</Text></View>
              <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Bilik</Text><Text style={styles.reviewValue}>{wizard.roomType}</Text></View>
              {selectedAddOns.length > 0 && (
                <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Tambahan</Text><Text style={styles.reviewValue}>{selectedAddOns.length} item</Text></View>
              )}
            </Card>
          </Animated.View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
        {wizard.step > 1 && (
          <Button title="Kembali" onPress={() => setWizardStep(wizard.step - 1)} variant="outline" size="lg" style={{ flex: 1, marginRight: Spacing.sm }} />
        )}
        <Button title={wizard.step === 4 ? 'Jana Pakej AI' : 'Seterusnya'} onPress={handleNext} size="lg" fullWidth={wizard.step === 1} style={wizard.step > 1 ? { flex: 1 } : undefined} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  progressDot: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  progressActive: { backgroundColor: Colors.primary },
  progressDone: { backgroundColor: Colors.primaryLight },
  content: { padding: Spacing.xl, paddingBottom: 100 },
  stepTitle: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: Colors.text, marginBottom: Spacing.xs },
  stepDesc: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginBottom: Spacing.xl },
  tierGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  tierCard: { width: '47%', backgroundColor: Colors.background, borderRadius: BorderRadius.lg, padding: Spacing.base, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border, ...Shadows.sm },
  tierIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  tierLabel: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.heading, color: Colors.text },
  tierPrice: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.headingBold, marginTop: 4 },
  tierCheck: { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  fieldLabel: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.heading, color: Colors.text, marginBottom: Spacing.sm },
  cityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  dateText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.text },
  counterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  counterLabel: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.text },
  counter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  counterBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  counterValue: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, minWidth: 24, textAlign: 'center' },
  addOnItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  addOnSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  addOnCheck: { marginRight: Spacing.md },
  addOnText: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary, flex: 1 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  reviewLabel: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  reviewValue: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  footer: { padding: Spacing.base, flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.borderLight },
});
