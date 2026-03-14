import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { CustomDrawerContent } from '@/features/chat/components/layouts/CustomDrawerContent';

export default function HomeLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />} screenOptions={{ headerShown: false }}>
        <Drawer.Screen
          name="index"
          options={{
            title: 'Chat',
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
