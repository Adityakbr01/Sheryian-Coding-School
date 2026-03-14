import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { ThemeProvider } from "@/context/ThemeContext";
import { useAuth } from "@/features/auth/hooks/useAuth";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isDark } = useTheme();
  const { isInitializing, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isAuthenticated && inAuthGroup) {
      // Redirect to home if user is logged in but tries to access auth screens
      router.replace("/(home)");
    } else if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if user is not logged in but tries to access auth-protected routes
      router.replace("/(auth)/signUp");
    }

    // Hide splash screen once we know the routing context
    SplashScreen.hideAsync();
  }, [isAuthenticated, isInitializing, segments]);

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
