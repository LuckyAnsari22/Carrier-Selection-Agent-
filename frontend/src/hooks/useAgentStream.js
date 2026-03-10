import { useEffect, useRef } from 'react'
import useCarrierStore from '../store/useCarrierStore'

export function useAgentStream(url) {
  const eventSourceRef = useRef(null)
  const { addAgentMessage } = useCarrierStore()

  useEffect(() => {
    if (!url) return

    const eventSource = new EventSource(url)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        addAgentMessage({
          agent: data.agent,
          message: data.message,
          timestamp: Date.now()
        })
      } catch (e) {
        console.error('Failed to parse SSE message:', e)
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
    }

    eventSourceRef.current = eventSource

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [url, addAgentMessage])
}

export default useAgentStream
