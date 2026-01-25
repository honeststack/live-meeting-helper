'use client'

import { AudioLevelMeter } from './AudioLevelMeter'

interface RecordingControlsProps {
  isRecording: boolean
  isConnected: boolean
  audioLevel: number
  sampleRate: number
  error: string | null
  onStartRecording: () => void
  onStopRecording: () => void
  onClearTranscript: () => void
  hasTranscript: boolean
}

export function RecordingControls({
  isRecording,
  isConnected,
  audioLevel,
  sampleRate,
  error,
  onStartRecording,
  onStopRecording,
  onClearTranscript,
  hasTranscript,
}: RecordingControlsProps) {
  return (
    <div className="space-y-6">
      {/* Recording Status */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">Status:</span>
        {isRecording ? (
          <span className="flex items-center gap-2">
            <span className="recording-pulse text-red-500">🔴</span>
            <span className="text-red-400 font-medium">Recording</span>
          </span>
        ) : (
          <span className="text-gray-500">Not recording</span>
        )}
      </div>

      {/* Main Recording Button */}
      <button
        onClick={isRecording ? onStopRecording : onStartRecording}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
          isRecording
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
      </button>

      {/* Audio Level Meter */}
      {isRecording && (
        <AudioLevelMeter level={audioLevel} />
      )}

      {/* Connection Status */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">Connection:</span>
        <span className={isConnected ? 'text-green-400' : 'text-gray-500'}>
          {isConnected ? '● Connected' : '○ Disconnected'}
        </span>
      </div>

      {/* Debug Info */}
      {isRecording && sampleRate > 0 && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>Sample Rate: {sampleRate} Hz</div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Clear Transcript Button */}
      {hasTranscript && (
        <button
          onClick={onClearTranscript}
          className="w-full py-2 px-4 rounded-lg text-gray-400 border border-gray-600 hover:bg-gray-800 transition-colors"
        >
          Clear Transcript
        </button>
      )}
    </div>
  )
}
