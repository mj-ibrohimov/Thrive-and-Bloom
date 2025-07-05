// File: context/AccessibilityContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { darkTheme, lightTheme, Theme } from '../constants/theme';

interface AccessibilitySettings {
  theme: 'light' | 'dark';
  textSize: number;
  reduceMotion: boolean;
  highContrast: boolean;
  reduceContrast: boolean;
  accessibleFont: string;
  lineSpacing: number;
  letterSpacing: number;
  invertColors: boolean;
  focusMode: boolean;
  readingAssistant: boolean;
  stepGuide: boolean;
  extendedTime: boolean;
  feedbackSounds: boolean;
  subtitles: boolean;
  transcripts: boolean;
  silentMode: boolean;
  signLanguage: boolean;
  easyReadMode: boolean;
  autoTranslate: boolean;
  symbols: boolean;
  breadcrumbs: boolean;
  largeButtons: boolean;
  descriptiveLabels: boolean;
  keyboardNav: boolean;
  switchNav: boolean;
  voiceCommands: boolean;
  screenReader: boolean;
}

interface AccessibilityContextData {
  settings: AccessibilitySettings;
  theme: Theme;
  setTheme: (theme: 'light' | 'dark') => void;
  setTextSize: (size: number) => void;
  setReduceMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setReduceContrast: (enabled: boolean) => void;
  setAccessibleFont: (font: string) => void;
  setLineSpacing: (spacing: number) => void;
  setLetterSpacing: (spacing: number) => void;
  setInvertColors: (enabled: boolean) => void;
  setFocusMode: (enabled: boolean) => void;
  setReadingAssistant: (enabled: boolean) => void;
  setStepGuide: (enabled: boolean) => void;
  setExtendedTime: (enabled: boolean) => void;
  setFeedbackSounds: (enabled: boolean) => void;
  setSubtitles: (enabled: boolean) => void;
  setTranscripts: (enabled: boolean) => void;
  setSilentMode: (enabled: boolean) => void;
  setSignLanguage: (enabled: boolean) => void;
  setEasyReadMode: (enabled: boolean) => void;
  setAutoTranslate: (enabled: boolean) => void;
  setSymbols: (enabled: boolean) => void;
  setBreadcrumbs: (enabled: boolean) => void;
  setLargeButtons: (enabled: boolean) => void;
  setDescriptiveLabels: (enabled: boolean) => void;
  setKeyboardNav: (enabled: boolean) => void;
  setSwitchNav: (enabled: boolean) => void;
  setVoiceCommands: (enabled: boolean) => void;
  setScreenReader: (enabled: boolean) => void;
}

const defaultTheme = Appearance.getColorScheme() || 'light';

const defaultSettings: AccessibilitySettings = {
  theme: defaultTheme,
  textSize: 16,
  reduceMotion: false,
  highContrast: false,
  reduceContrast: false,
  accessibleFont: 'System',
  lineSpacing: 1,
  letterSpacing: 0,
  invertColors: false,
  focusMode: false,
  readingAssistant: false,
  stepGuide: false,
  extendedTime: false,
  feedbackSounds: true,
  subtitles: true,
  transcripts: false,
  silentMode: false,
  signLanguage: false,
  easyReadMode: false,
  autoTranslate: false,
  symbols: false,
  breadcrumbs: true,
  largeButtons: false,
  descriptiveLabels: true,
  keyboardNav: false,
  switchNav: false,
  voiceCommands: false,
  screenReader: false
};

const defaultResolvedTheme: Theme =
  defaultSettings.theme === 'dark' ? darkTheme : lightTheme;

const STORAGE_KEY = 'accessibility-settings';

const AccessibilityContext = createContext<AccessibilityContextData>({
  settings: defaultSettings,
  theme: defaultResolvedTheme,
  setTheme: () => {},
  setTextSize: () => {},
  setReduceMotion: () => {},
  setHighContrast: () => {},
  setReduceContrast: () => {},
  setAccessibleFont: () => {},
  setLineSpacing: () => {},
  setLetterSpacing: () => {},
  setInvertColors: () => {},
  setFocusMode: () => {},
  setReadingAssistant: () => {},
  setStepGuide: () => {},
  setExtendedTime: () => {},
  setFeedbackSounds: () => {},
  setSubtitles: () => {},
  setTranscripts: () => {},
  setSilentMode: () => {},
  setSignLanguage: () => {},
  setEasyReadMode: () => {},
  setAutoTranslate: () => {},
  setSymbols: () => {},
  setBreadcrumbs: () => {},
  setLargeButtons: () => {},
  setDescriptiveLabels: () => {},
  setKeyboardNav: () => {},
  setSwitchNav: () => {},
  setVoiceCommands: () => {},
  setScreenReader: () => {}
});

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Load stored settings on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored) {
        try {
          setSettings(JSON.parse(stored));
        } catch {}
      }
    });
  }, []);

  const currentTheme: Theme =
    settings.theme === 'dark' ? darkTheme : lightTheme;

  // Setter helpers that update state and persist to AsyncStorage
  const setTheme = (theme: 'light' | 'dark') => {
    setSettings(prev => {
      const updated = { ...prev, theme };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setTextSize = (size: number) => {
    setSettings(prev => {
      const updated = { ...prev, textSize: size };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setReduceMotion = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, reduceMotion: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setHighContrast = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, highContrast: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setReduceContrast = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, reduceContrast: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setAccessibleFont = (font: string) => {
    setSettings(prev => {
      const updated = { ...prev, accessibleFont: font };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setLineSpacing = (spacing: number) => {
    setSettings(prev => {
      const updated = { ...prev, lineSpacing: spacing };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setLetterSpacing = (spacing: number) => {
    setSettings(prev => {
      const updated = { ...prev, letterSpacing: spacing };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setInvertColors = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, invertColors: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setFocusMode = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, focusMode: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setReadingAssistant = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, readingAssistant: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setStepGuide = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, stepGuide: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setExtendedTime = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, extendedTime: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setFeedbackSounds = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, feedbackSounds: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setSubtitles = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, subtitles: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setTranscripts = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, transcripts: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setSilentMode = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, silentMode: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setSignLanguage = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, signLanguage: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setEasyReadMode = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, easyReadMode: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setAutoTranslate = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, autoTranslate: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setSymbols = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, symbols: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setBreadcrumbs = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, breadcrumbs: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setLargeButtons = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, largeButtons: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setDescriptiveLabels = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, descriptiveLabels: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setKeyboardNav = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, keyboardNav: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setSwitchNav = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, switchNav: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setVoiceCommands = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, voiceCommands: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };
  const setScreenReader = (enabled: boolean) => {
    setSettings(prev => {
      const updated = { ...prev, screenReader: enabled };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AccessibilityContext.Provider value={{
      settings,
      theme: currentTheme,
      setTheme,
      setTextSize,
      setReduceMotion,
      setHighContrast,
      setReduceContrast,
      setAccessibleFont,
      setLineSpacing,
      setLetterSpacing,
      setInvertColors,
      setFocusMode,
      setReadingAssistant,
      setStepGuide,
      setExtendedTime,
      setFeedbackSounds,
      setSubtitles,
      setTranscripts,
      setSilentMode,
      setSignLanguage,
      setEasyReadMode,
      setAutoTranslate,
      setSymbols,
      setBreadcrumbs,
      setLargeButtons,
      setDescriptiveLabels,
      setKeyboardNav,
      setSwitchNav,
      setVoiceCommands,
      setScreenReader
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
