import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useAccessibility } from '../../../context/AccessibilityContext';
import { getPersonalizedPath, LearningPathStep } from '../../../lib/api/ai';

export default function AILearnScreen() {
  const { theme, settings } = useAccessibility();
  const [path, setPath] = useState<LearningPathStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPersonalizedPath('user-id')
      .then(data => {
        setPath(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: { padding: theme.spacing.medium },
    stepCard: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: theme.spacing.small,
      padding: theme.spacing.medium,
      marginBottom: theme.spacing.medium,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
      overflow: 'hidden',
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
      marginBottom: theme.spacing.small,
    },
    duration: {
      fontSize: settings.textSize * 0.875,
      color: theme.colors.text,
      fontStyle: 'italic',
    },
  });

  if (loading) {
    return (
      <LinearGradient colors={[theme.colors.primary, theme.colors.background]} style={styles.gradient}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[theme.colors.primary, theme.colors.background]} style={styles.gradient}>
      <FlatList
        data={path}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
          <View style={styles.stepCard}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.duration}>{item.duration} min</Text>
          </View>
        )}
      />
    </LinearGradient>
  );
}
