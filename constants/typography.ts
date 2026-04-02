/**
 * Pause Mantra — Typography System
 * Fonts: Cormorant Garamond (display) + Inter (UI)
 */

export const Fonts = {
  cormorant: {
    regular: 'CormorantGaramond_400Regular',
    italic: 'CormorantGaramond_400Regular_Italic',
    medium: 'CormorantGaramond_500Medium',
    mediumItalic: 'CormorantGaramond_500Medium_Italic',
    semiBold: 'CormorantGaramond_600SemiBold',
    bold: 'CormorantGaramond_700Bold',
  },
  inter: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
} as const;

export const FontSizes = {
  // Cormorant Garamond sizes
  displayLarge: 34,   // Welcome headline
  displayMedium: 30,  // Onboarding headlines
  displaySmall: 28,   // Home greeting, paywall headline
  mantraGate: 27,     // Gate screen mantra
  masterMantra: 26,   // Master Mantra screen
  sectionTitle: 26,   // Journal/Library titles
  mantraCard: 22,     // Home mantra card
  mantraList: 20,     // Library featured mantra
  categoryModal: 16,  // Category modal mantra rows
  mantraSmall: 14,    // Liked list / history items
  mantraXSmall: 13,   // Gate log mantras
  wordmark: 32,       // Splash wordmark

  // Inter sizes
  buttonLarge: 15,    // CTA buttons
  buttonMedium: 14,   // Secondary buttons
  body: 14,           // Body text
  bodySmall: 13,      // Subtitles, app names
  label: 12,          // Labels, links
  caption: 11,        // Captions, eyebrows, taglines
  micro: 10,          // Category counts, timestamps
  nano: 9,            // Calendar day labels

  // Stat tiles
  statNumber: 28,     // Cormorant stat value
} as const;

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
} as const;

export const LetterSpacing = {
  eyebrow: 3,       // Uppercase labels (e.g., "MINDFUL BY DESIGN")
  stepLabel: 3,      // "STEP 1 OF 5"
  sectionLabel: 2,   // "TODAY'S MANTRA"
  statLabel: 1.5,    // Stat tile labels
  wordmark: 1,       // "Pause Mantra" splash
  cta: 0.3,          // CTA button text
} as const;

export const LineHeights = {
  tight: 1.2,
  snug: 1.25,
  normal: 1.55,
  relaxed: 1.6,
  body: 1.65,
} as const;
