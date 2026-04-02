import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants';

interface GradientBackgroundProps {
  children: React.ReactNode;
}

export function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <LinearGradient
      colors={[...Colors.gradient.colors]}
      start={Colors.gradient.start}
      end={Colors.gradient.end}
      style={styles.gradient}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
