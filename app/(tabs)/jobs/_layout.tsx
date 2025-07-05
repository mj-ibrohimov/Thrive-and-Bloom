

import { Stack } from 'expo-router';
import React from 'react';

export default function JobsLayout() {
  return (
    <Stack
        screenOptions={{
        headerStyle: {
          backgroundColor: '#4F46E5',
          shadowColor: 'transparent',  // iOS
          elevation: 0,                // Android
        },
        headerTintColor: '#FFFFFF',
        headerTransparent: false,
        headerShadowVisible: false,  
        headerTitle: ""
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Jobs', headerShown: false }}
      />
      <Stack.Screen
        name="[jobId]"
        options={{ title: 'Job Detail' }}
      />
    </Stack>
  );
}