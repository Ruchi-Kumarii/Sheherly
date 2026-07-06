import { Stack } from "expo-router";
import "../global.css";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

// Keep splash visible until we manually hide it
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen as soon as layout mounts
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
