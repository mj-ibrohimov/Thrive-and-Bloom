import { Stack } from "expo-router";

export default function MarketplaceLayout() {
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
          options={{ title: 'Marketplace', headerShown: false }} 
        />
        <Stack.Screen 
          name="id" 
          options={{ title: 'Marketplace Detail' }} 
        />
    </Stack>
  )
}