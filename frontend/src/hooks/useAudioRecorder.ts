'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export interface AudioRecorderState {
  isRecording: boolean
  audioLevel: number
  error: string | null
  sampleRate: number
}

export interface UseAudioRecorderReturn extends AudioRecorderState {
  startRecording: () => Promise<void>
  stopRecording: () => void
  getAudioStream: () => MediaStream | null
}

// Preferred MIME types in order of preference
const MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
  'audio/ogg',
]

function getSupportedMimeType(): string {
  for (const mimeType of MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType
    }
  }
  return '' // Let browser choose default
}

export function useAudioRecorder(
  onAudioData?: (data: Blob) => void,
  chunkIntervalMs: number = 250
): UseAudioRecorderReturn {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    audioLevel: 0,
    error: null,
    sampleRate: 0,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Calculate audio level from analyser
  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Calculate RMS-like value from frequency data
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i]
    }
    const rms = Math.sqrt(sum / dataArray.length)

    // Normalize to 0-1 range with some scaling
    const normalizedLevel = Math.min(1, rms / 128)

    setState(prev => ({ ...prev, audioLevel: normalizedLevel }))

    if (state.isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
    }
  }, [state.isRecording])

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }))

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000,
        },
      })

      streamRef.current = stream

      // Get actual sample rate from track settings
      const audioTrack = stream.getAudioTracks()[0]
      const settings = audioTrack.getSettings()
      const actualSampleRate = settings.sampleRate || 48000

      // Set up Web Audio API for level monitoring
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      // Set up MediaRecorder for audio chunks
      const mimeType = getSupportedMimeType()
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {}

      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && onAudioData) {
          onAudioData(event.data)
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setState(prev => ({ ...prev, error: 'Recording error occurred' }))
      }

      // Start recording with specified chunk interval
      mediaRecorder.start(chunkIntervalMs)

      setState(prev => ({
        ...prev,
        isRecording: true,
        sampleRate: actualSampleRate,
      }))

      // Start audio level monitoring
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone'
      setState(prev => ({ ...prev, error: errorMessage }))
      console.error('Error starting recording:', err)
    }
  }, [onAudioData, chunkIntervalMs, updateAudioLevel])

  const stopRecording = useCallback(() => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    mediaRecorderRef.current = null

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    streamRef.current = null

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    audioContextRef.current = null
    analyserRef.current = null

    setState(prev => ({
      ...prev,
      isRecording: false,
      audioLevel: 0,
    }))
  }, [])

  const getAudioStream = useCallback(() => {
    return streamRef.current
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording()
    }
  }, [stopRecording])

  return {
    ...state,
    startRecording,
    stopRecording,
    getAudioStream,
  }
}
