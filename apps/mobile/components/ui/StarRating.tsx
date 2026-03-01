import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/spacing';

interface StarRatingProps {
  rating: number;
  size?: number;
  color?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, size = 14, color = '#F59E0B' }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <View style={styles.container}>
      {Array.from({ length: 5 }, (_, i) => (
        <Ionicons
          key={i}
          name={i < fullStars ? 'star' : i === fullStars && hasHalf ? 'star-half' : 'star-outline'}
          size={size}
          color={color}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 1 },
});
