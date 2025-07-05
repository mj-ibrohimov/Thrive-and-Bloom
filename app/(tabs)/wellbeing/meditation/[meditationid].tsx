import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAccessibility } from '../../../../context/AccessibilityContext';
import {
    getMeditationSessions,
    MeditationSession,
} from '../../../../lib/api/meditation';

// Helper to format milliseconds to mm:ss
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(minutes)}:${pad(seconds)}`;
}

export default function MeditationDetailScreen() {
  const { meditationid } = useLocalSearchParams<{ meditationid: string }>();
  const { theme, settings } = useAccessibility();
  const [session, setSession] = useState<MeditationSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    getMeditationSessions()
      .then(data => {
        const found = data.find(s => s.id === meditationid);
        setSession(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [meditationid]);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 1);
      setIsPlaying(status.isPlaying);
    }
  };

  const togglePlayback = async () => {
    if (!sound && session) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        session.audioUrl,
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    } else if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

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

  if (!session) {
    return (
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.background]}
        style={styles.gradientBackground}
      >
        <View style={styles.loaderContainer}>
          <Text style={{ color: theme.colors.text }}>Session not found.</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.background]}
      style={styles.gradientBackground}
    >
      <View style={[styles.container, { padding: theme.spacing.medium }]}>
        <Text style={[styles.title, { fontSize: settings.textSize + 4, color: theme.colors.text, marginBottom: theme.spacing.small }]}>
          {session.title}
        </Text>
        <Text style={[styles.description, { fontSize: settings.textSize, color: theme.colors.text, marginBottom: theme.spacing.medium }]}>
          {session.description}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onValueChange={async value => {
            if (sound) {
              await sound.setPositionAsync(value);
            }
          }}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.border}
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}> / </Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.playButton,
            { backgroundColor: 'transparent', paddingHorizontal: theme.spacing.large, paddingVertical: theme.spacing.medium, borderRadius: theme.spacing.small },
            isPlaying && { backgroundColor: 'transparent' },
          ]}
          onPress={togglePlayback}
        >
          <Ionicons
            name={isPlaying ? 'pause-circle-outline' : 'play-circle-outline'}
            size={settings.textSize * 4}
            color={theme.colors.background}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

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
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
  slider: {
    width: '90%',
    height: 40,
    alignSelf: 'center',
    marginBottom: 16,
  },
  playButton: {
    alignSelf: 'center',
  },
  playing: {},
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timeText: {
    color: '#FFFF',
    fontSize: 14,
  },
});
