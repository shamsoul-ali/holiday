import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/spacing';
import { useBookingStore } from '@/store';
import { formatCurrency, formatDateRange } from '@/utils';
import { Badge, Card, ProgressBar } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';
import { VisaStatus } from '@/types';

const visaSteps: { status: VisaStatus; label: string }[] = [
  { status: 'not_started', label: 'Belum Mula' },
  { status: 'submitted', label: 'Dihantar' },
  { status: 'processing', label: 'Diproses' },
  { status: 'approved', label: 'Diluluskan' },
];

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { bookings } = useBookingStore();
  const booking = bookings.find((b) => b.id === id);

  if (!booking) return null;

  const visaIndex = visaSteps.findIndex((s) => s.status === booking.visaStatus);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Butiran Tempahan" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: booking.image }} style={styles.heroImage} />

        <Card style={styles.mainCard}>
          <Text style={styles.title}>{booking.packageTitle}</Text>
          <Text style={styles.ref}>Rujukan: {booking.reference}</Text>
          <Text style={styles.dates}>{formatDateRange(booking.startDate, booking.endDate)}</Text>
          <Text style={styles.price}>{formatCurrency(booking.totalCost)}</Text>
        </Card>

        {/* Visa Tracker */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Status Visa</Text>
          <View style={styles.visaTracker}>
            {visaSteps.map((step, index) => (
              <View key={step.status} style={styles.visaStep}>
                <View style={[styles.visaDot, index <= visaIndex ? styles.visaDotActive : null]} >
                  {index <= visaIndex && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text style={[styles.visaLabel, index <= visaIndex && styles.visaLabelActive]}>{step.label}</Text>
                {index < visaSteps.length - 1 && <View style={[styles.visaLine, index < visaIndex && styles.visaLineActive]} />}
              </View>
            ))}
          </View>
        </Card>

        {/* Kursus Progress */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Kursus Umrah</Text>
          <View style={styles.kursusRow}>
            <Text style={styles.kursusPercent}>{Math.round(booking.kursusProgress * 100)}%</Text>
            <View style={{ flex: 1 }}>
              <ProgressBar progress={booking.kursusProgress} color={Colors.primary} height={8} />
            </View>
          </View>
          <Text style={styles.kursusText}>{booking.kursusProgress >= 1 ? 'Tahniah! Kursus selesai' : 'Teruskan pembelajaran anda'}</Text>
        </Card>

        {/* Mutawif */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Mutawif</Text>
          <View style={styles.mutawifRow}>
            <View style={styles.mutawifAvatar}>
              <Ionicons name="person" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mutawifName}>{booking.mutawifName}</Text>
              <Text style={styles.mutawifSub}>Mutawif bertauliah</Text>
            </View>
            <TouchableOpacity style={styles.contactBtn}>
              <Ionicons name="call" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* WhatsApp Group */}
        {booking.groupWhatsApp && (
          <TouchableOpacity style={styles.whatsappCard}>
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            <View style={{ flex: 1 }}>
              <Text style={styles.whatsappTitle}>Kumpulan WhatsApp</Text>
              <Text style={styles.whatsappSub}>Sertai kumpulan perjalanan anda</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* Documents */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Dokumen</Text>
          {['Pasport', 'Visa Umrah', 'E-Tiket', 'Baucar Hotel', 'Sijil Insurans'].map((doc) => (
            <TouchableOpacity key={doc} style={styles.docRow}>
              <Ionicons name="document-text" size={20} color={Colors.primary} />
              <Text style={styles.docText}>{doc}</Text>
              <Ionicons name="download-outline" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base },
  heroImage: { width: '100%', height: 180, borderRadius: BorderRadius.lg, marginBottom: Spacing.base },
  mainCard: { marginBottom: Spacing.base, gap: Spacing.xs },
  title: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.text },
  ref: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodyMedium, color: Colors.textTertiary },
  dates: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  price: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: Colors.primary },

  section: { marginBottom: Spacing.base },
  sectionTitle: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.heading, color: Colors.text, marginBottom: Spacing.md },

  visaTracker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  visaStep: { alignItems: 'center', flex: 1 },
  visaDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  visaDotActive: { backgroundColor: Colors.primary },
  visaLabel: { fontSize: Typography.sizes.xs, fontFamily: Typography.fonts.body, color: Colors.textTertiary, marginTop: 4, textAlign: 'center' },
  visaLabelActive: { color: Colors.primary, fontFamily: Typography.fonts.bodyMedium },
  visaLine: { position: 'absolute', top: 14, left: '60%', right: '-40%', height: 2, backgroundColor: Colors.border },
  visaLineActive: { backgroundColor: Colors.primary },

  kursusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  kursusPercent: { fontSize: Typography.sizes.lg, fontFamily: Typography.fonts.headingBold, color: Colors.primary },
  kursusText: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: Spacing.sm },

  mutawifRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  mutawifAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  mutawifName: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.heading, color: Colors.text },
  mutawifSub: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },
  contactBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center' },

  whatsappCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, backgroundColor: '#25D366' + '10', borderRadius: BorderRadius.lg, marginBottom: Spacing.base, gap: Spacing.md },
  whatsappTitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.heading, color: Colors.text },
  whatsappSub: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary },

  docRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  docText: { flex: 1, fontSize: Typography.sizes.base, fontFamily: Typography.fonts.body, color: Colors.text },
});
