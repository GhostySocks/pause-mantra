import Svg, { Rect, Path, Circle, Line } from 'react-native-svg';
import { Colors } from '@/constants';

interface LockIconProps {
  size?: number;
  color?: string;
}

export function LockIcon({ size = 52, color = Colors.teal }: LockIconProps) {
  const scale = size / 52;

  return (
    <Svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      {/* Shackle arc */}
      <Path
        d="M17 22V18C17 13.0294 21.0294 9 26 9C30.9706 9 35 13.0294 35 18V22"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Body */}
      <Rect
        x={14}
        y={22}
        width={24}
        height={20}
        rx={6}
        stroke={color}
        strokeWidth={1.5}
        fill="none"
      />
      {/* Keyhole circle */}
      <Circle
        cx={26}
        cy={31}
        r={2.5}
        fill={color}
      />
      {/* Keyhole line */}
      <Line
        x1={26}
        y1={33.5}
        x2={26}
        y2={37}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
