/**
 * Pause Mantra — Design System Colors
 * LOCKED VALUES — do not modify without design approval
 */

export const Colors = {
  // Gradient background (used on every screen)
  gradient: {
    colors: ['#4A2875', '#321650', '#2A1228'] as const,
    start: { x: 0.3, y: 0 },
    end: { x: 0.7, y: 1 },
  },

  // Modal sheet gradient
  modalGradient: {
    colors: ['#2A1650', '#1E1040'] as const,
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },

  // Core palette
  teal: '#7EC8C0',
  tealDark: '#0D2E2B',
  deepPurple: '#321650',
  cream: '#F3EEFF',
  lavender: '#D8B4FE',
  mauve: '#C4A8E0',

  // Chant button progression
  chant: {
    step0: '#7EC8C0',
    step1: '#6DB8B0',
    step2: '#5CA8A0',
  },

  // Semantic
  textPrimary: '#F3EEFF',
  textSecondary: '#C4A8E0',
  textAccent: '#7EC8C0',
  textMuted: '#D8B4FE',

  // Surfaces
  cardBg: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(216,180,254,0.15)',
  chipBg: 'rgba(255,255,255,0.05)',
  chipBorder: 'rgba(216,180,254,0.25)',
  chipSelectedBg: '#7EC8C0',
  chipSelectedBorder: '#7EC8C0',
  chipSelectedText: '#0D2E2B',

  // Rings
  pulseRingOuter: 'rgba(126,200,192,0.12)',
  pulseRingInner: 'rgba(126,200,192,0.07)',
  splashRingOuter: 'rgba(126,200,192,0.08)',
  splashRingInner: 'rgba(126,200,192,0.05)',

  // Button states
  buttonInactiveBg: 'rgba(126,200,192,0.25)',
  buttonInactiveText: 'rgba(13,46,43,0.5)',
  ghostBorder: 'rgba(216,180,254,0.15)',
  ghostText: '#D8B4FE',
  closeBorder: 'rgba(216,180,254,0.25)',

  // Gate screen
  progressDotActive: '#7EC8C0',
  progressDotInactive: 'rgba(255,255,255,0.12)',

  // Calendar heatmap
  calendarEmpty: 'rgba(255,255,255,0.05)',
  calendarEmptyText: 'rgba(196,168,224,0.35)',
  calendarActive: 'rgba(126,200,192,0.25)',
  calendarActiveText: '#7EC8C0',
  calendarHigh: '#7EC8C0',
  calendarHighText: '#0D2E2B',

  // Progress bar
  progressActive: '#7EC8C0',
  progressInactive: 'rgba(255,255,255,0.15)',

  // Misc
  separator: 'rgba(255,255,255,0.06)',
  iconCircleBg: 'rgba(126,200,192,0.15)',
  tooltipBg: 'rgba(26,5,51,0.97)',
  tooltipBorder: 'rgba(126,200,192,0.3)',

  // Master Mantra
  masterCardBg: 'rgba(126,200,192,0.07)',
  masterCardBorder: 'rgba(126,200,192,0.15)',

  // Tab bar
  tabActive: '#7EC8C0',
  tabInactive: '#C4A8E0',

  // Plan card states
  planSelectedBg: 'rgba(126,200,192,0.12)',
  planSelectedBorder: '#7EC8C0',
  planUnselectedBg: 'rgba(255,255,255,0.04)',
  planUnselectedBorder: 'rgba(216,180,254,0.2)',

  // Search bar
  searchBg: 'rgba(255,255,255,0.04)',
  searchBorder: 'rgba(216,180,254,0.1)',

  // Status pills
  statusEntered: '#7EC8C0',
  statusClosed: '#C4A8E0',
} as const;
