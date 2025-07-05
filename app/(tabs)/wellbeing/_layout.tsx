import { Stack } from 'expo-router';
import React from 'react';

export default function WellbeingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#4F46E5', shadowColor: 'transparent', elevation: 0 },
        headerTintColor: '#FFFFFF',
        headerTransparent: false,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Well-being', headerShown: false }}
      />
      <Stack.Screen
        name="mood"
        options={{ title: 'Mood Tracker', headerShown: true }}
      />
      <Stack.Screen
        name="meditation"
        options={{ title: 'Meditation', headerShown: false }}
      />
      <Stack.Screen
        name="meditation/[meditationid]"
        options={{ headerShown: true, headerTitle: '', headerBackTitle: 'Back' }}
      />
    </Stack>
  );
}
