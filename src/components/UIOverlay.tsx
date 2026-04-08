import { useState, useEffect } from 'react'
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

// 데스크톱용 속도 옵션
const SPEED_OPTIONS = [
    { label: '1x', value: 1 },
    { label: '10분/초', value: 600 },
    { label: '1시간/초', value: 3600 },
    { label: '1일/초', value: 86400 },
    { label: '1주일/초', value: 604800 },
]

// 모바일용 속도 옵션 (짧은 레이블)
const SPEED_OPTIONS_MOBILE = [
    { label: '1x', value: 1 },
    { label: '1시간', value: 3600 },
    { label: '1일', value: 86400 },
    { label: '1주', value: 604800 },
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

    // ── 화면 크기 감지 ──
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    useEffect(() => {
        const onResize = () => setWindowWidth(window.innerWidth)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])
    const isMobile = windowWidth < 640   // 작은 폰
    const isTablet = windowWidth < 1024  // 태블릿 포함

    // ── 반응형 값 ──
    const outerPadding = isMobile ? '8px' : '16px'
    const panelPadding = isMobile ? '8px 10px' : '12px'
    const panelRadius = isMobile ? '12px' : '16px'
    const titleSize = isMobile ? '16px' : '20px'
    const speedOpts = isMobile ? SPEED_OPTIONS_MOBILE : SPEED_OPTIONS
    const iconSize = isMobile ? 16 : 14          // 아이콘: 모바일에서 더 크게
    const playBtnPad = isMobile ? '10px' : '6px' // 터치 영역 확보

    // ── 하단 주 버튼 스타일 ──
    const primaryButtonStyle: React.CSSProperties = {
        background: 'linear-gradient(135deg, rgba(37,99,235,0.85), rgba(124,58,237,0.85))',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.2)',
        padding: isMobile ? '14px 20px' : '12px 24px',
        borderRadius: '16px',
        color: 'white',
        fontSize: isMobile ? '15px' : '14px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
        minHeight: '48px', // 터치 최소 높이
        width: isMobile ? '90vw' : 'auto',
        justifyContent: isMobile ? 'center' : 'flex-start',
        maxWidth: '360px',
    }

    const handlePrimaryButtonEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.transform = 'scale(1.04)'
        e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,99,235,0.5)'
    }
    const handlePrimaryButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,99,235,0.3)'
    }

    // ── 시간 표시 형식: 모바일은 날짜/시간 두 줄 ──
    const timeString = isMobile
        ? time.toLocaleString('ko-KR', {
            month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
            hour12: false,
        })
        : time.toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false,
        })

    return (
        <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            padding: outerPadding,
            paddingBottom: `max(${outerPadding}, env(safe-area-inset-bottom, ${outerPadding}))`,
            zIndex: 10,
        }}>
            {/* ── 상단 ── */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                pointerEvents: 'auto', gap: '8px',
            }}>
                {/* 좌상단: 타이틀 + 메뉴 + 빠른 위치 이동 */}
                <div style={{
                    background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: panelPadding, borderRadius: panelRadius,
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{
                            fontSize: titleSize, fontWeight: 700,
                            background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            StarShowing
                        </div>
                        {/* 메뉴 버튼 - 터치 영역 확보 */}
                        <button
                            onClick={() => setShowAppInfo(true)}
                            style={{
                                background: 'transparent', border: 'none',
                                color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                                padding: '6px', display: 'flex', alignItems: 'center',
                                minWidth: '36px', minHeight: '36px', justifyContent: 'center',
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'white'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                        >
                            <Menu size={isMobile ? 22 : 20} />
                        </button>
                    </div>

                    {!isMobile && (
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '2px' }}>
                            Educational Star Viewer
                        </div>
                    )}

                    {viewMode === 'ground' && (
                        <div style={{
                            color: '#60a5fa', fontSize: isMobile ? '11px' : '10px',
                            marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                            <Telescope size={11} />
                            지면 관측 모드
                        </div>
                    )}

                    {/* 빠른 위치 이동 */}
                    {viewMode === 'orbit' && (
                        <div style={{ position: 'relative', marginTop: '8px' }}>
                            <button
                                onClick={() => setShowPresets(p => !p)}
                                style={{
                                    background: showPresets ? 'rgba(37,99,235,0.6)' : 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    padding: isMobile ? '8px 12px' : '6px 12px',
                                    borderRadius: '8px',
                                    color: showPresets ? 'white' : 'rgba(255,255,255,0.7)',
                                    fontSize: isMobile ? '12px' : '11px',
                                    fontWeight: 500, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    transition: 'all 0.2s ease',
                                    width: '100%', justifyContent: 'center',
                                    minHeight: '36px',
                                }}
                            >
                                <Navigation size={12} />
                                빠른 위치 이동
                            </button>

                            {showPresets && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: '0',
                                    marginTop: '6px',
                                    background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '12px', padding: '8px',
                                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                                    gap: '4px', minWidth: isMobile ? '160px' : '100%', zIndex: 20,
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
                                                padding: isMobile ? '8px' : '6px 8px',
                                                color: 'rgba(255,255,255,0.85)',
                                                fontSize: isMobile ? '12px' : '11px',
                                                cursor: 'pointer', textAlign: 'left',
                                                transition: 'all 0.15s ease',
                                                minHeight: '36px',
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

                {/* 우상단: 시간 표시 + 제어 */}
                <div style={{
                    background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: panelPadding, borderRadius: panelRadius,
                    flexShrink: 0,
                }}>
                    {/* 시간 표시 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={iconSize} color="#60a5fa" />
                        <span style={{
                            color: 'rgba(255,255,255,0.9)',
                            fontFamily: 'monospace',
                            fontSize: isMobile ? '12px' : '13px',
                        }}>
                            {timeString}
                        </span>
                    </div>

                    {/* 재생/정지 + 속도 */}
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        gap: isMobile ? '4px' : '6px', marginTop: '8px',
                        flexWrap: 'nowrap',
                    }}>
                        <button onClick={onPlayPause} style={{
                            padding: playBtnPad, borderRadius: '8px',
                            background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            minWidth: '36px', minHeight: '36px',
                        }}>
                            {isPlaying
                                ? <Pause size={iconSize} color="#facc15" />
                                : <Play size={iconSize} color="#4ade80" />}
                        </button>

                        <button onClick={onResetTime} style={{
                            padding: playBtnPad, borderRadius: '8px',
                            background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            minWidth: '36px', minHeight: '36px',
                        }}>
                            <RotateCcw size={iconSize} color="rgba(255,255,255,0.7)" />
                        </button>

                        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)', margin: '0 1px' }} />

                        {speedOpts.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => onSpeedChange(opt.value)}
                                style={{
                                    padding: isMobile ? '6px 7px' : '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: isMobile ? '11px' : '10px',
                                    fontWeight: 500, border: 'none', cursor: 'pointer',
                                    background: timeSpeed === opt.value ? '#2563eb' : 'rgba(255,255,255,0.1)',
                                    color: timeSpeed === opt.value ? 'white' : 'rgba(255,255,255,0.6)',
                                    minHeight: '32px', minWidth: isMobile ? '32px' : 'auto',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── 하단 ── */}
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: isMobile ? '10px' : '12px', pointerEvents: 'auto',
            }}>
                {/* 좌표 표시 */}
                {selectedLocation && (
                    <div style={{
                        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: isMobile ? '8px 14px' : '10px 16px',
                        borderRadius: '16px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                        <MapPin size={isMobile ? 15 : 14} color="#f87171" />
                        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: isMobile ? '13px' : '13px' }}>
                            {Math.abs(selectedLocation.lat).toFixed(2)}°{selectedLocation.lat >= 0 ? 'N' : 'S'},{' '}
                            {Math.abs(selectedLocation.lon).toFixed(2)}°{selectedLocation.lon >= 0 ? 'E' : 'W'}
                        </span>
                    </div>
                )}

                {/* 지면에서 보기 버튼 */}
                {viewMode === 'orbit' && selectedLocation && (
                    <button
                        onClick={onEnterGroundView}
                        style={primaryButtonStyle}
                        onMouseEnter={handlePrimaryButtonEnter}
                        onMouseLeave={handlePrimaryButtonLeave}
                    >
                        <Telescope size={isMobile ? 20 : 18} />
                        {isMobile ? '지면에서 보기' : '현재 위치의 지면에서 보기'}
                    </button>
                )}

                {/* 지구본으로 돌아가기 버튼 */}
                {viewMode === 'ground' && (
                    <button
                        onClick={onExitGroundView}
                        style={primaryButtonStyle}
                        onMouseEnter={handlePrimaryButtonEnter}
                        onMouseLeave={handlePrimaryButtonLeave}
                    >
                        <Globe2 size={isMobile ? 20 : 16} />
                        지구본 보기로 돌아가기
                    </button>
                )}

                {/* 안내 문구 */}
                {viewMode === 'orbit' && !selectedLocation && (
                    <div style={{ ...primaryButtonStyle, cursor: 'default', boxShadow: '0 4px 20px rgba(37,99,235,0.1)' }}>
                        <Globe2 size={isMobile ? 20 : 16} />
                        {isMobile ? '지구를 눌러 위치 선택' : '지구를 클릭하여 관측 위치를 선택하세요'}
                    </div>
                )}
            </div>

            {/* ── 설명서 모달 ── */}
            <div style={{
                position: 'absolute', inset: 0,
                pointerEvents: showAppInfo ? 'auto' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 50, padding: isMobile ? '12px' : '0',
            }}>
                {/* 배경 오버레이 */}
                <div
                    onClick={() => setShowAppInfo(false)}
                    style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                        opacity: showAppInfo ? 1 : 0, transition: 'opacity 0.3s ease',
                    }}
                />

                {/* 모달 컨텐츠 */}
                <div style={{
                    position: 'relative',
                    background: 'rgba(30,30,30,0.82)',
                    backdropFilter: 'blur(20px) saturate(150%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: isMobile ? '20px' : '24px',
                    padding: isMobile ? '24px 20px' : '32px',
                    width: '100%', maxWidth: '420px',
                    maxHeight: isMobile ? '85vh' : '80vh',
                    overflowY: 'auto',
                    opacity: showAppInfo ? 1 : 0,
                    transform: showAppInfo ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
                    transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.9)',
                }}>
                    {/* 닫기 버튼 */}
                    <button
                        onClick={() => setShowAppInfo(false)}
                        style={{
                            position: 'absolute', top: '14px', right: '14px',
                            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                            width: '34px', height: '34px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                            e.currentTarget.style.color = 'white'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                            e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
                        }}
                    >
                        <X size={16} />
                    </button>

                    <h2 style={{
                        margin: '0 0 16px 0',
                        fontSize: isMobile ? '20px' : '24px', fontWeight: 600,
                        background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        StarShowing
                    </h2>

                    <div style={{ fontSize: isMobile ? '13px' : '14px', lineHeight: 1.65, color: 'rgba(255,255,255,0.8)' }}>
                        <p style={{ marginBottom: '14px' }}>
                            밤하늘의 별자리와 태양계 천체들의 움직임을 관찰할 수 있는 교육용 시뮬레이션입니다.
                        </p>

                        <h3 style={{ fontSize: isMobile ? '14px' : '15px', color: 'white', marginTop: '16px', marginBottom: '8px' }}>
                            💡 사용 방법
                        </h3>
                        <ul style={{ paddingLeft: '18px', margin: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>
                                <strong>{isTablet ? '터치/마우스 조작:' : '마우스 조작:'}</strong>
                                <br />• <strong>회전:</strong> {isTablet ? '손가락 드래그' : '마우스 왼쪽 버튼 드래그'}
                                <br />• <strong>확대/축소:</strong> {isTablet ? '두 손가락 핀치 또는 휠' : '마우스 휠 스크롤'}
                            </li>
                            <li>
                                <strong>태양계 뷰:</strong> 지구본 모드에서 {isTablet ? '핀치 아웃(축소)' : '휠을 끝까지 스크롤'}하면 지구·달·태양의 궤도를 관찰할 수 있습니다.
                            </li>
                            <li><strong>지구본 뷰:</strong> 지구를 드래그하여 회전시키고, 관측할 위치를 탭하세요.</li>
                            <li><strong>시간 제어:</strong> 우측 상단 패널에서 시간을 빠르게 감거나 멈출 수 있습니다.</li>
                            <li><strong>빠른 이동:</strong> 좌측 상단 메뉴로 전 세계 주요 도시로 즉시 이동할 수 있습니다.</li>
                            <li><strong>지면 관측 모드:</strong> 위치 선택 후 하단 버튼을 누르면 해당 위치의 밤하늘을 1인칭으로 감상할 수 있습니다.</li>
                        </ul>

                        <div style={{
                            marginTop: '20px', paddingTop: '14px',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.45)',
                            fontSize: '12px', lineHeight: 1.8,
                        }}>
                            <div>제작자: 고경초등학교 이영호</div>
                            <div style={{ marginTop: '3px', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                                v{__APP_VERSION__} · {__BUILD_DATE__}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
