import { spacing } from '@/theme';
import { Platform, StyleSheet } from 'react-native';


const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0, // Padding moved to scrollContent
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoText: {
    fontSize: 40,
    fontFamily: Platform.select({ ios: 'Serif', android: 'serif' }),
    fontWeight: '500',
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  tagline: {
    opacity: 0.7,
  },
  content: {
    gap: spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  socialButtons: {
    gap: spacing.sm,
  },
  socialButton: {
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: spacing.sm,
  },
  emailContainer: {
    marginBottom: spacing.sm,
  },
  submitButton: {
    width: '100%',
  },
  footer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
    opacity: 0.7,
    marginHorizontal: spacing.xl,
    lineHeight: 18,
  },
  themeToggle: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.sm,
  },
});

export default styles;