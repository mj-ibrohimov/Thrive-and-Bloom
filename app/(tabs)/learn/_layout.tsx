import { Stack } from 'expo-router';
import React from 'react';
import { useAccessibility } from '../../../context/AccessibilityContext';

export default function LearnLayout() {
  const { theme } = useAccessibility();
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
          shadowColor: 'transparent',  // iOS
          elevation: 0,                // Android
        },
        headerTintColor: theme.colors.text,
        headerTransparent: false,
        headerShadowVisible: false,  
        headerTitle: ""
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ title: 'Learn', headerShown: false}} 
      />
      <Stack.Screen 
        name="id" 
        options={{ headerShown: true, headerTitle: '', headerBackTitle: 'Learn' }} 
      />
      <Stack.Screen
        name="ai"
        options={{ headerShown: true, headerTitle: ''}}
        />
    </Stack>
  );
}