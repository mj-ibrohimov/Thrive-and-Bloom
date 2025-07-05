

import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

export default function CommunityLayout() {
  const router = useRouter();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Community',
          headerShown: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/community/profile')}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="person-circle-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: 'Community details' }}
      />
      <Stack.Screen
        name="profile"
        options={{ title: 'Profile', headerShown: false }}
      />
    </Stack>
  );
}