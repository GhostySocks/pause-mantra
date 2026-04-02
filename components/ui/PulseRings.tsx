import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

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
  const outerScale = useSharedValue(1);
  const outerOpacity = useSharedValue(0.4);
  const innerScale = useSharedValue(1);
  const innerOpacity = useSharedValue(0.4);
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    // Fade in the rings
    fadeIn.value = withDelay(
      200,
      withTiming(1, { duration: 1200, easing: Easing.ease })
    );

    // Breathe animation — outer
    outerScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    outerOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Breathe animation — inner (delayed)
    innerScale.value = withDelay(
      innerDelay,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
    innerOpacity.value = withDelay(
      innerDelay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, []);

  const outerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: outerScale.value }],
    opacity: outerOpacity.value * fadeIn.value,
  }));

  const innerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerScale.value }],
    opacity: innerOpacity.value * fadeIn.value,
  }));

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
          },
          outerAnimatedStyle,
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
          },
          innerAnimatedStyle,
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
