import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAccessibility } from '../../../context/AccessibilityContext';
import { getMeditationSessions, MeditationSession } from '../../../lib/api/meditation';

export default function MeditationScreen() {
  const { theme, settings } = useAccessibility();
  const router = useRouter();
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeditationSessions()
      .then(data => {
        setSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const styles = StyleSheet.create({
    gradientBackground: {
      flex: 1,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContainer: {
      padding: theme.spacing.medium,
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: theme.spacing.small,
      padding: theme.spacing.medium,
      marginBottom: theme.spacing.medium,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    title: {
      fontSize: settings.textSize + 2,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.small,
    },
    description: {
      fontSize: settings.textSize * 0.875,
      color: theme.colors.text,
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
      <FlatList
        data={sessions}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/wellbeing/meditation/${item.id}`)}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </LinearGradient>
  );
}
