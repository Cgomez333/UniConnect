/**
 * hooks/useFeed.ts
 *
 * Encapsula TODA la lógica de datos del feed:
 * - Carga de solicitudes filtradas por materias en común
 * - Pull-to-refresh
 * - Scroll infinito (paginación)
 * - Filtro local por materias seleccionadas
 * - Estado de carga / error
 */

import {
  FeedFilters,
  FeedStudyRequest,
  getFeedRequests,
  getEnrolledSubjectsForUser,
  Subject as FeedSubject,
} from "@/lib/services/studyRequestsService"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const PAGE_SIZE = 10

interface UseFeedReturn {
  // Datos
  filtered: FeedStudyRequest[]
  userSubjects: FeedSubject[]
  // Estado
  loading: boolean
  refreshing: boolean
  loadingMore: boolean
  error: string | null
  // Filtros
  search: string
  setSearch: (v: string) => void
  selectedSubjects: string[]
  setSelectedSubjects: (v: string[]) => void
  activeFilters: number
  // Acciones
  refresh: () => void
  loadMore: () => void
}

export function useFeed(): UseFeedReturn {
  const [requests, setRequests] = useState<FeedStudyRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userSubjectIds, setUserSubjectIds] = useState<string[]>([])
  const [userSubjects, setUserSubjects] = useState<FeedSubject[]>([])

  const [search, setSearch] = useState("")
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  const pageRef = useRef(0)
  const hasMoreRef = useRef(true)

  // Cargar materias del usuario una vez
  useEffect(() => {
    getEnrolledSubjectsForUser()
      .then((subjects) => {
        setUserSubjectIds(subjects.map((s) => s.id))
        setUserSubjects(subjects)
      })
      .catch(() => {
        setUserSubjectIds([])
        setUserSubjects([])
      })
  }, [])

  const fetchData = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    setError(null)
    pageRef.current = 0
    hasMoreRef.current = true

    try {
      const filters: FeedFilters = {
        search: search.trim(),
        subjectIds: userSubjectIds.length > 0 ? userSubjectIds : undefined,
      }
      const data = await getFeedRequests(filters, 0, PAGE_SIZE)
      setRequests(data)
      hasMoreRef.current = data.length >= PAGE_SIZE
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar el feed.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [search, userSubjectIds])

  useEffect(() => { fetchData() }, [fetchData])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMoreRef.current || loading) return
    setLoadingMore(true)

    try {
      const nextPage = pageRef.current + 1
      const filters: FeedFilters = {
        search: search.trim(),
        subjectIds: userSubjectIds.length > 0 ? userSubjectIds : undefined,
      }
      const data = await getFeedRequests(filters, nextPage, PAGE_SIZE)
      if (data.length > 0) {
        setRequests((prev) => [...prev, ...data])
        pageRef.current = nextPage
      }
      hasMoreRef.current = data.length >= PAGE_SIZE
    } catch {
      // No mostrar error en paginación, silenciar
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, loading, search, userSubjectIds])

  // Filtro local por materias seleccionadas
  const filtered = useMemo(() => {
    if (selectedSubjects.length === 0) return requests
    return requests.filter((r) => selectedSubjects.includes(r.subject_id))
  }, [requests, selectedSubjects])

  const activeFilters = selectedSubjects.length

  return {
    filtered,
    userSubjects,
    loading,
    refreshing,
    loadingMore,
    error,
    search,
    setSearch,
    selectedSubjects,
    setSelectedSubjects,
    activeFilters,
    refresh: () => fetchData(true),
    loadMore,
  }
}
