import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/useAuthStore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, useColorScheme, View } from "react-native";

/**
 * Root entry point that routes users based on authentication state and role.
 * Displays loading spinner during initial hydration.
 */
export default function IndexScreen() {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const role = useAuthStore((s) => s.user?.role);
  const [ready, setReady] = useState(false);
  const [routed, setRouted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready || isHydrating || routed) return;

    if (isAuthenticated) {
      setRouted(true);
      if (role === "admin") {
        router.replace("/(admin)" as any);
      } else {
        router.replace("/(tabs)" as any);
      }
      return;
    }

    setRouted(true);
    router.replace("/onboarding" as any);
  }, [ready, isHydrating, isAuthenticated, role, routed]);

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <ActivityIndicator size="large" color={C.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});