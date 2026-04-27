import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants';
import { StarField } from './StarField';

interface GradientBackgroundProps {
  children: React.ReactNode;
  showStars?: boolean;
}

export function GradientBackground({ children, showStars = true }: GradientBackgroundProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...Colors.gradient.colors]}
        start={Colors.gradient.start}
        end={Colors.gradient.end}
        style={StyleSheet.absoluteFill}
      />
      {showStars && <View style={{ ...StyleSheet.absoluteFillObject, opacity: 0.7, zIndex: 1 }} pointerEvents="none"><StarField starCount={40} /></View>}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
});
