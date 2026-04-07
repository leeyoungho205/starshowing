import { useState, useEffect, useRef, useCallback } from 'react'
import SceneContainer from './components/SceneContainer'
import UIOverlay from './components/UIOverlay'

export type ViewMode = 'orbit' | 'ground'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('orbit')
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number } | null>(null)

  // ── 시간 시뮬레이션 시스템 ──
  const [time, setTime] = useState(new Date())
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeSpeed, setTimeSpeed] = useState(60)
  const lastFrameRef = useRef(Date.now())

  useEffect(() => {
    if (!isPlaying) return
    const animate = () => {
      const now = Date.now()
      const dt = now - lastFrameRef.current
      lastFrameRef.current = now
      setTime(prev => new Date(prev.getTime() + dt * timeSpeed))
    }
    lastFrameRef.current = Date.now()
    const id = setInterval(animate, 1000 / 30)
    return () => clearInterval(id)
  }, [isPlaying, timeSpeed])

  const resetTime = useCallback(() => setTime(new Date()), [])

  const handleEnterGroundView = useCallback(() => {
    if (selectedLocation) setViewMode('ground')
  }, [selectedLocation])

  const handleExitGroundView = useCallback(() => {
    setIsPlaying(false)
    setViewMode('orbit')
    setSelectedLocation(null)
  }, [])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: 'black', overflow: 'hidden' }}>
      <SceneContainer
        viewMode={viewMode}
        selectedLocation={selectedLocation}
        onLocationSelect={setSelectedLocation}
        time={time}
      />

      <UIOverlay
        viewMode={viewMode}
        selectedLocation={selectedLocation}
        time={time}
        isPlaying={isPlaying}
        timeSpeed={timeSpeed}
        onPlayPause={() => setIsPlaying(p => !p)}
        onSpeedChange={setTimeSpeed}
        onResetTime={resetTime}
        onEnterGroundView={handleEnterGroundView}
        onExitGroundView={handleExitGroundView}
        onLocationSelect={setSelectedLocation}
      />
    </div>
  )
}

export default App
