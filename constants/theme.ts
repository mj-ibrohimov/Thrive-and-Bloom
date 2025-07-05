// File: constants/theme.ts
export interface ThemeColors {
  darkText: any;
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
}

export interface ThemeFonts {
  regular: string;
  medium: string;
  bold: string;
}

export interface ThemeSpacing {
  small: number;
  medium: number;
  large: number;
}

export interface Theme {
  colors: ThemeColors;
  fonts: ThemeFonts;
  spacing: ThemeSpacing;
}

export const lightTheme: Theme = {
  colors: {
    primary: '#4F46E5',
    background: '#A1FFCE',
    card: '#F3F4F6',
    text: '#FFFFFF',
    darkText: '#000000',
    border: '#E5E7EB',
    notification: '#EF4444'
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System'
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24
  }
};

export const darkTheme: Theme = {
  colors: {
    primary: '#8B5CF6',
    background: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    darkText: '#FFFFFF',
    border: '#374151',
    notification: '#F87171'
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System'
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24
  }
};
