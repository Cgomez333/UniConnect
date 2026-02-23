/**
 * app/_layout.tsx
 * Layout raíz — gestiona el flujo de navegación completo:
 *   Sin sesión  → /login
 *   Con sesión  → /(tabs)
 */

import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* ── Auth ──────────────────────────────────────────────── */}
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="onboarding" />

      {/* ── App principal ─────────────────────────────────────── */}
      <Stack.Screen name="(tabs)" />

      {/* ── Pantallas tipo modal / detalle ────────────────────── */}
      <Stack.Screen
        name="nueva-solicitud"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Nueva solicitud",
          headerStyle: { backgroundColor: scheme === "dark" ? "#0a0a0a" : "#ffffff" },
          headerTintColor: "#0d2852",
        }}
      />
      <Stack.Screen
        name="editar-perfil"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Editar perfil",
          headerStyle: { backgroundColor: scheme === "dark" ? "#0a0a0a" : "#ffffff" },
          headerTintColor: "#0d2852",
        }}
      />
      <Stack.Screen
        name="solicitud/[id]"
        options={{
          headerShown: true,
          title: "Detalle",
          headerTintColor: "#0d2852",
        }}
      />
      <Stack.Screen
        name="postular/[id]"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Postularme",
          headerTintColor: "#0d2852",
        }}
      />

      {/* ── 404 ───────────────────────────────────────────────── */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}