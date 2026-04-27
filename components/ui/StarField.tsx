import { useEffect, useRef, useMemo } from 'react';
import { Animated, StyleSheet, Dimensions, Easing, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  layer: number;
}

function generateStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const layer = i < count * 0.4 ? 0 : i < count * 0.75 ? 1 : 2;
    stars.push({
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      size: layer === 0 ? 1.5 : layer === 1 ? 2.5 : 4,
      opacity: layer === 0 ? 0.25 : layer === 1 ? 0.4 : 0.6,
      speed: layer === 0 ? 0.15 : layer === 1 ? 0.3 : 0.5,
      layer,
    });
  }
  return stars;
}

function AnimatedStar({ star }: { star: Star }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const twinkle = useRef(new Animated.Value(star.opacity)).current;

  useEffect(() => {
    // Slow vertical drift
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -20 * star.speed,
          duration: 12000 / star.speed,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 20 * star.speed,
          duration: 12000 / star.speed,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle horizontal drift
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 10 * star.speed,
          duration: 15000 / star.speed,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -10 * star.speed,
          duration: 15000 / star.speed,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Twinkle
    Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, {
          toValue: star.opacity * 0.3,
          duration: 2000 + Math.random() * 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(twinkle, {
          toValue: star.opacity,
          duration: 2000 + Math.random() * 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: star.x,
        top: star.y,
        width: star.size,
        height: star.size,
        borderRadius: star.size / 2,
        backgroundColor: '#7EC8C0',
        opacity: twinkle,
        transform: [{ translateY }, { translateX }],
      }}
    />
  );
}

interface StarFieldProps {
  starCount?: number;
}

export function StarField({ starCount = 40 }: StarFieldProps) {
  const stars = useMemo(() => generateStars(starCount), [starCount]);

  return (
    <View style={styles.container} pointerEvents="none">
      {stars.map((star, i) => (
        <AnimatedStar key={i} star={star} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 1,
  },
});
