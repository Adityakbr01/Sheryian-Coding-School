import { AppText } from "@/components/common/AppText";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useChatStore } from "@/features/chat/store/chat.store";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { drawerStyles as styles } from "../../styles/CustomDrawerContent.style";
import { ChatRow } from "./ChatRow";
import { GuestPanel } from "./GuestPanel";
import { CustomAlert } from "@/components/ui/Alert.ios";

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

// ── Memoized ChatRow wrapper ───────────────────────────────────────────────────
/**
 * Only re-renders when this specific row's active state or title changes.
 * Previously the entire list re-rendered on every switchChat call.
 */
const MemoizedChatRow = memo(
  ({
    item,
    isActive,
    onPress,
    onMenu,
  }: {
    item: { id: string; title?: string };
    isActive: boolean;
    onPress: () => void;
    onMenu: () => void;
  }) => <ChatRow item={item as any} isActive={isActive} onPress={onPress} onMenu={onMenu} />,
  (prev, next) =>
    prev.isActive === next.isActive &&
    prev.item.id === next.item.id &&
    prev.item.title === next.item.title,
);
MemoizedChatRow.displayName = "MemoizedChatRow";

// ── Empty state ────────────────────────────────────────────────────────────────
const EmptyList = memo(({ tab }: { tab: Tab }) => (
  <View style={styles.empty}>
    <Ionicons
      name={tab === "Spaces" ? "albums-outline" : "chatbubbles-outline"}
      size={32}
      color="#666"
    />
    <AppText style={styles.emptyTitle}>
      {tab === "Spaces" ? "No spaces yet" : "No threads yet"}
    </AppText>
    <AppText style={styles.emptySubtitle}>
      {tab === "Spaces"
        ? "Create a space to organise your chats"
        : "Start a new conversation"}
    </AppText>
  </View>
));
EmptyList.displayName = "EmptyList";

// ─────────────────────────────────────────────────────────────────────────────
// Main Drawer
// ─────────────────────────────────────────────────────────────────────────────
export function CustomDrawerContent(props: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("Threads");

  const { user, logout, isAuthenticated } = useAuth();

  // ── Fine-grained store subscriptions ────────────────────────────────────────
  // IMPORTANT: subscribe ONLY to what the drawer needs.
  // Never subscribe to messages, isStreaming, isLoading — those change on
  // every token and would freeze the drawer during a response.
  const chats        = useChatStore((s) => s.chats);
  const activeChatId = useChatStore((s) => s.activeChatId);
  const loadChats    = useChatStore((s) => s.loadChats);
  const switchChat   = useChatStore((s) => s.switchChat);
  const createNewChat = useChatStore((s) => s.createNewChat);

  const fabScale = useRef(new Animated.Value(1)).current;
  const logScale = useRef(new Animated.Value(1)).current;

  const [logoutAlertVisible, setLogoutAlertVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated) loadChats();
  }, [isAuthenticated]);

  const onFabPress = useCallback(() => {
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.88, duration: 90, useNativeDriver: true }),
      Animated.timing(fabScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      createNewChat();
      props.navigation.closeDrawer();
    });
  }, [createNewChat, fabScale, props.navigation]);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      switchChat(chatId);
      props.navigation.closeDrawer();
    },
    [switchChat, props.navigation],
  );

  const handleLogout = useCallback(() => {
    setLogoutAlertVisible(true);
  }, []);

  const bg = colors.background ?? "#111111";
  const initials = getInitials(user?.username ?? user?.email);

  // ── Guest state ──────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <View
        style={[
          styles.root,
          { backgroundColor: bg, paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
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

  const visibleChats = activeTab === "Threads" ? chats : [];

  // ── Authenticated state ──────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: bg, paddingTop: insets.top }]}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>{initials}</AppText>
        </View>

        <AppText style={styles.headerUsername} numberOfLines={1}>
          {user?.username ?? user?.email ?? "User"}
        </AppText>

        <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted as string} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={20} color={colors.textMuted as string} />
        </TouchableOpacity>
      </View>

      {/* ── Tab selector ───────────────────────────────────────────────────── */}
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

      {/*
       * ── Chat list ─────────────────────────────────────────────────────────
       *
       * CRITICAL FIX: FlatList has been replaced with ScrollView + .map().
       *
       * Using FlatList inside DrawerContentScrollView (which is itself a
       * ScrollView) creates a nested VirtualizedList. React Native raises a
       * warning and disables scrolling on the inner list to prevent gesture
       * conflicts — which is exactly why the drawer froze and felt stuck.
       *
       * For a chat history list (typically < 100 items, each ~40px tall)
       * virtualization adds zero benefit and only causes problems. Direct
       * mapping is faster, simpler, and gesture-conflict-free.
       */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 160,paddingHorizontal: 12,paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {visibleChats.length === 0 ? (
          <EmptyList tab={activeTab} />
        ) : (
          visibleChats.map((item) => (
            <MemoizedChatRow
              key={item.id}
              item={item}
              isActive={item.id === activeChatId}
              onPress={() => handleSelectChat(item.id)}
              onMenu={() => {/* TODO: action sheet */}}
            />
          ))
        )}
      </ScrollView>

      {/* ── Fixed Bottom Actions ─────────────────────────────────────────── */}
      <View
        style={{
          position: "absolute",
          bottom: 50,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "space-evenly",
          gap: 20,
        }}
      >
        {/* Logout */}
        <Animated.View style={{ transform: [{ scale: logScale }] }}>
          <TouchableOpacity
            style={styles.logInner}
            activeOpacity={1}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={styles.logPlus.color as string}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* New Chat FAB */}
        <Animated.View style={{ transform: [{ scale: fabScale }] }}>
          <TouchableOpacity
            style={styles.fabInner}
            activeOpacity={1}
            onPress={onFabPress}
          >
            <Ionicons
              name="pencil-outline"
              size={18}
              color={styles.fabPlus.color as string}
            />
            <AppText style={styles.fabPlus}>+</AppText>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <CustomAlert
        visible={logoutAlertVisible}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        onDismiss={() => setLogoutAlertVisible(false)}
        actions={[
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            style: "destructive",
            onPress: () => {
              Animated.sequence([
                Animated.timing(logScale, { toValue: 0.88, duration: 90, useNativeDriver: true }),
                Animated.timing(logScale, { toValue: 1, duration: 120, useNativeDriver: true }),
              ]).start(() => {
                logout();
                props.navigation.closeDrawer();
              });
            },
          },
        ]}
      />
    </View>
  );
}