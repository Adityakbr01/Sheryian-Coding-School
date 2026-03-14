import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type TabConfig = {
  name: string;
  title: string;
  icon: IoniconName;
  activeIcon: IoniconName;
};

const TABS: TabConfig[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { name: 'explore', title: 'Explore', icon: 'compass-outline', activeIcon: 'compass' },
  { name: 'settings', title: 'Settings', icon: 'settings-outline', activeIcon: 'settings' },
];

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => {
        const tab = TABS.find((t) => t.name === route.name);
        return {
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            shadowOpacity: 0,
            elevation: 0,
          },
          tabBarLabelStyle: {
            fontFamily: undefined, // Or use your typography
          },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? (tab?.activeIcon ?? 'home') : (tab?.icon ?? 'home-outline')}
              size={size}
              color={color}
            />
          ),
          title: tab?.title,
        };
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}
