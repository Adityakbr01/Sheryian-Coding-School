import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { ThemeProvider } from "@/context/ThemeContext";
import { useAuth } from "@/features/auth/hooks/useAuth";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useFonts } from "expo-font";
import { Text, TextInput } from "react-native";
import { typography } from "@/theme/typography";

// Apply default font to all Text and TextInput components in the app
const customTextProps = {
  style: {
    fontFamily: typography.fonts.neueMedium,
  },
};
(Text as any).defaultProps = { ...((Text as any).defaultProps || {}), ...customTextProps };
(TextInput as any).defaultProps = { ...((TextInput as any).defaultProps || {}), ...customTextProps };

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isDark } = useTheme();
  const { isInitializing, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

   const [loaded, error] = useFonts({
    "Fontspring-Juana": require("../../assets/fonts/Fontspring-juana.ttf"),
    "HelveticaNow-Regular": require("../../assets/fonts/HelveticaNowDisplay-Regular.woff2"),
    "HelveticaNow-Medium": require("../../assets/fonts/HelveticaNowDisplay-Medium.woff2"),
    "HelveticaNow-Bold": require("../../assets/fonts/HelveticaNowDisplay-Bold.woff2"),
    "HelveticaNow-Light": require("../../assets/fonts/HelveticaNowDisplay-Light.woff2"),
    "NeueMachina-Light": require("../../assets/fonts/NeueMachina-Light.ttf"),
    "NeueMachina-Regular": require("../../assets/fonts/NeueMachina-Regular.ttf"),
    "NeueMachina-Medium": require("../../assets/fonts/NeueMachina-Medium.ttf"),
    "NeueMachina-Bold": require("../../assets/fonts/NeueMachina-Bold.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isAuthenticated && inAuthGroup) {
      // Redirect to home if user is logged in but tries to access auth screens
      router.replace("/(home)");
    } else if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if user is not logged in but tries to access auth-protected routes
      router.replace("/(auth)/login");
    }

    // Hide splash screen once we know the routing context
    SplashScreen.hideAsync();
  }, [isAuthenticated, isInitializing, segments]);

  if (!loaded && !error) {
    return null;
  }

  if (isInitializing) return null; // Avoid rendering anything until auth state is known

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/signUp/index" />
        <Stack.Screen name="(auth)/login/index" />
        <Stack.Screen name="(home)" />
      </Stack>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </KeyboardProvider>
  );
}
