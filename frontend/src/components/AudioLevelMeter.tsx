'use client'

import { useMemo } from 'react'

interface AudioLevelMeterProps {
  level: number // 0-1 range
  className?: string
}

export function AudioLevelMeter({ level, className = '' }: AudioLevelMeterProps) {
  const { color, label, indicator } = useMemo(() => {
    if (level < 0.05) {
      return { color: 'bg-gray-500', label: 'Silent', indicator: '⚪' }
    } else if (level < 0.3) {
      return { color: 'bg-green-500', label: 'Quiet', indicator: '🟢' }
    } else if (level < 0.7) {
      return { color: 'bg-yellow-500', label: 'Good', indicator: '🟡' }
    } else {
      return { color: 'bg-red-500', label: 'Loud', indicator: '🔴' }
    }
  }, [level])

  const percentage = Math.round(level * 100)

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">Audio Level</span>
        <span className="flex items-center gap-2">
          <span>{indicator}</span>
          <span className="text-gray-300">{label}</span>
          <span className="text-gray-500 w-12 text-right">{percentage}%</span>
        </span>
      </div>
      <div className="audio-meter bg-gray-700 rounded">
        <div
          className={`audio-meter-fill ${color} rounded`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
