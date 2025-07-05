import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useAccessibility } from '../../../context/AccessibilityContext';
import { getProfiles, Profile } from '../../../lib/api/marketplace';

export default function MarketplaceDetailScreen() {
  const { id: profileId } = useLocalSearchParams<{ id: string }>();
  const { theme, settings } = useAccessibility();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfiles()
      .then(data => {
        const found = data.find(p => p.id === profileId);
        setProfile(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [profileId]);

  const styles = StyleSheet.create({
    gradientBackground: {
      flex: 1,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flex: 1,
      padding: theme.spacing.medium,
    },
    name: {
      fontSize: settings.textSize + 4,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.small,
    },
    skill: {
      fontSize: settings.textSize,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: theme.spacing.medium,
    },
    description: {
      fontSize: settings.textSize * 0.9,
      color: theme.colors.text,
      lineHeight: settings.textSize * 1.4,
    },
  });

  if (loading) {
    return (
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.background]}
        style={styles.gradientBackground}
      >
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.background]}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.skill}>{profile?.skill}</Text>
        <Text style={styles.description}>
          {profile?.description ?? 'No additional details available.'}
        </Text>
      </View>
    </LinearGradient>
  );
}
