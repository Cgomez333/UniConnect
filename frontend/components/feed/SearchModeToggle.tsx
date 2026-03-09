/**
 * components/feed/SearchModeToggle.tsx
 * Toggle para alternar entre modos de búsqueda — US-005 + US-006
 *
 * Tres modos:
 *   - "solicitudes": búsqueda normal del feed (por defecto)
 *   - "compañeros": búsqueda de estudiantes por materia
 *   - "recursos": recursos de estudio compartidos
 */

import { Colors } from "@/constants/Colors"
import { useEffect, useRef, useState } from "react"
import { Animated, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native"

export type SearchMode = "solicitudes" | "compañeros" | "recursos"

const MODES: SearchMode[] = ["solicitudes", "compañeros", "recursos"]
const LABELS: Record<SearchMode, string> = {
  solicitudes: "📋 Solicitudes",
  "compañeros": "👥 Compañeros",
  recursos: "📚 Recursos",
}

interface Props {
  mode: SearchMode
  onChangeMode: (mode: SearchMode) => void
}

export function SearchModeToggle({ mode, onChangeMode }: Props) {
  const scheme = useColorScheme() ?? "light"
  const C = Colors[scheme]
  const activeIndex = MODES.indexOf(mode)
  const anim = useRef(new Animated.Value(activeIndex)).current
  const [tabWidth, setTabWidth] = useState(0)

  useEffect(() => {
    Animated.spring(anim, {
      toValue: activeIndex,
      speed: 14,
      bounciness: 6,
      useNativeDriver: true,
    }).start()
  }, [activeIndex])

  const translateX = tabWidth
    ? anim.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [0, tabWidth, tabWidth * 2],
      })
    : undefined

  return (
    <View
      style={[styles.container, { backgroundColor: C.surface, borderColor: C.border }]}
      onLayout={(e) => setTabWidth(e.nativeEvent.layout.width / 3)}
    >
      {/* Pill deslizante */}
      {tabWidth > 0 && translateX && (
        <Animated.View
          style={[
            styles.pill,
            { backgroundColor: C.primary, width: tabWidth, transform: [{ translateX }] },
          ]}
        />
      )}

      {MODES.map((m) => (
        <TouchableOpacity
          key={m}
          style={styles.tab}
          onPress={() => onChangeMode(m)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              { color: mode === m ? C.textOnPrimary : C.textSecondary },
            ]}
          >
            {LABELS[m]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  pill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    zIndex: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
  },
})
