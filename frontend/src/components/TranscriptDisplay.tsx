'use client'

interface TranscriptDisplayProps {
  transcript: string
  interimText: string
  isRecording: boolean
}

export function TranscriptDisplay({
  transcript,
  interimText,
  isRecording,
}: TranscriptDisplayProps) {
  const hasContent = transcript || interimText

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-200">Transcript</h2>
        {hasContent && (
          <span className="text-xs text-gray-500">
            {transcript.length} chars
            {interimText && ` (+${interimText.length} pending)`}
          </span>
        )}
      </div>

      <div className="transcript-container flex-1 bg-gray-900 rounded-lg p-4 border border-gray-700">
        {hasContent ? (
          <div className="space-y-2">
            {transcript && (
              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                {transcript}
              </p>
            )}
            {interimText && (
              <p className="text-gray-400 italic leading-relaxed">
                {interimText}
              </p>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 text-center">
              {isRecording ? (
                <>
                  <span className="recording-pulse inline-block">🎤</span>
                  <br />
                  Listening... Start speaking to see transcription.
                </>
              ) : (
                <>
                  Click &ldquo;Start Recording&rdquo; to begin transcription.
                  <br />
                  <span className="text-sm">
                    Make sure to allow microphone access when prompted.
                  </span>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
