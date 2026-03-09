import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Card } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';

const faqs = [
  {
    question: 'How do I plan a trip?',
    answer: 'Tap "AI Plan" on the home screen or go to the Explore tab. Our AI wizard will guide you through choosing a destination, budget, and preferences to create a personalized Sabah itinerary.',
  },
  {
    question: 'How does the wallet work?',
    answer: 'Your Bayu wallet stores travel credits in MYR. Top up via FPX, credit card, or e-wallets. Credits can be used for bookings, activities, and experiences across the platform.',
  },
  {
    question: 'Can I modify my booking?',
    answer: 'Go to the Bookings tab and tap on your booking. You can modify dates, add activities, or request cancellation up to 48 hours before your trip start date.',
  },
  {
    question: 'What is the Sabah Travel Pass?',
    answer: 'The Sabah Travel Pass gives you discounted access to multiple attractions, activities, and transport options across Sabah. Visit the Discover tab to learn more and activate your pass.',
  },
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Help & Support" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {faqs.map((faq, i) => (
          <Card key={i} style={styles.faqCard}>
            <TouchableOpacity
              style={styles.faqHeader}
              onPress={() => setExpanded(expanded === i ? null : i)}
              activeOpacity={0.7}
            >
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Ionicons
                name={expanded === i ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>
            {expanded === i && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </Card>
        ))}

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Card style={styles.contactCard}>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:support@bayutravel.my')}
          >
            <View style={[styles.contactIcon, { backgroundColor: Colors.primary + '15' }]}>
              <Ionicons name="mail" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>Email Support</Text>
              <Text style={styles.contactValue}>support@bayutravel.my</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        </Card>

        <Card style={styles.contactCard}>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('https://wa.me/60123456789')}
          >
            <View style={[styles.contactIcon, { backgroundColor: Colors.success + '15' }]}>
              <Ionicons name="logo-whatsapp" size={20} color={Colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>WhatsApp</Text>
              <Text style={styles.contactValue}>+60 12-345 6789</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 100 },
  sectionTitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.bodySemiBold, color: Colors.textTertiary, marginTop: Spacing.xl, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  faqCard: { marginBottom: Spacing.sm },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { flex: 1, fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text, marginRight: Spacing.sm },
  faqAnswer: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, lineHeight: 22, marginTop: Spacing.sm },
  contactCard: { marginBottom: Spacing.sm },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  contactIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text },
  contactValue: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginTop: 1 },
});
