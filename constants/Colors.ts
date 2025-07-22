const LightTheme = {
  // Yellow variants (same as dark - they work great on light!)
  yellow: '#f9be03',
  lightYellow: '#fef3c7', // Much lighter for subtle backgrounds
  midYellow: '#f59e0b', // Slightly adjusted for better contrast
  darkYellow: '#d97706', // Darker for better readability
  
  // Backgrounds
  bgPrimary: '#ffffff',
  bgSecondary: '#f8fafc',
  bgCard: '#ffffff',
  bgAccent: '#f1f5f9', // For subtle sections
  
  // Text colors
  primaryText: '#0f172a',
  secondaryText: '#64748b',
  mutedText: '#94a3b8',
  darkText: '#1e293b', // For text on yellow backgrounds
  
  // Status colors
  success: '#059669', // Darker green for better contrast
  error: '#dc2626', // Darker red for better contrast
  info: '#2563eb', // Darker blue for better contrast
  warning: '#d97706', // Harmonizes with yellow palette
  
  // UI elements
  border: '#e2e8f0',
  borderLight: '#cbd5e1',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)'
};

const DarkTheme = {
  // Yellow variants
  yellow: '#f9be03',
  lightYellow: '#fbbf24',
  midYellow: '#eab308',
  darkYellow: '#ca8a04',
  
  // Backgrounds
  bgPrimary: '#030712',
  bgSecondary: '#111827',
  bgCard: '#1f2937',
  bgAccent: '#374151', // For subtle sections
  
  // Text colors
  primaryText: '#ffffff',
  secondaryText: '#9ca3af',
  mutedText: '#6b7280',
  darkText: '#111827', // For text on yellow backgrounds
  
  // Status colors
  success: '#10b981', // Green for positive transactions
  error: '#f87171',
  info: '#3b82f6',
  warning: '#f97316',
  
  // UI elements
  border: '#374151',
  borderLight: '#4b5563',
  shadow: 'rgba(0, 0, 0, 0.25)',
  overlay: 'rgba(0, 0, 0, 0.8)'
};

export const Themes = {
  light: LightTheme,
  dark: DarkTheme,
};
