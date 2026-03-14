/**
 * CustomDrawerContent.tsx
 *
 * Auth-aware Perplexity-style drawer
 */

import { AppText } from "@/components/common/AppText";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useChatStore } from "@/features/chat/store/chat.store";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { drawerStyles as styles } from "../../styles/CustomDrawerContent.style";
import { ChatRow } from "./ChatRow";
import { GuestPanel } from "./GuestPanel";

// ── Helpers ────────────────────────────────────────────────────────────────────
function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(/[\s_@]/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

type Tab = "Threads" | "Spaces";

// ─────────────────────────────────────────────────────────────────────────────
// Main Drawer
// ─────────────────────────────────────────────────────────────────────────────
export function CustomDrawerContent(props: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Threads");

  const { user, logout, isAuthenticated } = useAuth();
  const chats = useChatStore((s) => s.chats);
  const loadChats = useChatStore((s) => s.loadChats);
  const switchChat = useChatStore((s) => s.switchChat);
  const createNewChat = useChatStore((s) => s.createNewChat);
  const activeChatId = useChatStore((s) => s.activeChatId);

  const fabScale = useRef(new Animated.Value(1)).current;
  const logScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isAuthenticated) loadChats();
  }, [isAuthenticated]);

  const onFabPress = () => {
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.88, duration: 90, useNativeDriver: true }),
      Animated.timing(fabScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      createNewChat();
      props.navigation.closeDrawer();
    });
  };

  const handleSelectChat = (chatId: string) => {
    switchChat(chatId);
    props.navigation.closeDrawer();
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: () => {
            logout();
            props.navigation.closeDrawer();
          },
        },
      ],
    );
  };

  const bg = colors.background ?? "#111111";
  const initials = getInitials(user?.username ?? user?.email);

  // ── Guest state ──
  if (!isAuthenticated) {
    return (
      <View style={[styles.root, { backgroundColor: bg, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <DrawerContentScrollView {...props} scrollEnabled contentContainerStyle={{ flexGrow: 1 }}>
          <GuestPanel
            onLogin={() => {
              props.navigation.closeDrawer();
              router.push("/auth/login");
            }}
            onRegister={() => {
              props.navigation.closeDrawer();
              router.push("/auth/register");
            }}
          />
        </DrawerContentScrollView>
      </View>
    );
  }

  // ── Authenticated state ──
  return (
    <View style={[styles.root, { backgroundColor: bg, paddingTop: insets.top }]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>{initials}</AppText>
        </View>

        {/* Username */}
        <AppText style={styles.headerUsername} numberOfLines={1}>
          {user?.username ?? user?.email ?? "User"}
        </AppText>

        {/* Search */}
        <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted as string} />
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={20} color={colors.textMuted as string} />
        </TouchableOpacity>
      </View>

      {/* ── Tab selector (inside scroll, above list) ── */}
      <View style={styles.tabBarTop}>
        {(["Threads", "Spaces"] as Tab[]).map((tab) => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabTopBtn, active && styles.tabTopBtnActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={tab === "Threads" ? "reorder-three-outline" : "albums-outline"}
                size={15}
                color={(active ? colors.text : colors.textMuted) as string}
              />
              <AppText style={[styles.tabTopLabel, active && styles.tabTopLabelActive]}>
                {tab}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Chat list ── */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          data={activeTab === "Threads" ? chats : []}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name={activeTab === "Spaces" ? "albums-outline" : "chatbubbles-outline"}
                size={32}
                color={colors.icon as string}
              />
              <AppText style={styles.emptyTitle}>
                {activeTab === "Spaces" ? "No spaces yet" : "No threads yet"}
              </AppText>
              <AppText style={styles.emptySubtitle}>
                {activeTab === "Spaces"
                  ? "Create a space to organise your chats"
                  : "Start a new conversation"}
              </AppText>
            </View>
          }
          renderItem={({ item }) => (
            <ChatRow
              item={item}
              isActive={item.id === activeChatId}
              onPress={() => handleSelectChat(item.id)}
              onMenu={() => {/* TODO: action sheet */}}
            />
          )}
        />
      </DrawerContentScrollView>

      {/* ── Fixed Bottom Actions ── */}
      <View style={{ position: "absolute", bottom: 50, left: 0, right: 0, flexDirection: "row", justifyContent: "space-evenly", gap: 20 }}>
        {/* Logout */}
        <Animated.View style={{ transform: [{ scale: logScale }] }}>
          <TouchableOpacity style={styles.logInner} activeOpacity={1} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={styles.logPlus.color as string} />
          </TouchableOpacity>
        </Animated.View>

        {/* New Chat FAB */}
        <Animated.View style={{ transform: [{ scale: fabScale }] }}>
          <TouchableOpacity style={styles.fabInner} activeOpacity={1} onPress={onFabPress}>
            <Ionicons name="pencil-outline" size={18} color={styles.fabPlus.color as string} />
            <AppText style={styles.fabPlus}>+</AppText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
