import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAccessibility } from '../../../context/AccessibilityContext';

const MOOD_KEY = 'user-mood';

const moods = [
  { label: '😞', value: 'sad' },
  { label: '😐', value: 'neutral' },
  { label: '😊', value: 'happy' },
  { label: '😃', value: 'very_happy' },
  { label: '😍', value: 'excited' },
];

export default function MoodScreen() {
  const { theme, settings } = useAccessibility();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  useEffect(() => {
    // load saved mood
    AsyncStorage.getItem(MOOD_KEY).then(saved => {
      if (saved) setSelectedMood(saved);
    });
  }, []);

  const saveMood = async () => {
    if (!selectedMood) {
      Alert.alert('Select a mood', 'Please choose how you feel before saving.');
      return;
    }
    try {
      await AsyncStorage.setItem(MOOD_KEY, selectedMood);
      Alert.alert('Saved', 'Your mood has been recorded.');
    } catch {
      Alert.alert('Error', 'Could not save your mood.');
    }
  };

  const styles = StyleSheet.create({
    gradientBackground: {
      flex: 1
    },
    container: {
      flex: 1,
      padding: theme.spacing.medium,
      alignItems: 'center',
    },
    prompt: {
      marginTop: theme.spacing.large,
      marginBottom: theme.spacing.large,
      fontWeight: '600',
      fontSize: settings.textSize + 2,
      color: theme.colors.text,
    },
    options: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginBottom: theme.spacing.large,
    },
    moodButton: {
      padding: theme.spacing.medium,
    },
    moodButtonSelected: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderRadius: 50,
    },
    moodEmoji: {
      fontSize: settings.textSize * 2,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.large,
      paddingVertical: theme.spacing.medium,
      borderRadius: theme.spacing.small,
    },
    saveButtonText: {
      color: theme.colors.background,
      fontSize: settings.textSize,
      fontWeight: '600',
    },
  });

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.background]}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        <Text style={styles.prompt}>
          How are you feeling today?
        </Text>
        <View style={styles.options}>
          {moods.map(m => (
            <TouchableOpacity
              key={m.value}
              style={selectedMood === m.value ? [styles.moodButton, styles.moodButtonSelected] : styles.moodButton}
              onPress={() => setSelectedMood(m.value)}
            >
              <Text style={styles.moodEmoji}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={saveMood}>
          <Text style={styles.saveButtonText}>Save Mood</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
