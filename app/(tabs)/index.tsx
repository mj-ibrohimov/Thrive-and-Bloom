import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, ActivityIndicator as RNActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';
import { getThreads, Thread } from '../../lib/api/community';
import { getJobs, Job } from '../../lib/api/jobs';
import { getLearningModules, LearningModule } from '../../lib/api/learning';
import { getMotivationalPhrases } from '../../lib/api/motivational';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.6;

const SECTIONS = [
  { label: 'Learn', route: '/learn', color: '#4F46E5' },
  { label: 'Jobs', route: '/jobs', color: '#10B981' },
  { label: 'Marketplace', route: '/marketplace', color: '#F59E0B' },
  { label: 'Well-being', route: '/wellbeing', color: '#14B8A6' },
  { label: 'Community', route: '/community', color: '#6366F1' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { theme, settings } = useAccessibility();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    horizontalScroll: {
      paddingVertical: theme.spacing.medium,
    },
    header: {
      paddingTop: theme.spacing.large,
      paddingHorizontal: theme.spacing.medium,
      paddingBottom: theme.spacing.large,
    },
    greeting: {
      fontSize: settings.textSize * 2,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.small,
    },
    subtitle: {
      fontSize: settings.textSize,
      color: theme.colors.text,
      fontStyle: 'italic',
    },
    sections: {
      paddingLeft: theme.spacing.medium,
      paddingRight: theme.spacing.medium,
      alignItems: 'center',
      flexDirection: 'row',
    },
    sectionCard: {
      borderRadius: theme.spacing.small,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    sectionText: {
      color: theme.colors.primary,
      fontSize: settings.textSize * 1.2,
      fontWeight: '600',
    },
    loader: {
      padding: theme.spacing.medium,
      alignItems: 'center',
    },
    feedHeader: {
      fontSize: settings.textSize + 4,
      fontWeight: '700',
      paddingHorizontal: theme.spacing.medium,
      paddingTop: theme.spacing.medium,
      color: theme.colors.text,
    },
    feedList: {
      paddingBottom: theme.spacing.medium,
    },
    feedItem: {
      borderRadius: theme.spacing.small,
      padding: theme.spacing.medium,
      marginHorizontal: theme.spacing.medium,
      marginTop: theme.spacing.small,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    feedItemInner: {
      flex: 1,
    },
    feedTitle: {
      fontSize: settings.textSize,
      fontWeight: '600',
      color: theme.colors.textDark,
    },
    feedSubtitle: {
      fontSize: settings.textSize * 0.875,
      color: theme.colors.textDark,
      marginTop: theme.spacing.small,
    },
    lottie: {
      width: CARD_WIDTH,
      height: CARD_WIDTH - 50,
      marginBottom: theme.spacing.medium,
      alignSelf: 'center',
    },
  });

  //const { user } = useAuth();
  const user = { name: "Andrea"};
  const [phrase, setPhrase] = useState<string>('');
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  useEffect(() => {
    getMotivationalPhrases().then(list => {
      if (list.length) {
        const idx = Math.floor(Math.random() * list.length);
        setPhrase(list[idx]);
      }
    });
  }, []);

  useEffect(() => {
    Promise.all([getLearningModules(), getJobs(), getThreads()]).then(
      ([mods, js, ths]) => {
        setModules(mods);
        setJobs(js);
        setThreads(ths);
        setFeedLoading(false);
      }
    ).catch(() => setFeedLoading(false));
  }, []);

  return (
    <LinearGradient colors={[theme.colors.primary, theme.colors.background]} style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.large }}>
        <LottieView
          source={require('../../assets/animations/loto.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello{user?.name ? `, ${user.name}` : '!'}
          </Text>
          <Text style={styles.subtitle}>{phrase}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.sections}
        >
          {SECTIONS.map(sec => (
                            <BlurView intensity={20} tint="light" style={styles.feedItem}>

            <TouchableOpacity
              key={sec.route}
              style={[
                styles.sectionCard,
                {
                  width: 180,
                  height: 80,
                  marginRight: theme.spacing.medium,
                }
              ]}
              onPress={() => router.push(sec.route)}
            >
              <Text style={[styles.sectionText, { color: sec.color }]}>{sec.label}</Text>
            </TouchableOpacity>
            </BlurView>
          ))}
        </ScrollView>
        {feedLoading ? (
          <View style={styles.loader}>
            <RNActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <>
            <Text style={styles.feedHeader}>Recommended Learning</Text>
            {modules.map(item => {
              const onPress = () => router.push(`/learn/${item.id}`);
              return (
                <BlurView intensity={20} tint="light" style={styles.feedItem} key={item.id}>
                  <TouchableOpacity onPress={onPress} style={styles.feedItemInner}>
                    <Text style={styles.feedTitle}>{item.title}</Text>
                    <Text style={styles.feedSubtitle}>{item.description}</Text>
                  </TouchableOpacity>
                </BlurView>
              );
            })}
            <Text style={styles.feedHeader}>Latest Jobs</Text>
            {jobs.map(item => {
              const onPress = () => router.push(`/jobs/${item.id}`);
              return (
                <BlurView intensity={20} tint="light" style={styles.feedItem} key={item.id}>
                  <TouchableOpacity onPress={onPress} style={styles.feedItemInner}>
                    <Text style={styles.feedTitle}>{item.title}</Text>
                    <Text style={styles.feedSubtitle}>{item.company}</Text>
                  </TouchableOpacity>
                </BlurView>
              );
            })}
            <Text style={styles.feedHeader}>Community Posts</Text>
            {threads.map(item => {
              const onPress = () => router.push(`/community/${item.id}`);
              return (
                <BlurView intensity={20} tint="light" style={styles.feedItem} key={item.id}>
                  <TouchableOpacity onPress={onPress} style={styles.feedItemInner}>
                    <Text style={styles.feedTitle}>{item.title}</Text>
                  </TouchableOpacity>
                </BlurView>
              );
            })}
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
