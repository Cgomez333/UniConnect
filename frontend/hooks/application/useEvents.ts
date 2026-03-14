import { useCallback, useState } from "react"

interface UseEventsState {
  loading: boolean
  error: string | null
}

export function useEvents() {
  const [state, setState] = useState<UseEventsState>({
    loading: false,
    error: null,
  })

  const notImplemented = useCallback(async () => {
    setState({ loading: false, error: "Eventos pendientes de implementación (US-007/008)" })
    throw new Error("Eventos pendientes de implementación (US-007/008)")
  }, [])

  return {
    ...state,
    getEvents: notImplemented,
    getEventById: notImplemented,
    createEvent: notImplemented,
    updateEvent: notImplemented,
    deleteEvent: notImplemented,
  }
}
