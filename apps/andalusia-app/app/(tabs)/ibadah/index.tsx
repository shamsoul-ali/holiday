import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useIbadahStore } from '@/store';
import { Card, ProgressBar, Badge } from '@/components/ui';
import { PrayerTime, KursusModule, DuaEntry } from '@/types';

const tabs = ['Solat', 'Kiblat', 'Panduan', 'Kursus', 'Doa'] as const;
type TabType = typeof tabs[number];

const umrahSteps = [
  { id: 's1', title: 'Niat & Ihram', desc: 'Berniat dan memakai ihram di Miqat', icon: 'heart' },
  { id: 's2', title: 'Tawaf', desc: 'Mengelilingi Kaabah 7 pusingan', icon: 'refresh-circle' },
  { id: 's3', title: 'Solat Sunat Tawaf', desc: '2 rakaat di Maqam Ibrahim', icon: 'star' },
  { id: 's4', title: 'Minum Air Zamzam', desc: 'Minum dan berdoa', icon: 'water' },
  { id: 's5', title: 'Saie', desc: '7 pusingan Safa - Marwah', icon: 'walk' },
  { id: 's6', title: 'Tahallul', desc: 'Cukur/potong rambut', icon: 'cut' },
];

export default function IbadahScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('Solat');
  const { prayerTimes, kursusModules, duas, checklists, favoriteDuas, toggleFavoriteDua, toggleChecklistItem } = useIbadahStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.pageTitle}>Ibadah</Text>

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>
        {/* SOLAT TAB */}
        {activeTab === 'Solat' && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <LinearGradient colors={['#059669', '#10B981']} style={styles.prayerHeader}>
              <Text style={styles.prayerCity}>Makkah Al-Mukarramah</Text>
              <Text style={styles.prayerNext}>Solat seterusnya: Asar</Text>
              <Text style={styles.prayerCountdown}>3j 22m lagi</Text>
            </LinearGradient>

            {prayerTimes.map((prayer) => (
              <View key={prayer.name} style={styles.prayerRow}>
                <Ionicons name={prayer.icon as any} size={20} color={Colors.primary} />
                <Text style={styles.prayerName}>{prayer.name}</Text>
                <Text style={styles.prayerTime}>{prayer.time}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* KIBLAT TAB */}
        {activeTab === 'Kiblat' && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.kiblatContainer}>
            <View style={styles.compassCircle}>
              <View style={styles.compassArrow}>
                <Ionicons name="navigate" size={48} color={Colors.primary} />
              </View>
              <Text style={styles.compassDegree}>292.5°</Text>
            </View>
            <Text style={styles.kiblatText}>Arah Kiblat</Text>
            <Text style={styles.kiblatSub}>Barat Laut dari lokasi anda</Text>
          </Animated.View>
        )}

        {/* PANDUAN TAB */}
        {activeTab === 'Panduan' && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.sectionTitle}>Langkah-langkah Umrah</Text>
            {umrahSteps.map((step, index) => (
              <View key={step.id} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumText}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
                <Ionicons name={step.icon as any} size={20} color={Colors.primary} />
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Senarai Semak</Text>
            {checklists.map((checklist) => (
              <Card key={checklist.id} style={{ marginBottom: Spacing.md }}>
                <Text style={styles.checklistTitle}>
                  {checklist.category === 'documents' ? 'Dokumen' : checklist.category === 'clothing' ? 'Pakaian' : checklist.category === 'medicines' ? 'Ubat-ubatan' : 'Keperluan'}
                </Text>
                {checklist.items.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.checkItem} onPress={() => toggleChecklistItem(checklist.id, item.id)}>
                    <Ionicons name={item.checked ? 'checkbox' : 'square-outline'} size={22} color={item.checked ? Colors.primary : Colors.textTertiary} />
                    <Text style={[styles.checkLabel, item.checked && styles.checkLabelDone]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </Card>
            ))}
          </Animated.View>
        )}

        {/* KURSUS TAB */}
        {activeTab === 'Kursus' && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.sectionTitle}>Kursus Umrah (8 Modul)</Text>
            <View style={styles.kursusProgress}>
              <Text style={styles.kursusPercent}>{Math.round(kursusModules.filter(m => m.status === 'completed').length / kursusModules.length * 100)}%</Text>
              <ProgressBar progress={kursusModules.filter(m => m.status === 'completed').length / kursusModules.length} height={8} />
            </View>

            {kursusModules.map((module, index) => (
              <TouchableOpacity key={module.id} style={styles.moduleCard}>
                <View style={[styles.moduleIcon, { backgroundColor: module.status === 'completed' ? Colors.primary + '15' : module.status === 'locked' ? Colors.border : Colors.secondary + '15' }]}>
                  <Ionicons name={module.icon as any} size={20} color={module.status === 'completed' ? Colors.primary : module.status === 'locked' ? Colors.textTertiary : Colors.secondary} />
                </View>
                <View style={styles.moduleContent}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleDuration}>{module.duration}</Text>
                  {module.status === 'in_progress' && <ProgressBar progress={module.progress} height={4} style={{ marginTop: 4 }} />}
                </View>
                <Badge
                  label={module.status === 'completed' ? 'Selesai' : module.status === 'in_progress' ? 'Sedang' : module.status === 'available' ? 'Mula' : 'Terkunci'}
                  color={module.status === 'completed' ? Colors.success : module.status === 'in_progress' ? Colors.secondary : module.status === 'available' ? Colors.info : Colors.textTertiary}
                  size="sm"
                />
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* DOA TAB */}
        {activeTab === 'Doa' && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.sectionTitle}>Doa & Zikir Umrah</Text>
            {duas.map((dua) => (
              <Card key={dua.id} style={styles.duaCard}>
                <View style={styles.duaHeader}>
                  <Badge label={dua.category} color={Colors.primary} size="sm" />
                  <TouchableOpacity onPress={() => toggleFavoriteDua(dua.id)}>
                    <Ionicons name={favoriteDuas.includes(dua.id) ? 'heart' : 'heart-outline'} size={22} color={favoriteDuas.includes(dua.id) ? Colors.error : Colors.textTertiary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.duaTitle}>{dua.title}</Text>
                <Text style={styles.duaArabic}>{dua.arabic}</Text>
                <Text style={styles.duaTranslit}>{dua.transliteration}</Text>
                <View style={styles.duaDivider} />
                <Text style={styles.duaTranslation}>{dua.translationBM}</Text>
              </Card>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  pageTitle: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: Colors.text, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },

  tabBar: { paddingHorizontal: Spacing.base, gap: Spacing.sm, marginBottom: Spacing.md },
  tab: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.surface },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary },
  tabTextActive: { color: '#FFFFFF' },

  content: { paddingHorizontal: Spacing.base },

  // Solat
  prayerHeader: { borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, alignItems: 'center' },
  prayerCity: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: 'rgba(255,255,255,0.8)' },
  prayerNext: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: '#FFFFFF', marginTop: 4 },
  prayerCountdown: { fontSize: Typography.sizes['2xl'], fontFamily: Typography.fonts.headingBold, color: '#FFFFFF', marginTop: 4 },
  prayerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: Spacing.md },
  prayerName: { flex: 1, fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodyMedium, color: Colors.text },
  prayerTime: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.heading, color: Colors.primary },

  // Kiblat
  kiblatContainer: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  compassCircle: { width: 200, height: 200, borderRadius: 100, borderWidth: 3, borderColor: Colors.primary + '30', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  compassArrow: { transform: [{ rotate: '-67.5deg' }] },
  compassDegree: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textSecondary, marginTop: Spacing.sm },
  kiblatText: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  kiblatSub: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 4 },

  // Panduan
  sectionTitle: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.text, marginBottom: Spacing.md },
  stepItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, gap: Spacing.md },
  stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.headingBold, color: '#FFFFFF' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.heading, color: Colors.text },
  stepDesc: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },

  checklistTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, marginBottom: Spacing.sm },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  checkLabel: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.text },
  checkLabelDone: { textDecorationLine: 'line-through', color: Colors.textTertiary },

  // Kursus
  kursusProgress: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  kursusPercent: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.primary },
  moduleCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, marginBottom: Spacing.sm, gap: Spacing.md },
  moduleIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  moduleContent: { flex: 1 },
  moduleTitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.heading, color: Colors.text },
  moduleDuration: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary },

  // Doa
  duaCard: { marginBottom: Spacing.md },
  duaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  duaTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, marginBottom: Spacing.sm },
  duaArabic: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.body, color: Colors.text, textAlign: 'right', lineHeight: 36, marginBottom: Spacing.sm },
  duaTranslit: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.primary, fontStyle: 'italic', marginBottom: Spacing.sm },
  duaDivider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.sm },
  duaTranslation: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, lineHeight: 20 },
});
