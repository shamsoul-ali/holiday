import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { Card, Badge } from '@/components/ui';
import { SOSButton } from '@/components/safety/SOSButton';
import { AlertBanner } from '@/components/safety/AlertBanner';
import { TideChart } from '@/components/safety/TideChart';
import { WeatherCards } from '@/components/safety/WeatherCards';
import {
  safetyAlerts,
  emergencyContacts,
  hospitals,
  embassies,
  tideData,
  weatherForecast,
  prayerTimes,
} from '@/data';

export default function SafetyHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const activeAlerts = safetyAlerts.filter((a) => a.active);
  const quickContacts = emergencyContacts.slice(0, 4);
  const nextPrayer = prayerTimes[3];

  const call = (number: string) => {
    Alert.alert('Call Now?', number, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Linking.openURL(`tel:${number}`) },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Gradient header */}
      <LinearGradient colors={[...Colors.gradients.oceanDepth]} style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>SAFETY & EMERGENCY</Text>
            <Text style={styles.title}>Bayu Safety Hub</Text>
          </View>
          <View style={styles.backBtn}>
            <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Live alert banner */}
        <Animated.View entering={FadeInDown.delay(60).duration(450)} style={styles.section}>
          <AlertBanner
            alerts={activeAlerts}
            onPress={(a) => router.push({ pathname: '/(tabs)/home/safety-hub/alert/[id]', params: { id: a.id } } as any)}
          />
        </Animated.View>

        {/* SOS */}
        <Animated.View entering={FadeInDown.delay(120).duration(450)} style={styles.sosSection}>
          <Text style={styles.sosCaption}>Tap to dial Sabah emergency services</Text>
          <SOSButton number="999" />
          <View style={styles.sosQuickRow}>
            {quickContacts.map((c) => (
              <TouchableOpacity key={c.id} style={styles.sosChip} onPress={() => call(c.number)}>
                <Ionicons
                  name={c.type === 'police' ? 'shield' : c.type === 'ambulance' ? 'medkit' : c.type === 'fire' ? 'flame' : c.type === 'coast-guard' ? 'boat' : 'call'}
                  size={14}
                  color={Colors.primary}
                />
                <Text style={styles.sosChipText}>{c.type === 'tourism-hotline' ? 'Tourism' : c.type.replace('-', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Weather forecast */}
        <Animated.View entering={FadeInDown.delay(180).duration(450)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>5-Day Weather</Text>
            <Text style={styles.sectionHint}>Kota Kinabalu</Text>
          </View>
          <WeatherCards days={weatherForecast} />
        </Animated.View>

        {/* Tide chart */}
        <Animated.View entering={FadeInDown.delay(220).duration(450)} style={styles.section}>
          <TideChart data={tideData} currentHour={3} />
        </Animated.View>

        {/* Prayer times mini */}
        <Animated.View entering={FadeInDown.delay(260).duration(450)} style={styles.section}>
          <LinearGradient colors={[...Colors.gradients.spiritual]} style={styles.prayerCard}>
            <View style={styles.prayerLeft}>
              <Text style={styles.prayerEyebrow}>Next Prayer</Text>
              <Text style={styles.prayerName}>{nextPrayer.name}</Text>
              <Text style={styles.prayerTime}>{nextPrayer.time}</Text>
            </View>
            <View style={styles.prayerRight}>
              {prayerTimes.slice(0, 5).map((p) => (
                <View key={p.name} style={styles.prayerRow}>
                  <Text style={styles.prayerRowName}>{p.name}</Text>
                  <Text style={styles.prayerRowTime}>{p.time}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Hospitals */}
        <Animated.View entering={FadeInDown.delay(300).duration(450)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Hospitals</Text>
            <Badge label={`${hospitals.length} locations`} color={Colors.surfaceSecondary} textColor={Colors.primary} size="sm" />
          </View>
          <View style={styles.sectionPadding}>
            {hospitals.map((h) => (
              <Card key={h.id} style={styles.hospitalCard}>
                <View style={styles.hospitalIcon}>
                  <Ionicons name="medical" size={22} color={Colors.error} />
                </View>
                <View style={styles.hospitalContent}>
                  <View style={styles.hospitalTopRow}>
                    <Text style={styles.hospitalName} numberOfLines={1}>{h.name}</Text>
                    {h.is24h && <Badge label="24H" color={Colors.success + '20'} textColor={Colors.success} size="sm" />}
                  </View>
                  <Text style={styles.hospitalLocation} numberOfLines={1}>{h.location}</Text>
                  <View style={styles.hospitalMeta}>
                    <Ionicons name="walk-outline" size={12} color={Colors.textTertiary} />
                    <Text style={styles.hospitalMetaText}>{h.distanceKm} km</Text>
                    <View style={styles.dot} />
                    <Text style={styles.hospitalMetaText}>{h.specialty}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.callBtn} onPress={() => call(h.phone)}>
                  <Ionicons name="call" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        </Animated.View>

        {/* Embassies */}
        <Animated.View entering={FadeInDown.delay(340).duration(450)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Embassy Directory</Text>
            <Text style={styles.sectionHint}>For foreign travellers</Text>
          </View>
          <View style={styles.sectionPadding}>
            <Card style={{ padding: 0 }}>
              {embassies.map((e, i) => (
                <TouchableOpacity
                  key={e.id}
                  style={[styles.embassyRow, i < embassies.length - 1 && styles.embassyBorder]}
                  onPress={() => call(e.phone)}
                >
                  <Text style={styles.flag}>{e.flag}</Text>
                  <View style={styles.embassyContent}>
                    <Text style={styles.embassyCountry}>{e.country}</Text>
                    <Text style={styles.embassyMeta} numberOfLines={1}>{e.hoursLabel}</Text>
                  </View>
                  <Ionicons name="call" size={18} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        </Animated.View>

        {/* All emergency contacts */}
        <Animated.View entering={FadeInDown.delay(380).duration(450)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Emergency Contacts</Text>
          </View>
          <View style={styles.sectionPadding}>
            <Card style={{ padding: 0 }}>
              {emergencyContacts.map((c, i) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.contactRow, i < emergencyContacts.length - 1 && styles.embassyBorder]}
                  onPress={() => call(c.number)}
                >
                  <View style={styles.contactIcon}>
                    <Ionicons
                      name={c.type === 'police' ? 'shield' : c.type === 'ambulance' ? 'medkit' : c.type === 'hospital' ? 'medical' : c.type === 'coast-guard' ? 'boat' : c.type === 'fire' ? 'flame' : 'call'}
                      size={18}
                      color={Colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactName}>{c.name}</Text>
                    <Text style={styles.contactNumber}>{c.number}</Text>
                  </View>
                  <Ionicons name="call" size={18} color={Colors.primary} />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  eyebrow: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
    marginTop: 2,
  },

  content: { paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  section: { paddingHorizontal: Spacing.base, marginBottom: Spacing.lg },
  sectionPadding: { paddingHorizontal: Spacing.base, marginTop: Spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },
  sectionHint: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
  },

  sosSection: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sosCaption: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.base,
  },
  sosQuickRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.base,
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
  },
  sosChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sosChipText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.text,
    textTransform: 'capitalize',
  },

  prayerCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.base,
    ...Shadows.md,
  },
  prayerLeft: { flex: 1, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.25)', paddingRight: Spacing.base },
  prayerEyebrow: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1,
  },
  prayerName: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
    marginTop: 2,
  },
  prayerTime: {
    fontSize: Typography.sizes.lg,
    fontFamily: Typography.fonts.heading,
    color: 'rgba(255,255,255,0.92)',
    marginTop: 2,
  },
  prayerRight: { flex: 1.1, justifyContent: 'center' },
  prayerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  prayerRowName: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: 'rgba(255,255,255,0.82)',
  },
  prayerRowTime: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.bodyMedium,
    color: '#FFFFFF',
  },

  hospitalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.base,
  },
  hospitalIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hospitalContent: { flex: 1, gap: 2 },
  hospitalTopRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  hospitalName: {
    flex: 1,
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },
  hospitalLocation: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
  },
  hospitalMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  hospitalMetaText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.textTertiary,
    textTransform: 'capitalize',
  },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.textTertiary, marginHorizontal: 4 },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  embassyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.base,
  },
  embassyBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  flag: { fontSize: 28 },
  embassyContent: { flex: 1, gap: 2 },
  embassyCountry: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },
  embassyMeta: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textTertiary,
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.base,
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactName: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.bodySemiBold,
    color: Colors.text,
  },
  contactNumber: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
