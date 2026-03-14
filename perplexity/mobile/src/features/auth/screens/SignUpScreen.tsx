import { AppText } from "@/components/common/AppText";
import { Screen } from "@/components/layout/Screen";
import { CustomAlert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import APP_INFO from "@/constants/app.info";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuth } from "../hooks/useAuth";
import styles from "../styles/SignUp.style";

const SignUpScreen = () => {
  const { colors, toggleTheme, isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {
    register,
    googleLogin,
    isLoading,
    isInitializing,
    isAuthenticated,
    error,
  } = useAuth();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertContent, setAlertContent] = useState({ title: "", message: "" });
  const router = useRouter();

  // Auto redirect handled by RootLayout

  React.useEffect(() => {
    if (error) {
      setAlertContent({ title: "Error", message: error });
      setAlertVisible(true);
    }
  }, [error]);

  const handleGoogleLogin = async () => {
    await googleLogin();
  };

  const handleEmailSignUp = async () => {
    if (!email || !password) {
      setAlertContent({
        title: "Error",
        message: "Please enter email and password",
      });
      setAlertVisible(true);
      return;
    }

    await register(email, password);
  };

  return (
    <Screen style={styles.screen}>
      <CustomAlert
        visible={alertVisible}
        title={alertContent.title}
        message={alertContent.message}
        onDismiss={() => setAlertVisible(false)}
      />
      <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
        <Ionicons
          name={isDark ? "sunny" : "moon"}
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
      >
        <View style={styles.header}>
          <AppText style={[styles.logoText, { color: colors.text }]}>
            {APP_INFO.name}
          </AppText>
          <AppText variant="body" style={styles.tagline}>
            Where knowledge begins
          </AppText>
        </View>

        <View style={styles.content}>
          <AppText variant="h2" style={styles.title}>
            Sign Up
          </AppText>

          {/* Social Logins */}
          <View style={styles.socialButtons}>
            <Button
              label={isLoading ? "Loading..." : "Continue with Google"}
              variant="outline"
              icon="logo-google"
              style={styles.socialButton}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            />
            {Platform.OS === "ios" && (
              <Button
                label="Continue with Apple"
                variant="outline"
                icon="logo-apple"
                style={styles.socialButton}
                onPress={() => console.log("Apple login")}
              />
            )}
          </View>

          <View style={styles.divider}>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <AppText variant="caption" color="muted" style={styles.orText}>
              OR
            </AppText>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
          </View>

          {/* Email Login */}
          <View style={styles.emailContainer}>
            <Input
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              style={{ marginBottom: 12 }}
            />
            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
            />
          </View>

          <Button
            label={isLoading ? "Creating Account..." : "Continue with Email"}
            variant="primary"
            onPress={handleEmailSignUp}
            disabled={!email || !password || isLoading}
            style={styles.submitButton}
          />

          <View style={styles.footer}>
            <AppText variant="caption" color="muted" style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy
              Policy.
            </AppText>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <AppText
                variant="body"
                style={{
                  textAlign: "center",
                  color: colors.primary,
                  marginTop: 16,
                }}
              >
                Already have an account? Log In
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default SignUpScreen;
