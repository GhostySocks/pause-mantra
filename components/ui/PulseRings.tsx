import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';

interface PulseRingsProps {
  outerSize?: number;
  innerSize?: number;
  outerColor?: string;
  innerColor?: string;
  duration?: number;
  innerDelay?: number;
}

export function PulseRings({
  outerSize = 260,
  innerSize = 200,
  outerColor = 'rgba(126,200,192,0.08)',
  innerColor = 'rgba(126,200,192,0.05)',
  duration = 5000,
  innerDelay = 800,
}: PulseRingsProps) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const outerScale = useRef(new Animated.Value(1)).current;
  const outerOpacity = useRef(new Animated.Value(0.4)).current;
  const innerScale = useRef(new Animated.Value(1)).current;
  const innerOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 1200,
      delay: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    // Outer breathe
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(outerScale, { toValue: 1.1, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(outerOpacity, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(outerScale, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(outerOpacity, { toValue: 0.4, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ])
    ).start();

    // Inner breathe (delayed)
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(innerScale, { toValue: 1.1, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(innerOpacity, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(innerScale, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(innerOpacity, { toValue: 0.4, duration: duration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ]),
        ])
      ).start();
    }, innerDelay);
  }, []);

  return (
    <>
      <Animated.View
        style={[
          styles.ring,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
            borderColor: outerColor,
            opacity: Animated.multiply(outerOpacity, fadeIn),
            transform: [{ scale: outerScale }],
          },
        ]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.ring,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            borderColor: innerColor,
            opacity: Animated.multiply(innerOpacity, fadeIn),
            transform: [{ scale: innerScale }],
          },
        ]}
        pointerEvents="none"
      />
    </>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderWidth: 1,
    alignSelf: 'center',
  },
});
