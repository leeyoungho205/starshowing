import { useState } from 'react'
import type { ViewMode } from '../App'
import { Play, Pause, RotateCcw, Clock, MapPin, Telescope, Globe2, Navigation, Menu, X } from 'lucide-react'

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
    onLocationSelect: (loc: { lat: number; lon: number }) => void
}

const SPEED_OPTIONS = [
    { label: '1x', value: 1 },
    { label: '10분/초', value: 600 },
    { label: '1시간/초', value: 3600 },
    { label: '1일/초', value: 86400 },
    { label: '1주일/초', value: 604800 },
]

const LOCATION_PRESETS = [
    { name: '🇰🇷 서울', lat: 37.57, lon: 126.98 },
    { name: '🇪🇬 기자 피라미드', lat: 29.98, lon: 31.13 },
    { name: '🇺🇸 뉴욕', lat: 40.71, lon: -74.01 },
    { name: '🇯🇵 도쿄', lat: 35.68, lon: 139.69 },
    { name: '🇦🇺 시드니', lat: -33.87, lon: 151.21 },
    { name: '🇬🇧 런던', lat: 51.51, lon: -0.13 },
    { name: '🇧🇷 리우', lat: -22.91, lon: -43.17 },
    { name: '🇮🇸 레이캬비크', lat: 64.15, lon: -21.94 },
]

export default function UIOverlay({
    viewMode, selectedLocation, time,
    isPlaying, timeSpeed, onPlayPause, onSpeedChange, onResetTime,
    onEnterGroundView, onExitGroundView, onLocationSelect,
}: UIOverlayProps) {
    const [showPresets, setShowPresets] = useState(false)
    const [showAppInfo, setShowAppInfo] = useState(false)

    // ── 공통 버튼 스타일 & 호버 이벤트 ──
    const primaryButtonStyle: React.CSSProperties = {
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
    }

    const handlePrimaryButtonEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,99,235,0.5)'
    }

    const handlePrimaryButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,99,235,0.3)'
    }

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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{
                            fontSize: '20px', fontWeight: 700,
                            background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            StarShowing
                        </div>
                        <button
                            onClick={() => setShowAppInfo(true)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.7)',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'white'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                        >
                            <Menu size={20} />
                        </button>
                    </div>

                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '2px' }}>
                        Educational Star Viewer
                    </div>
                    {viewMode === 'ground' && (
                        <div style={{
                            color: '#60a5fa', fontSize: '10px', marginTop: '4px',
                            display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                            <Telescope size={11} />
                            지면 관측 모드
                        </div>
                    )}

                    {/* ── 빠른 위치 이동 (상단 컨테이너 내부로 이동) ── */}
                    {viewMode === 'orbit' && (
                        <div style={{ position: 'relative', marginTop: '12px' }}>
                            <button
                                onClick={() => setShowPresets(p => !p)}
                                style={{
                                    background: showPresets ? 'rgba(37,99,235,0.6)' : 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    color: showPresets ? 'white' : 'rgba(255,255,255,0.7)',
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease',
                                    width: '100%',
                                    justifyContent: 'center'
                                }}
                            >
                                <Navigation size={12} />
                                빠른 위치 이동
                            </button>

                            {showPresets && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: '0',
                                    marginTop: '8px',
                                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '12px', padding: '8px',
                                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                                    gap: '4px', minWidth: '100%', zIndex: 20
                                }}>
                                    {LOCATION_PRESETS.map(loc => (
                                        <button
                                            key={loc.name}
                                            onClick={() => {
                                                onLocationSelect({ lat: loc.lat, lon: loc.lon })
                                                setShowPresets(false)
                                            }}
                                            style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '8px',
                                                padding: '6px 8px',
                                                color: 'rgba(255,255,255,0.85)',
                                                fontSize: '11px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.15s ease',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = 'rgba(37,99,235,0.3)'
                                                e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)'
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                                            }}
                                        >
                                            {loc.name}
                                        </button>
                                    ))}
                                </div>
                            )}
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
                        style={primaryButtonStyle}
                        onMouseEnter={handlePrimaryButtonEnter}
                        onMouseLeave={handlePrimaryButtonLeave}
                    >
                        <Telescope size={18} />
                        현재 위치의 지면에서 보기
                    </button>
                )}

                {/* ── 지구본으로 돌아가기 버튼 (ground 모드) ── */}
                {viewMode === 'ground' && (
                    <button
                        onClick={onExitGroundView}
                        style={primaryButtonStyle}
                        onMouseEnter={handlePrimaryButtonEnter}
                        onMouseLeave={handlePrimaryButtonLeave}
                    >
                        <Globe2 size={16} />
                        지구본 보기로 돌아가기
                    </button>
                )}

                {/* ── 안내 문구 ── */}
                {viewMode === 'orbit' && !selectedLocation && (
                    <div
                        style={{
                            ...primaryButtonStyle,
                            cursor: 'default',
                            boxShadow: '0 4px 20px rgba(37,99,235,0.1)',
                        }}
                    >
                        <Globe2 size={16} />
                        지구를 클릭하여 관측 위치를 선택하세요
                    </div>
                )}

                {/* 기존의 하단 빠른 위치 이동 제거 (상단으로 이동됨) */}
            </div>

            {/* ── App Info Modal (Apple Style) ── */}
            <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: showAppInfo ? 'auto' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
            }}>
                {/* 배경 오버레이 */}
                <div
                    onClick={() => setShowAppInfo(false)}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(4px)',
                        opacity: showAppInfo ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                    }}
                />

                {/* 모달 컨텐츠 */}
                <div style={{
                    position: 'relative',
                    background: 'rgba(30, 30, 30, 0.75)',
                    backdropFilter: 'blur(20px) saturate(150%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    padding: '32px',
                    width: '90%',
                    maxWidth: '400px',
                    opacity: showAppInfo ? 1 : 0,
                    transform: showAppInfo ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.9)',
                }}>
                    <button
                        onClick={() => setShowAppInfo(false)}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'rgba(255, 255, 255, 0.7)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                            e.currentTarget.style.color = 'white'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                        }}
                    >
                        <X size={16} />
                    </button>

                    <h2 style={{
                        margin: '0 0 20px 0',
                        fontSize: '24px',
                        fontWeight: 600,
                        background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        StarShowing
                    </h2>

                    <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.8)' }}>
                        <p style={{ marginBottom: '16px' }}>
                            밤하늘의 별자리와 태양계 천체들의 움직임을 관찰할 수 있는 교육용 시뮬레이션입니다.
                        </p>

                        <h3 style={{ fontSize: '15px', color: 'white', marginTop: '20px', marginBottom: '8px' }}>💡 사용 방법</h3>
                        <ul style={{ paddingLeft: '20px', margin: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>
                                <strong>마우스 조작:</strong>
                                <br />• <strong>회전:</strong> 마우스 왼쪽 버튼을 클릭한 상태로 드래그
                                <br />• <strong>확대/축소:</strong> 마우스 휠 스크롤
                            </li>
                            <li>
                                <strong>태양계 뷰:</strong> 지구본 모드에서 마우스 휠을 아래로 끝까지 스크롤하여 줌아웃하면 접근할 수 있습니다. 지구, 달, 태양의 상대적인 위치와 궤도를 관찰할 수 있습니다.
                            </li>
                            <li><strong>지구본 뷰:</strong> 지구를 드래그하여 회전시키고, 관측을 원하는 위치를 클릭하세요.</li>
                            <li><strong>시간 제어:</strong> 우측 상단의 조작 패널을 통해 시간을 빠르게 감거나 멈출 수 있습니다.</li>
                            <li><strong>빠른 이동:</strong> 좌측 상단의 메뉴를 이용해 전 세계 주요 명소로 즉시 이동해 보세요.</li>
                            <li><strong>지면 관측 모드:</strong> 위치 선택 후 나타나는 하단 버튼을 누르면, 해당 위치의 밤하늘을 1인칭으로 감상할 수 있습니다.</li>
                        </ul>

                        <div style={{
                            marginTop: '24px',
                            paddingTop: '16px',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.45)',
                            fontSize: '12px',
                            lineHeight: 1.8,
                        }}>
                            <div>제작자: 고경초등학교 이영호</div>
                            <div style={{ marginTop: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                                v{__APP_VERSION__} · {__BUILD_DATE__}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
