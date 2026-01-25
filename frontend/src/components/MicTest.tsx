'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { AudioLevelMeter } from './AudioLevelMeter'

interface MicTestProps {
  className?: string
}

export function MicTest({ className = '' }: MicTestProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [frameCount, setFrameCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const animationFrameRef = useRef<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
    }

    streamRef.current?.getTracks().forEach(track => track.stop())

    if (audioContextRef.current) {
      audioContextRef.current.close()
    }

    setIsRecording(false)
    setAudioLevel(0)
  }, [])

  const updateLevel = useCallback(() => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i]
    }
    const rms = Math.sqrt(sum / dataArray.length)
    setAudioLevel(Math.min(1, rms / 128))

    animationFrameRef.current = requestAnimationFrame(updateLevel)
  }, [])

  const startTest = useCallback(async () => {
    try {
      setError(null)
      setAudioUrl(null)
      setFrameCount(0)
      chunksRef.current = []

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up audio level monitoring
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
          setFrameCount(prev => prev + 1)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
      }

      mediaRecorder.start(100) // 100ms chunks
      setIsRecording(true)

      // Start level monitoring
      animationFrameRef.current = requestAnimationFrame(updateLevel)

      // Auto-stop after 3 seconds
      timeoutRef.current = setTimeout(() => {
        cleanup()
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access microphone')
    }
  }, [updateLevel, cleanup])

  const clearTest = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setFrameCount(0)
    setError(null)
  }, [audioUrl])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return (
    <div className={`space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 ${className}`}>
      <h3 className="text-sm font-medium text-gray-300">Microphone Test</h3>

      <p className="text-xs text-gray-500">
        Record a 3-second sample to test your microphone
      </p>

      <button
        onClick={isRecording ? cleanup : startTest}
        disabled={isRecording}
        className={`w-full py-2 px-4 rounded text-sm font-medium transition-colors ${
          isRecording
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
        }`}
      >
        {isRecording ? `Recording... (${3 - Math.floor(frameCount / 10)}s)` : '🎤 Test Microphone'}
      </button>

      {isRecording && (
        <AudioLevelMeter level={audioLevel} />
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {audioUrl && (
        <div className="space-y-2">
          <audio controls src={audioUrl} className="w-full h-10" />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Recorded {frameCount} chunks
            </span>
            <button
              onClick={clearTest}
              className="text-xs text-gray-400 hover:text-gray-300"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
