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
import { getThreads, Thread } from '../../../lib/api/community';

export default function CommunityDetailScreen() {
  const { id: threadId } = useLocalSearchParams<{ id: string }>();
  const { theme, settings } = useAccessibility();
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getThreads()
      .then(data => {
        const found = data.find(t => t.id === threadId);
        setThread(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [threadId]);

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
    author: {
      fontSize: settings.textSize,
      color: theme.colors.text,
      marginBottom: theme.spacing.medium,
      fontStyle: 'italic',
    },
    content: {
      fontSize: settings.textSize,
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
        <Text style={styles.title}>{thread?.title}</Text>
        <Text style={styles.author}>by {thread?.author}</Text>
        <Text style={styles.content}>{thread?.content}</Text>
      </View>
    </LinearGradient>
  );
}
