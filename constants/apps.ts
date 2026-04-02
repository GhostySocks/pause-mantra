/**
 * Pause Mantra — Suggested Apps for Gating
 * Default time-wasting apps shown during onboarding
 */

export interface SuggestedApp {
  name: string;
  emoji: string;
  color: string;
  category: string;
  bundleId: string;       // iOS
  packageName: string;    // Android
}

export const SUGGESTED_APPS: SuggestedApp[] = [
  {
    name: 'Instagram',
    emoji: '📷',
    color: '#E1306C',
    category: 'Social',
    bundleId: 'com.burbn.instagram',
    packageName: 'com.instagram.android',
  },
  {
    name: 'TikTok',
    emoji: '🎵',
    color: '#010101',
    category: 'Social',
    bundleId: 'com.zhiliaoapp.musically',
    packageName: 'com.zhiliaoapp.musically',
  },
  {
    name: 'Facebook',
    emoji: '👤',
    color: '#1877F2',
    category: 'Social',
    bundleId: 'com.facebook.Facebook',
    packageName: 'com.facebook.katana',
  },
  {
    name: 'Twitter/X',
    emoji: '𝕏',
    color: '#000000',
    category: 'Social',
    bundleId: 'com.atebits.Tweetie2',
    packageName: 'com.twitter.android',
  },
  {
    name: 'YouTube',
    emoji: '▶️',
    color: '#FF0000',
    category: 'Entertainment',
    bundleId: 'com.google.ios.youtube',
    packageName: 'com.google.android.youtube',
  },
  {
    name: 'Snapchat',
    emoji: '👻',
    color: '#FFFC00',
    category: 'Social',
    bundleId: 'com.toyopagroup.picaboo',
    packageName: 'com.snapchat.android',
  },
  {
    name: 'Reddit',
    emoji: '🤖',
    color: '#FF4500',
    category: 'Social',
    bundleId: 'com.reddit.Reddit',
    packageName: 'com.reddit.frontpage',
  },
  {
    name: 'LinkedIn',
    emoji: '💼',
    color: '#0A66C2',
    category: 'Professional',
    bundleId: 'com.linkedin.LinkedIn',
    packageName: 'com.linkedin.android',
  },
  {
    name: 'Pinterest',
    emoji: '📌',
    color: '#E60023',
    category: 'Social',
    bundleId: 'pinterest',
    packageName: 'com.pinterest',
  },
  {
    name: 'Twitch',
    emoji: '🎮',
    color: '#9146FF',
    category: 'Entertainment',
    bundleId: 'tv.twitch',
    packageName: 'tv.twitch.android.app',
  },
];
