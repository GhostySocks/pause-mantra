import { Pressable, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Colors, Fonts, FontSizes, Radius } from '@/constants';

const ENTRANCE_EASING = Easing.bezier(0.16, 1, 0.3, 1);

interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'ghost';
  disabled?: boolean;
  animate?: boolean;
  animationDelay?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  color?: string;
  textColor?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PillButton({
  label,
  onPress,
  variant = 'solid',
  disabled = false,
  animate = false,
  animationDelay = 0,
  style,
  textStyle,
  color,
  textColor,
}: PillButtonProps) {
  const scale = useSharedValue(animate ? 0.82 : 1);
  const opacity = useSharedValue(animate ? 0 : 1);

  useEffect(() => {
    if (animate) {
      scale.value = withDelay(
        animationDelay,
        withTiming(1, { duration: 900, easing: ENTRANCE_EASING })
      );
      opacity.value = withDelay(
        animationDelay,
        withTiming(1, { duration: 900, easing: ENTRANCE_EASING })
      );
    }
  }, [animate, animationDelay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const isSolid = variant === 'solid';
  const bgColor = disabled
    ? Colors.buttonInactiveBg
    : color ?? (isSolid ? Colors.teal : 'transparent');
  const borderColor = isSolid ? 'transparent' : (color ?? Colors.closeBorder);
  const txtColor = disabled
    ? Colors.buttonInactiveText
    : textColor ?? (isSolid ? Colors.tealDark : Colors.ghostText);

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.pill,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderWidth: isSolid ? 0 : 1,
        },
        animatedStyle,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: txtColor },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: Radius.pill,
    paddingVertical: 17,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  label: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.buttonLarge,
    letterSpacing: 0.3,
  },
});
