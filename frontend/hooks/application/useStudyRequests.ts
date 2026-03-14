import { useState, useCallback } from "react"
import { DIContainer } from "@/lib/services/di/container"
import type { StudyRequest } from "@/types"

interface UseStudyRequestsState {
  loading: boolean
  error: string | null
  data: StudyRequest[]
}

export function useStudyRequests() {
  const container = DIContainer.getInstance()
  const [state, setState] = useState<UseStudyRequestsState>({
    loading: false,
    error: null,
    data: [],
  })

  const getRequests = useCallback(
    async (filters?: { subject_id?: string; search?: string }, page = 0, pageSize = 10) => {
      setState({ loading: true, error: null, data: [] })
      try {
        const useCase = container.getGetFeedRequests()
        const result = await useCase.execute(filters, page, pageSize)
        setState({ loading: false, error: null, data: result })
        return result
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error al cargar solicitudes"
        setState({ loading: false, error: errorMsg, data: [] })
        throw err
      }
    },
    [container]
  )

  const createRequest = useCallback(
    async (
      userId: string,
      payload: { title: string; description: string; subject_id: string; max_members: number }
    ) => {
      setState((prev) => ({ ...prev, loading: true }))
      try {
        const useCase = container.getCreateStudyRequest()
        await useCase.execute(userId, payload)
        setState((prev) => ({ ...prev, loading: false, error: null }))
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error al crear solicitud"
        setState((prev) => ({ ...prev, loading: false, error: errorMsg }))
        throw err
      }
    },
    [container]
  )

  const updateStatus = useCallback(
    async (requestId: string, userId: string, status: "abierta" | "cerrada" | "expirada") => {
      setState((prev) => ({ ...prev, loading: true }))
      try {
        const useCase = container.getUpdateStudyRequest()
        await useCase.execute(requestId, userId, { status })
        setState((prev) => ({ ...prev, loading: false, error: null }))
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error al actualizar solicitud"
        setState((prev) => ({ ...prev, loading: false, error: errorMsg }))
        throw err
      }
    },
    [container]
  )

  return {
    ...state,
    getRequests,
    createRequest,
    updateStatus,
  }
}
