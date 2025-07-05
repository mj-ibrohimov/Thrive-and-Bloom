import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAccessibility } from '../../../context/AccessibilityContext';
import { useAuth } from '../../../context/AuthContext';

interface StatCard {
  id: string;
  label: string;
  value: string;
}

export const options = {
  tabBarButton: () => null,
  headerStyle: { backgroundColor: '#4F46E5', shadowColor: 'transparent', elevation: 0 },
  headerTintColor: '#FFFFFF',
  headerTitle: '',
  headerBackTitle: 'Back',
  headerTransparent: false,
  headerShadowVisible: false,
};

export default function ProfileScreen() {
  const { theme, settings } = useAccessibility();
  const { user } = useAuth();
  const [stats, setStats] = useState<StatCard[]>([]);

  useEffect(() => {
    // Mock stats; replace with real data fetching if needed
    setStats([
      { id: '1', label: 'Modules Completed', value: '5' },
      { id: '2', label: 'Jobs Applied', value: '3' },
      { id: '3', label: 'Sessions Logged', value: '12' },
    ]);
  }, []);

  const styles = StyleSheet.create({
    background: {
      flex: 1,
    },
    container: {
      flex: 1,
      padding: theme.spacing.medium,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.large,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: theme.spacing.small,
      backgroundColor: theme.colors.card,
    },
    name: {
      fontSize: settings.textSize + 4,
      fontWeight: '700',
      color: theme.colors.text,
    },
    email: {
      fontSize: settings.textSize,
      color: theme.colors.text,
      marginTop: theme.spacing.small,
    },
    statsList: {
      paddingBottom: theme.spacing.large,
    },
    statCard: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: theme.spacing.small,
      padding: theme.spacing.medium,
      marginBottom: theme.spacing.medium,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    statLabel: {
      fontSize: settings.textSize * 0.9,
      color: theme.colors.text,
      marginBottom: theme.spacing.small / 2,
    },
    statValue: {
      fontSize: settings.textSize + 2,
      fontWeight: '600',
      color: theme.colors.text,
    },
  });

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.background]}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar} />
          )}
          <Text style={styles.name}>{user?.name || 'User Name'}</Text>
          <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
        </View>
        <FlatList
          data={stats}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.statsList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.statCard}>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statValue}>{item.value}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </LinearGradient>
  );
}