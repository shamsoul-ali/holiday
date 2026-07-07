import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Card, Button } from '@/components/ui';
import { ScreenHeader } from '@/components/shared';

export default function RateScreen() {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Please select a rating', 'Tap the stars to rate your experience.');
      return;
    }
    Alert.alert(
      'Thank you! 🎉',
      `You rated Bayu ${rating}/5 stars. Your feedback helps us improve the app for all travelers.`,
      [{ text: 'OK' }],
    );
    setRating(0);
    setFeedback('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Rate the App" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.ratingCard}>
          <Text style={styles.title}>How's your experience?</Text>
          <Text style={styles.subtitle}>Your rating helps us improve Bayu for everyone</Text>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={star <= rating ? Colors.sunset : Colors.textTertiary}
                />
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {rating <= 2 ? 'We can do better' : rating <= 3 ? 'Good' : rating === 4 ? 'Great!' : 'Excellent!'}
            </Text>
          )}
        </Card>

        <Card style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Share your thoughts (optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="What do you like? What can we improve?"
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={4}
            value={feedback}
            onChangeText={setFeedback}
            textAlignVertical="top"
          />
        </Card>

        <Button title="Submit Rating" onPress={handleSubmit} size="lg" style={styles.submitBtn} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 100 },
  ratingCard: { alignItems: 'center', paddingVertical: Spacing['2xl'], marginTop: Spacing.lg },
  title: { fontSize: Typography.sizes.xl, fontFamily: Typography.fonts.headingBold, color: Colors.text, marginBottom: Spacing.xs },
  subtitle: { fontSize: Typography.sizes.sm, fontFamily: Typography.fonts.body, color: Colors.textSecondary, marginBottom: Spacing.xl },
  stars: { flexDirection: 'row', gap: Spacing.md },
  ratingLabel: { fontSize: Typography.sizes.md, fontFamily: Typography.fonts.bodySemiBold, color: Colors.primary, marginTop: Spacing.md },
  feedbackCard: { marginTop: Spacing.lg },
  feedbackTitle: { fontSize: Typography.sizes.base, fontFamily: Typography.fonts.bodySemiBold, color: Colors.text, marginBottom: Spacing.sm },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.base,
    fontFamily: Typography.fonts.body,
    color: Colors.text,
    minHeight: 100,
  },
  submitBtn: { marginTop: Spacing.xl },
});
