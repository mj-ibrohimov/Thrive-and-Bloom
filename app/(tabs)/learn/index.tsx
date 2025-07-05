import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAccessibility } from '../../../context/AccessibilityContext';
import { getLearningModules, LearningModule } from '../../../lib/api/learning';

export default function LearnScreen() {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const { theme, settings } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      backdropFilter: 'blur(10px)',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    cardTitle: {
      fontSize: settings.textSize,
      fontWeight: '600',
      marginBottom: theme.spacing.small,
      color: theme.colors.text,
    },
    cardDescription: {
      fontSize: settings.textSize * 0.875,
      color: theme.colors.text,
    },
  });

  useEffect(() => {
    getLearningModules()
      .then(data => {
        setModules(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
        data={modules}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/learn/${item.id}`)}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </LinearGradient>
  );
}
