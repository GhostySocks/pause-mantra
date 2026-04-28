import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#321650' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="name" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="apps" />
      <Stack.Screen name="demo" />
      <Stack.Screen name="permissions" />
      <Stack.Screen name="paywall" />
    </Stack>
  );
}
