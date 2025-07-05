import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAccessibility } from '../../../context/AccessibilityContext';
import { getLearningModules, LearningModule } from '../../../lib/api/learning';

export default function LearnDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, settings } = useAccessibility();
  const [module, setModule] = useState<LearningModule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLearningModules()
      .then(data => {
        const found = data.find(m => m.id === id);
        setModule(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

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
    title: {
      fontSize: settings.textSize + 4,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.small,
    },
    description: {
      fontSize: settings.textSize,
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
      <View style={styles.container}>
        <Text style={styles.title}>{module?.title}</Text>
        <Text style={styles.description}>{module?.description}</Text>
      </View>
    </LinearGradient>
  );
}
