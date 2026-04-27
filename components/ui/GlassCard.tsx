import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Radius } from '@/constants';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  borderRadius?: number;
  padding?: number;
}

export function GlassCard({
  children,
  style,
  borderRadius = Radius.card,
  padding = 24,
}: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        { borderRadius, padding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.15)',
    overflow: 'hidden',
  },
});
