import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";

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
  const scaleValue = useRef(new Animated.Value(1.1)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 150,
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
                  backgroundColor: isDark ? "#2C2C2E" : "#FFFFFF",
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
                  <Text style={[styles.message, { color: colors.text + "CC" }]}>
                    {message}
                  </Text>
                )}
              </View>

              <View
                style={[
                  styles.actionsContainer,
                  {
                    flexDirection: actions.length > 2 ? "column" : "row",
                    borderTopColor: isDark ? "#3D3D41" : "#E5E5EA",
                  },
                ]}
              >
                {actions.map((action, index) => {
                  const isDestructive = action.style === "destructive";
                  const isCancel = action.style === "cancel";

                  return (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.7}
                      style={[
                        styles.actionButton,
                        {
                          borderRightWidth:
                            actions.length === 2 && index === 0
                              ? StyleSheet.hairlineWidth
                              : 0,
                          borderRightColor: isDark ? "#3D3D41" : "#E5E5EA",
                          borderTopWidth:
                            actions.length > 2 && index > 0
                              ? StyleSheet.hairlineWidth
                              : 0,
                          borderTopColor: isDark ? "#3D3D41" : "#E5E5EA",
                          width:
                            actions.length > 2
                              ? "100%"
                              : `${100 / actions.length}%`,
                        },
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
                            color: isDestructive ? "#FF3B30" : "#0a84ff",
                            fontWeight: isCancel ? "600" : "400",
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
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    width: 270,
    borderRadius: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      },
    }),
  },
  contentContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  actionsContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionButton: {
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    fontSize: 17,
    textAlign: "center",
  },
});
