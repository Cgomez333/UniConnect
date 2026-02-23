/**
 * app/onboarding.tsx
 *
 * Pantalla de bienvenida con 3 slides.
 * Al finalizar → redirige a /login
 * Se muestra solo la primera vez (usa AsyncStorage para recordarlo)
 */

import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
  useColorScheme,
} from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");

// ── Contenido de los slides ───────────────────────────────────────────────────
const SLIDES = [
  {
    id: "1",
    emoji: "🎓",
    title: "Bienvenido a UniConnect",
    body: "La red académica exclusiva para estudiantes de la Universidad de Caldas.",
    accent: false,
  },
  {
    id: "2",
    emoji: "🤝",
    title: "Forma tu equipo ideal",
    body: "Publica solicitudes de estudio, encuentra compañeros y forma grupos por materia o proyecto.",
    accent: false,
  },
  {
    id: "3",
    emoji: "🚀",
    title: "Empieza a conectar",
    body: "Solo necesitas tu correo @ucaldas.edu.co para unirte a la comunidad.",
    accent: true, // último slide → fondo azul
  },
];

export default function OnboardingScreen() {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  // Detecta qué slide está visible
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    // TODO: guardar en AsyncStorage que ya vio el onboarding
    // await AsyncStorage.setItem("onboarding_done", "true");
    router.replace("/login" as any);
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />

      {/* Botón saltar */}
      {!isLast && (
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={handleFinish}
          activeOpacity={0.7}
        >
          <Text style={[styles.skipText, { color: C.textSecondary }]}>
            Saltar
          </Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <SlideItem item={item} C={C} scheme={scheme} />
        )}
      />

      {/* Footer: dots + botón */}
      <View style={styles.footer}>
        {/* Indicadores */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === activeIndex ? C.primary : C.border,
                  width: i === activeIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Botón */}
        <TouchableOpacity
          style={[styles.mainBtn, { backgroundColor: C.primary }]}
          onPress={goNext}
          activeOpacity={0.85}
        >
          <Text style={[styles.mainBtnText, { color: C.textOnPrimary }]}>
            {isLast ? "Comenzar" : "Siguiente"}
          </Text>
        </TouchableOpacity>


      </View>
    </View>
  );
}

// ── Slide individual ──────────────────────────────────────────────────────────
function SlideItem({
  item,
  C,
  scheme,
}: {
  item: (typeof SLIDES)[0];
  C: (typeof Colors)["light"];
  scheme: "light" | "dark";
}) {
  return (
    <View style={[styles.slide, { width: SCREEN_W }]}>
      {/* Círculo decorativo de fondo */}
      <View
        style={[
          styles.circle,
          { backgroundColor: C.primary + "12" }, // 7% opacity
        ]}
      />

      {/* Emoji / ícono */}
      <View
        style={[
          styles.emojiBox,
          { backgroundColor: C.primary + "15", borderColor: C.primary + "30" },
        ]}
      >
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>

      {/* Franja dorada decorativa */}
      <View style={[styles.goldBar, { backgroundColor: C.accent }]} />

      {/* Texto */}
      <Text style={[styles.slideTitle, { color: C.textPrimary }]}>
        {item.title}
      </Text>
      <Text style={[styles.slideBody, { color: C.textSecondary }]}>
        {item.body}
      </Text>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipBtn: {
    position: "absolute",
    top: 56,
    right: 24,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Slide
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: 80,
    paddingBottom: 40,
  },
  circle: {
    position: "absolute",
    width: SCREEN_W * 0.9,
    height: SCREEN_W * 0.9,
    borderRadius: SCREEN_W * 0.45,
    top: -SCREEN_W * 0.2,
  },
  emojiBox: {
    width: 100,
    height: 100,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emoji: {
    fontSize: 48,
  },
  goldBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 24,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 16,
    lineHeight: 32,
  },
  slideBody: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },

  // Footer
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    alignItems: "center",
    gap: 16,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  mainBtn: {
    width: "100%",
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  mainBtnText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});