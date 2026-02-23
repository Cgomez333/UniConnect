/**
 * app/_layout.tsx  ← este archivo va en la raíz de /app
 * Layout raíz — gestiona el flujo de navegación completo
 *
 * Rutas:
 *   /login, /register, /onboarding          → auth
 *   /(tabs)                                  → estudiante
 *   /(admin)                                 → administrador
 *   /nueva-solicitud, /editar-perfil, etc.   → modales
 */

import { Colors } from "@/constants/Colors";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* ── Punto de entrada ──────────────────────────────────── */}
      <Stack.Screen name="index" />

      {/* ── Auth ──────────────────────────────────────────────── */}
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="onboarding" />

      {/* ── App estudiante ────────────────────────────────────── */}
      <Stack.Screen name="(tabs)" />

      {/* ── App administrador ─────────────────────────────────── */}
      <Stack.Screen name="(admin)" />

      {/* ── Pantallas tipo modal ──────────────────────────────── */}
      <Stack.Screen
        name="nueva-solicitud"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Nueva solicitud",
          headerStyle: { backgroundColor: scheme === "dark" ? "#0a0a0a" : "#fff" },
          headerTintColor: C.primary,
        }}
      />
      <Stack.Screen
        name="editar-perfil"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Editar perfil",
          headerStyle: { backgroundColor: scheme === "dark" ? "#0a0a0a" : "#fff" },
          headerTintColor: C.primary,
        }}
      />
      <Stack.Screen
        name="solicitud/[id]"
        options={{
          headerShown: true,
          title: "Detalle",
          headerTintColor: C.primary,
        }}
      />
      <Stack.Screen
        name="postular/[id]"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Postularme",
          headerTintColor: C.primary,
        }}
      />

      {/* ── 404 ───────────────────────────────────────────────── */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}