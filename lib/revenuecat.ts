/**
 * Pause Mantra — RevenueCat Configuration
 * Product IDs and entitlement constants
 */

// RevenueCat Product IDs
export const PRODUCTS = {
  BASE_MONTHLY: 'pausemantra_base_monthly',     // $4.99/mo
  BASE_ANNUAL: 'pausemantra_base_annual',        // $39/yr ($3.25/mo)
  PRO_MONTHLY: 'pausemantra_pro_monthly',        // $7.99/mo
  PRO_ANNUAL: 'pausemantra_pro_annual',          // $59/yr ($4.92/mo)
  PRO_LIFETIME: 'pausemantra_pro_lifetime',      // $89 one-time
} as const;

// Entitlement IDs
export const BASE_ENTITLEMENT = 'base';
export const PRO_ENTITLEMENT = 'pro';

// Pricing display
export const PRICING = {
  [PRODUCTS.BASE_MONTHLY]: { price: '$4.99', period: '/mo', display: '$4.99/mo' },
  [PRODUCTS.BASE_ANNUAL]: { price: '$39', period: '/yr', display: '$39/yr', perMonth: '$3.25/mo' },
  [PRODUCTS.PRO_MONTHLY]: { price: '$7.99', period: '/mo', display: '$7.99/mo' },
  [PRODUCTS.PRO_ANNUAL]: { price: '$59', period: '/yr', display: '$59/yr', perMonth: '$4.92/mo' },
  [PRODUCTS.PRO_LIFETIME]: { price: '$89', period: '', display: '$89 one-time' },
} as const;

/**
 * Check subscription entitlements
 * Pro is a superset — Pro users also get all Base features
 *
 * Usage:
 *   const { entitlements } = await Purchases.getCustomerInfo();
 *   const isPro  = entitlements.active[PRO_ENTITLEMENT] !== undefined;
 *   const isBase = entitlements.active[BASE_ENTITLEMENT] !== undefined || isPro;
 */

// TODO: Initialize RevenueCat SDK when keys are provided
// import Purchases from 'react-native-purchases';
// export async function initRevenueCat() {
//   const apiKey = Platform.OS === 'ios'
//     ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
//     : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
//   if (apiKey) {
//     Purchases.configure({ apiKey });
//   }
// }
