/**
 * app/(tabs)/feed.tsx
 * Feed conectado a Supabase — US-006
 *
 * Cambios respecto al mock:
 * - MOCK_REQUESTS reemplazado por getFeedRequests() real
 * - MOCK_FACULTIES reemplazado por facultades dinámicas del feed
 * - Estados: loading, error, lista vacía, pull-to-refresh
 * - Filtro de modalidad se aplica en el query (Supabase)
 * - Filtro de facultad se aplica localmente (no requiere query extra)
 * - Búsqueda por título se aplica en el query (ilike)
 */

import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CardSolicitud } from "@/components/ui/CardSolicitud";
import { Colors } from "@/constants/Colors";
import {
  FeedFilters,
  FeedStudyRequest,
  getFeedRequests,
} from "@/lib/services/studyRequestsService";
import { useAuthStore } from "@/store/useAuthStore";

const MODALITIES = ["Todos", "presencial", "virtual", "híbrido"];

export default function FeedScreen() {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  // ── Estado de datos ──────────────────────────────────────────────────────
  const [requests, setRequests] = useState<FeedStudyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [selectedModality, setSelectedModality] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);

  // ── Carga de datos ───────────────────────────────────────────────────────
  const loadFeed = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const filters: FeedFilters = {
        modality: selectedModality,
        search: search.trim(),
      };
      const data = await getFeedRequests(filters);
      setRequests(data);
    } catch (e: any) {
      setError(e.message ?? "Error al cargar el feed.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedModality, search]);

  // Recargar cuando cambian los filtros de query (modalidad o búsqueda)
  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // ── Filtro local de facultad ─────────────────────────────────────────────
  // Se aplica sobre el array ya cargado sin hacer otra llamada a Supabase
  const filtered = useMemo(() => {
    if (!selectedFaculty) return requests;
    return requests.filter((r) => r.faculty_name === selectedFaculty);
  }, [requests, selectedFaculty]);

  // Facultades únicas disponibles en el feed actual (para el modal)
  const faculties = useMemo(() => {
    const names: string[] = [];
    for (let i = 0; i < requests.length; i++) {
      const name = requests[i].faculty_name;
      if (name && !names.includes(name)) {
        names.push(name);
      }
    }
    return names.sort((a, b) => a.localeCompare(b));
  }, [requests]);

  const activeFilters =
    (selectedFaculty ? 1 : 0) + (selectedModality !== "Todos" ? 1 : 0);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: C.background, paddingTop: insets.top },
      ]}
    >
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: C.textPrimary }]}>
            Solicitudes
          </Text>
          <Text style={[styles.headerSub, { color: C.textSecondary }]}>
            {loading
              ? "Cargando..."
              : `${filtered.length} publicaciones activas`}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.newBtn, { backgroundColor: C.accent }]}
          onPress={() => router.push("/nueva-solicitud")}
          activeOpacity={0.85}
        >
          <Text style={[styles.newBtnText, { color: C.primary }]}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {/* ── Buscador + botón filtros ─────────────────────────────────────── */}
      <View style={[styles.searchRow, { borderBottomColor: C.border }]}>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
        >
          <Text style={{ color: C.textPlaceholder, marginRight: 6 }}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: C.textPrimary }]}
            placeholder="Buscar por materia o título..."
            placeholderTextColor={C.textPlaceholder}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={{ color: C.textSecondary, fontSize: 18, lineHeight: 20 }}>
                ×
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterBtn,
            {
              backgroundColor: activeFilters > 0 ? C.primary : C.surface,
              borderColor: C.border,
            },
          ]}
          onPress={() => setShowFilters(true)}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 16 }}>⚙️</Text>
          {activeFilters > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: C.accent }]}>
              <Text style={[styles.filterBadgeText, { color: C.primary }]}>
                {activeFilters}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Chips de modalidad ───────────────────────────────────────────── */}
      <View style={styles.chipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {MODALITIES.map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    selectedModality === m ? C.primary : C.surface,
                  borderColor:
                    selectedModality === m ? C.primary : C.border,
                },
              ]}
              onPress={() => setSelectedModality(m)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      selectedModality === m
                        ? C.textOnPrimary
                        : C.textSecondary,
                  },
                ]}
              >
                {m === "Todos"
                  ? "Todos"
                  : m.charAt(0).toUpperCase() + m.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Lista de solicitudes ─────────────────────────────────────────── */}
      {loading && !refreshing ? (
        // Skeleton de carga inicial
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={[styles.loadingText, { color: C.textSecondary }]}>
            Cargando solicitudes...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CardSolicitud
              item={item as any}
              isOwnPost={item.author_id === user?.id}
              onPress={() =>
                router.push(`/solicitud/${item.id}` as any)
              }
              onPostulate={() =>
                router.push(`/postular/${item.id}` as any)
              }
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 80 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadFeed(true)}
              colors={[C.primary]}
              tintColor={C.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {error ? (
                <>
                  <Text style={styles.emptyEmoji}>⚠️</Text>
                  <Text style={[styles.emptyTitle, { color: C.textPrimary }]}>
                    Error al cargar
                  </Text>
                  <Text
                    style={[styles.emptyBody, { color: C.textSecondary }]}
                  >
                    {error}
                  </Text>
                  <TouchableOpacity
                    onPress={() => loadFeed()}
                    style={[styles.retryBtn, { backgroundColor: C.primary }]}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={{
                        color: C.textOnPrimary,
                        fontWeight: "600",
                        fontSize: 14,
                      }}
                    >
                      Reintentar
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.emptyEmoji}>🔍</Text>
                  <Text
                    style={[styles.emptyTitle, { color: C.textPrimary }]}
                  >
                    Sin resultados
                  </Text>
                  <Text
                    style={[styles.emptyBody, { color: C.textSecondary }]}
                  >
                    Intenta con otros filtros o crea la primera solicitud.
                  </Text>
                </>
              )}
            </View>
          }
        />
      )}

      {/* ── Modal de filtros ─────────────────────────────────────────────── */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        selectedFaculty={selectedFaculty}
        onSelectFaculty={setSelectedFaculty}
        faculties={faculties}
        C={C}
        bottomInset={insets.bottom}
      />
    </View>
  );
}

// ── Modal de filtros ──────────────────────────────────────────────────────────
function FilterModal({
  visible,
  onClose,
  selectedFaculty,
  onSelectFaculty,
  faculties,
  C,
  bottomInset,
}: {
  visible: boolean;
  onClose: () => void;
  selectedFaculty: string | null;
  onSelectFaculty: (f: string | null) => void;
  faculties: string[];
  C: (typeof Colors)["light"];
  bottomInset: number;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: C.surface,
              paddingBottom: bottomInset + 24,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={[styles.modalHandle, { backgroundColor: C.border }]} />
          <Text style={[styles.modalTitle, { color: C.textPrimary }]}>
            Filtrar por Facultad
          </Text>

          {/* Opción "Todas" */}
          <TouchableOpacity
            style={[
              styles.facultyOption,
              {
                backgroundColor: !selectedFaculty
                  ? C.primary + "15"
                  : "transparent",
                borderColor: !selectedFaculty ? C.primary : C.border,
              },
            ]}
            onPress={() => {
              onSelectFaculty(null);
              onClose();
            }}
          >
            <Text
              style={[
                styles.facultyOptionText,
                { color: !selectedFaculty ? C.primary : C.textPrimary },
              ]}
            >
              Todas las facultades
            </Text>
          </TouchableOpacity>

          {/* Facultades dinámicas del feed */}
          {faculties.length === 0 ? (
            <Text style={[styles.emptyBody, { color: C.textSecondary, marginTop: 8 }]}>
              No hay facultades disponibles.
            </Text>
          ) : (
            faculties.map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.facultyOption,
                  {
                    backgroundColor:
                      selectedFaculty === f ? C.primary + "15" : "transparent",
                    borderColor: selectedFaculty === f ? C.primary : C.border,
                  },
                ]}
                onPress={() => {
                  onSelectFaculty(f);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.facultyOptionText,
                    {
                      color:
                        selectedFaculty === f ? C.primary : C.textPrimary,
                    },
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  headerSub: { fontSize: 12, marginTop: 2 },
  newBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  newBtnText: { fontSize: 14, fontWeight: "700" },

  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { fontSize: 10, fontWeight: "700" },

  chipsWrapper: { height: 52, flexShrink: 0 },
  chipsRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: { fontSize: 13, fontWeight: "500" },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14 },

  listContent: { paddingTop: 8 },

  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  emptyBody: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000050",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: "700", marginBottom: 16 },
  facultyOption: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  facultyOptionText: { fontSize: 14, fontWeight: "500" },
});