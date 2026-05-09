export const Colors = {
  primary: '#6C63FF',
  secondary: '#FF6B9D',
  tertiary: '#00D4AA',
  warning: '#FFB347',
  background: '#0A0A0F',
  surface: '#13131A',
  card: '#1C1C27',
  border: '#2A2A3A',
  text: '#F0EFF8',
  muted: '#8A899A',
  error: '#FF6B9D',
  success: '#00D4AA',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
  },
};

export default {
  Colors,
  Spacing,
  Typography,
};
