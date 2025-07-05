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
import { getJobs, Job } from '../../../lib/api/jobs';

export default function JobDetailScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { theme, settings } = useAccessibility();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJobs()
      .then(data => {
        const found = data.find(j => j.id === jobId);
        setJob(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [jobId]);

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
    subtitle: {
      fontSize: settings.textSize,
      color: theme.colors.text,
      marginBottom: theme.spacing.medium,
    },
    detailText: {
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
      <View style={styles.container}>
        <Text style={styles.title}>{job?.title}</Text>
        <Text style={styles.subtitle}>{job?.company}</Text>
        <Text style={styles.detailText}>
          {/* TODO: Replace with real job description when available */}
          Detailed information about this job will appear here.
        </Text>
      </View>
    </LinearGradient>
  );
}
