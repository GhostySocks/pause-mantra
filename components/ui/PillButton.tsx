import { useEffect, useRef } from 'react';
import { Pressable, Text, Animated, StyleSheet, Easing, type ViewStyle, type TextStyle } from 'react-native';
import { Colors, Fonts, FontSizes, Radius } from '@/constants';

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
  const scale = useRef(new Animated.Value(animate ? 0.82 : 1)).current;
  const opacity = useRef(new Animated.Value(animate ? 0 : 1)).current;

  useEffect(() => {
    if (animate) {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 900,
          delay: animationDelay,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 900,
          delay: animationDelay,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animate, animationDelay]);

  const isSolid = variant === 'solid';
  const bgColor = disabled
    ? Colors.buttonInactiveBg
    : color ?? (isSolid ? Colors.teal : 'transparent');
  const borderColor = isSolid ? 'transparent' : (color ?? Colors.closeBorder);
  const txtColor = disabled
    ? Colors.buttonInactiveText
    : textColor ?? (isSolid ? Colors.tealDark : Colors.ghostText);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.pill,
          {
            backgroundColor: bgColor,
            borderColor: borderColor,
            borderWidth: isSolid ? 0 : 1,
          },
          style,
        ]}
      >
        <Text style={[styles.label, { color: txtColor }, textStyle]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
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
