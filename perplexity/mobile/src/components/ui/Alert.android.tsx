import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";

const { width } = Dimensions.get("window");

export interface AlertAction {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface AlertProps {
  visible: boolean;
  title: string;
  message?: string;
  actions?: AlertAction[];
  onDismiss?: () => void;
}

export const CustomAlert: React.FC<AlertProps> = ({
  visible,
  title,
  message,
  actions = [{ text: "OK" }],
  onDismiss,
}) => {
  const { colors, isDark } = useTheme();
  const scaleValue = useRef(new Animated.Value(0.9)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible && (opacityValue as any)._value === 0) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View
              style={[
                styles.alertContainer,
                {
                  backgroundColor: isDark ? "#2D2D2D" : "#FAFAFA",
                  opacity: opacityValue,
                  transform: [{ scale: scaleValue }],
                },
              ]}
            >
              <View style={styles.contentContainer}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {title}
                </Text>
                {message && (
                  <Text style={[styles.message, { color: colors.text + "D9" }]}>
                    {message}
                  </Text>
                )}
              </View>

              <View style={styles.actionsContainer}>
                {actions.map((action, index) => {
                  const isDestructive = action.style === "destructive";

                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.6}
                      style={[
                        styles.actionButton,
                        isDestructive && styles.actionButtonDestructive,
                        action.style === "default" &&
                          styles.actionButtonPrimary,
                      ]}
                      onPress={() => {
                        action.onPress?.();
                        onDismiss?.();
                      }}
                    >
                      <Text
                        style={[
                          styles.actionText,
                          {
                            color: isDestructive
                              ? "#FFFFFF"
                              : action.style === "default"
                                ? isDark
                                  ? "#1E1E1E"
                                  : "#FFFFFF"
                                : isDark
                                  ? "#E0E0E0"
                                  : "#424242",
                          },
                        ]}
                      >
                        {action.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    width: width * 0.88,
    maxWidth: 360,
    borderRadius: 24, // Premium rounded corners
    elevation: 8, // Softer shadow for a sophisticated look
    padding: 28,
    paddingBottom: 24,
  },
  contentContainer: {
    marginBottom: 32,
    alignItems: "center", // Center aligned for a more elegant feel
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: 0.15,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: 0.25,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100, // Pill shaped buttons
    backgroundColor: "transparent",
  },
  actionButtonPrimary: {
    backgroundColor: "#6200EE", // Will be overridden by dynamic text color logic but gives a base
    ...Platform.select({
      android: {
        elevation: 2,
      },
    }),
  },
  actionButtonDestructive: {
    backgroundColor: "#E53935",
  },
  actionText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
