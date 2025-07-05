import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAccessibility } from '../../../context/AccessibilityContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = CARD_WIDTH * 0.6;

export default function WellbeingScreen() {
  const router = useRouter();
  const { theme, settings } = useAccessibility();

  const styles = StyleSheet.create({
    gradientBackground: {
      flex: 1,
    },
    headerContainer: {
      paddingTop: theme.spacing.medium + 20,
      paddingBottom: theme.spacing.small,
      alignItems: 'center',
    },
    headerText: {
      fontSize: settings.textSize + 8,
      fontWeight: '600',
      color: theme.colors.text,
    },
    cardsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT + 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: theme.spacing.small,
      padding: theme.spacing.medium,
      marginBottom: theme.spacing.medium,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    lottie: {
      width: CARD_WIDTH * 0.8,
      height: CARD_HEIGHT * 0.8,
      marginBottom: theme.spacing.small,
      marginHorizontal:0,
      verticalAlign: 'middle',
    },
    cardTitle: {
      fontSize: 22,
      top: -10,
      fontWeight: '500',
      textAlign: 'center',
      color: theme.colors.darkText,
    },
    footerContainer: {
      paddingVertical: theme.spacing.medium,
      alignItems: 'center',
    },
    footerText: {
      fontSize: settings.textSize * 0.875,
      color: theme.colors.darkText,
    },
  });

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.background]}
      style={styles.gradientBackground}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Take a moment for yourself</Text>
      </View>
      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/wellbeing/mood')}
        >
          <LottieView
            source={require('../../../assets/animations/mood.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={styles.cardTitle}>Mood Tracker</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/wellbeing/meditation')}
        >
          <LottieView
            source={require('../../../assets/animations/meditation.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={styles.cardTitle}>Meditation</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Relax your mind</Text>
      </View>
    </LinearGradient>
  );
}
