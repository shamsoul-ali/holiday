import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { Card, Button, Badge } from '@/components/ui';
import { LiveDot } from '@/components/gov/widgets';
import { safetyAlerts, alertExtras } from '@/data';

const severityColors: Record<string, string> = {
  info: Colors.info,
  warning: Colors.warning,
  danger: Colors.error,
};

const severityBg: Record<string, string> = {
  info: '#E0F4FE',
  warning: '#FEF4DB',
  danger: '#FEE2E0',
};

const typeIcon: Record<string, string> = {
  tide: 'water',
  weather: 'cloud',
  trail: 'trail-sign',
  wildlife: 'paw',
};

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [marked, setMarked] = useState(false);

  const alert = safetyAlerts.find((a) => a.id === id);
  const extras = alert ? alertExtras[alert.id] : undefined;

  if (!alert || !extras) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.floatBack}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.missingText}>Alert not found.</Text>
      </View>
    );
  }

  const tint = severityColors[alert.severity];

  const handleMark = () => {
    Alert.alert(
      'Mark yourself safe?',
      'Your emergency contacts will be notified that you are safe in this area.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Safe',
          onPress: () => {
            setMarked(true);
            Alert.alert('You\'re marked safe', 'Your contacts have been notified. Stay vigilant.');
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[tint, tint + 'AA']} style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={styles.severityPill}>
              <LiveDot color="#FFFFFF" size={6} />
              <Text style={styles.severityText}>{alert.severity.toUpperCase()} ALERT</Text>
            </View>
          </View>
          <View style={styles.backBtn}>
            <Ionicons name={typeIcon[alert.type] as any} size={20} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.alertTitle}>{alert.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location" size={12} color="rgba(255,255,255,0.85)" />
            <Text style={styles.metaText}>{alert.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={12} color="rgba(255,255,255,0.85)" />
            <Text style={styles.metaText}>Updated {extras.updatedMinutesAgo}m ago</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Message */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <Card style={{ ...styles.messageCard, backgroundColor: severityBg[alert.severity] }}>
            <Text style={styles.messageText}>{alert.message}</Text>
          </Card>
        </Animated.View>

        {/* Mini-map */}
        <Animated.View entering={FadeInDown.delay(120).duration(400)} style={{ marginTop: Spacing.base }}>
          <Text style={styles.sectionTitle}>Affected Location</Text>
          <View style={styles.mapWrap}>
            <LinearGradient colors={[Colors.surfaceSecondary, Colors.surface]} style={styles.mapGradient}>
              <Svg width={220} height={220} style={{ position: 'absolute' }}>
                <Defs>
                  <RadialGradient id="pulse" cx="50%" cy="50%" r="50%">
                    <Stop offset="0" stopColor={tint} stopOpacity="0.5" />
                    <Stop offset="1" stopColor={tint} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx={110} cy={110} r={90} fill="url(#pulse)" />
                <Circle cx={110} cy={110} r={60} fill="url(#pulse)" opacity={0.7} />
                <Circle cx={110} cy={110} r={32} fill={tint} opacity={0.2} />
                <Circle cx={110} cy={110} r={10} fill={tint} />
                <Circle cx={110} cy={110} r={5} fill="#FFFFFF" />
              </Svg>
              <View style={styles.mapBadge}>
                <Ionicons name="location" size={14} color={tint} />
                <Text style={styles.mapBadgeText}>
                  {extras.coordinates.lat.toFixed(4)}°, {extras.coordinates.lng.toFixed(4)}°
                </Text>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.areasRow}>
            {extras.affectedAreas.map((a) => (
              <Badge key={a} label={a} color={tint + '20'} textColor={tint} size="sm" />
            ))}
          </View>
        </Animated.View>

        {/* Action steps */}
        <Animated.View entering={FadeInDown.delay(160).duration(400)} style={{ marginTop: Spacing.xl }}>
          <Text style={styles.sectionTitle}>What You Should Do</Text>
          {extras.actionSteps.map((step, i) => (
            <Card key={step.id} style={styles.stepCard}>
              <View style={[styles.stepNumber, { backgroundColor: tint }]}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepTopRow}>
                  <Ionicons name={step.icon as any} size={16} color={tint} />
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                <Text style={styles.stepDesc}>{step.description}</Text>
              </View>
            </Card>
          ))}
        </Animated.View>

        {/* Update schedule */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Card style={styles.updateCard}>
            <Ionicons name="refresh" size={18} color={Colors.primary} />
            <Text style={styles.updateText}>
              Next official update in <Text style={{ fontFamily: Typography.fonts.heading, color: Colors.text }}>~{extras.nextUpdateHours}h</Text>
            </Text>
          </Card>
        </Animated.View>

        {/* Mark safe */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)} style={{ marginTop: Spacing.lg }}>
          {marked ? (
            <View style={styles.markedBanner}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.markedText}>You've marked yourself safe</Text>
            </View>
          ) : (
            <Button
              title="I'm Safe — Notify Contacts"
              onPress={handleMark}
              size="lg"
              fullWidth
              icon={<Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />}
            />
          )}
        </Animated.View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  floatBack: {
    position: 'absolute',
    top: 50,
    left: Spacing.base,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  missingText: {
    textAlign: 'center',
    marginTop: 120,
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
  },

  header: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: BorderRadius.full,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodySemiBold,
    letterSpacing: 1,
  },
  alertTitle: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.fonts.headingBold,
    color: '#FFFFFF',
    marginTop: Spacing.base,
    lineHeight: Typography.sizes.xl * 1.2,
  },
  metaRow: { flexDirection: 'row', gap: Spacing.base, marginTop: Spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
    color: 'rgba(255,255,255,0.9)',
  },

  content: { padding: Spacing.base, paddingTop: Spacing.lg },

  messageCard: { padding: Spacing.base, borderWidth: 0 },
  messageText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.body,
    color: Colors.text,
    lineHeight: Typography.sizes.base * 1.5,
  },

  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  mapWrap: { alignItems: 'center', marginBottom: Spacing.base },
  mapGradient: {
    width: 220,
    height: 220,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  mapBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
  },
  mapBadgeText: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.fonts.bodyMedium,
    color: Colors.text,
  },
  areasRow: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },

  stepCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.headingBold,
  },
  stepContent: { flex: 1, gap: 4 },
  stepTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepTitle: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.heading,
    color: Colors.text,
  },
  stepDesc: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.4,
  },

  updateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
    marginTop: Spacing.base,
  },
  updateText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.fonts.body,
    color: Colors.textSecondary,
  },

  markedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.base,
    backgroundColor: Colors.success + '15',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },
  markedText: {
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.heading,
    color: Colors.success,
  },
});
