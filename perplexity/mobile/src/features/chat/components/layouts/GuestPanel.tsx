import { AppText } from "@/components/common/AppText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { guestStyles } from "../../styles/GuestPanel.style";

interface GuestPanelProps {
  onLogin: () => void;
  onRegister: () => void;
}

export function GuestPanel({ onLogin, onRegister }: GuestPanelProps) {
  return (
    <View style={guestStyles.root}>
      {/* Brand mark */}
      <View style={guestStyles.brand}>
        <View style={guestStyles.brandIcon}>
          <Ionicons name="sparkles" size={22} color={guestStyles.brandIcon.borderColor as string} />
        </View>
        <AppText style={guestStyles.brandName}>perplexity</AppText>
      </View>

      <AppText style={guestStyles.tagline}>
        Ask anything. Get instant, accurate answers.
      </AppText>

      {/* Feature pills */}
      <View style={guestStyles.features}>
        {[
          { icon: "flash-outline", label: "Instant answers" },
          { icon: "globe-outline", label: "Web search" },
          { icon: "code-slash-outline", label: "Code generation" },
          { icon: "bookmark-outline", label: "Save your threads" },
        ].map((f) => (
          <View key={f.label} style={guestStyles.featureRow}>
            <View style={guestStyles.featureIconBox}>
              <Ionicons name={f.icon as any} size={14} color={guestStyles.brandIcon.borderColor as string} />
            </View>
            <AppText style={guestStyles.featureLabel}>{f.label}</AppText>
          </View>
        ))}
      </View>

      {/* CTAs */}
      <TouchableOpacity
        style={guestStyles.loginBtn}
        onPress={onLogin}
        activeOpacity={0.85}
      >
        <AppText style={guestStyles.loginBtnText}>Log in</AppText>
      </TouchableOpacity>

      <TouchableOpacity
        style={guestStyles.registerBtn}
        onPress={onRegister}
        activeOpacity={0.85}
      >
        <AppText style={guestStyles.registerBtnText}>Create account</AppText>
      </TouchableOpacity>

      <AppText style={guestStyles.terms}>
        By continuing you agree to our{" "}
        <AppText style={guestStyles.termsLink}>Terms</AppText> &amp;{" "}
        <AppText style={guestStyles.termsLink}>Privacy Policy</AppText>
      </AppText>
    </View>
  );
}
