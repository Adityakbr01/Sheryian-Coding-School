import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'sans-serif',
});

export const typography: Record<string, TextStyle> = {
  h1: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  h2: {
    fontFamily,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
  },
  caption: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400',
  },
};
