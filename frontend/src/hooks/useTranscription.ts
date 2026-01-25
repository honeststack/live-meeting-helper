'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export interface TranscriptionState {
  transcript: string
  interimText: string
  isConnected: boolean
  error: string | null
}

export interface UseTranscriptionReturn extends TranscriptionState {
  connect: () => void
  disconnect: () => void
  sendAudio: (data: Blob) => void
  clearTranscript: () => void
}

export function useTranscription(): UseTranscriptionReturn {
  const [state, setState] = useState<TranscriptionState>({
    transcript: '',
    interimText: '',
    isConnected: false,
    error: null,
  })

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setState(prev => ({ ...prev, error: null }))

    // Connect to our WebSocket API route
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/transcribe`

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setState(prev => ({ ...prev, isConnected: true, error: null }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'transcript') {
            if (data.isFinal) {
              // Add finalized text to transcript
              setState(prev => ({
                ...prev,
                transcript: prev.transcript + (prev.transcript ? ' ' : '') + data.text,
                interimText: '',
              }))
            } else {
              // Update interim text
              setState(prev => ({
                ...prev,
                interimText: data.text,
              }))
            }
          } else if (data.type === 'error') {
            setState(prev => ({ ...prev, error: data.message }))
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }

      ws.onerror = (event) => {
        console.error('WebSocket error:', event)
        setState(prev => ({
          ...prev,
          error: 'WebSocket connection error',
          isConnected: false
        }))
      }

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        setState(prev => ({ ...prev, isConnected: false }))
        wsRef.current = null
      }

    } catch (err) {
      console.error('Failed to create WebSocket:', err)
      setState(prev => ({
        ...prev,
        error: 'Failed to connect to transcription service',
        isConnected: false
      }))
    }
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setState(prev => ({ ...prev, isConnected: false, interimText: '' }))
  }, [])

  const sendAudio = useCallback((data: Blob) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Send the audio blob directly as binary
      wsRef.current.send(data)
    }
  }, [])

  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '', interimText: '' }))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    ...state,
    connect,
    disconnect,
    sendAudio,
    clearTranscript,
  }
}
