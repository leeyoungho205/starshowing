import type { ViewMode } from '../App'
import { Play, Pause, RotateCcw, Clock, MapPin, Telescope, Globe2 } from 'lucide-react'

interface UIOverlayProps {
    viewMode: ViewMode
    selectedLocation: { lat: number; lon: number } | null
    time: Date
    isPlaying: boolean
    timeSpeed: number
    onPlayPause: () => void
    onSpeedChange: (speed: number) => void
    onResetTime: () => void
    onEnterGroundView: () => void
    onExitGroundView: () => void
}

const SPEED_OPTIONS = [
    { label: '1x', value: 1 },
    { label: '1분/초', value: 60 },
    { label: '10분/초', value: 600 },
    { label: '1시간/초', value: 3600 },
]

export default function UIOverlay({
    viewMode, selectedLocation, time,
    isPlaying, timeSpeed, onPlayPause, onSpeedChange, onResetTime,
    onEnterGroundView, onExitGroundView,
}: UIOverlayProps) {
    return (
        <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            padding: '16px', zIndex: 10,
        }}>
            {/* ── 상단 ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'auto' }}>
                <div style={{
                    background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '16px',
                }}>
                    <div style={{
                        fontSize: '20px', fontWeight: 700,
                        background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        StarShowing
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '2px' }}>
                        Educational Star Viewer
                    </div>
                    {viewMode === 'ground' && (
                        <div style={{
                            color: '#60a5fa', fontSize: '10px', marginTop: '4px',
                            display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                            <Telescope size={10} />
                            지면 관측 모드
                        </div>
                    )}
                </div>

                {/* 시간 표시 + 제어 */}
                <div style={{
                    background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '16px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="#60a5fa" />
                        <span style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace', fontSize: '13px' }}>
                            {time.toLocaleString('ko-KR', {
                                year: 'numeric', month: '2-digit', day: '2-digit',
                                hour: '2-digit', minute: '2-digit', second: '2-digit',
                                hour12: false,
                            })}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                        <button onClick={onPlayPause} style={{
                            padding: '6px', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center',
                        }}>
                            {isPlaying
                                ? <Pause size={14} color="#facc15" />
                                : <Play size={14} color="#4ade80" />}
                        </button>

                        <button onClick={onResetTime} style={{
                            padding: '6px', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center',
                        }}>
                            <RotateCcw size={14} color="rgba(255,255,255,0.7)" />
                        </button>

                        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)', margin: '0 2px' }} />

                        {SPEED_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => onSpeedChange(opt.value)}
                                style={{
                                    padding: '4px 8px', borderRadius: '6px',
                                    fontSize: '10px', fontWeight: 500, border: 'none', cursor: 'pointer',
                                    background: timeSpeed === opt.value ? '#2563eb' : 'rgba(255,255,255,0.1)',
                                    color: timeSpeed === opt.value ? 'white' : 'rgba(255,255,255,0.6)',
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── 하단 ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', pointerEvents: 'auto' }}>
                {/* 좌표 표시 */}
                {selectedLocation && (
                    <div style={{
                        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '16px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                        <MapPin size={14} color="#f87171" />
                        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>
                            {Math.abs(selectedLocation.lat).toFixed(2)}°{selectedLocation.lat >= 0 ? 'N' : 'S'},{' '}
                            {Math.abs(selectedLocation.lon).toFixed(2)}°{selectedLocation.lon >= 0 ? 'E' : 'W'}
                        </span>
                    </div>
                )}

                {/* ── 지면에서 보기 버튼 (orbit 모드, 위치 선택 완료시) ── */}
                {viewMode === 'orbit' && selectedLocation && (
                    <button
                        onClick={onEnterGroundView}
                        style={{
                            background: 'linear-gradient(135deg, rgba(37,99,235,0.8), rgba(124,58,237,0.8))',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            padding: '12px 24px',
                            borderRadius: '16px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'scale(1.05)'
                            e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,99,235,0.5)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'scale(1)'
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,99,235,0.3)'
                        }}
                    >
                        <Telescope size={18} />
                        현재 위치의 지면에서 보기
                    </button>
                )}

                {/* ── 지구본으로 돌아가기 버튼 (ground 모드) ── */}
                {viewMode === 'ground' && (
                    <button
                        onClick={onExitGroundView}
                        style={{
                            background: 'rgba(0,0,0,0.65)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            padding: '10px 20px',
                            borderRadius: '16px',
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                            e.currentTarget.style.color = 'white'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(0,0,0,0.65)'
                            e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                        }}
                    >
                        <Globe2 size={16} />
                        지구본 보기로 돌아가기
                    </button>
                )}

                {/* ── 안내 문구 ── */}
                {viewMode === 'orbit' && !selectedLocation && (
                    <div style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        padding: '6px 16px', borderRadius: '20px',
                        color: 'rgba(255,255,255,0.5)', fontSize: '13px',
                    }}>
                        지구를 클릭하여 관측 위치를 선택하세요
                    </div>
                )}
            </div>
        </div>
    )
}
