import { useMemo } from 'react'
import { DoubleSide, Vector3, BufferGeometry, Float32BufferAttribute, LineBasicMaterial, LineLoop } from 'three'

/**
 * 지상 뷰 바닥면 컴포넌트
 *
 * 관측자를 원점(0,0,0)에 놓고 사실적인 지면/지평선/방위를 그립니다.
 * - 지평선 원 (Y=0 평면)
 * - N/S/E/W 방위 라벨
 * - 30° 간격 방위각 눈금선
 * - 고도 가이드 (30°, 60°)
 * - 지면(짙은 녹색 반구 아래)
 */
export default function Ground() {
    const HORIZON_RADIUS = 200

    // ── 지평선 원 ──
    const horizonRing = useMemo(() => {
        const segments = 128
        const pts = new Float32Array(segments * 3)
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2
            pts[i * 3] = Math.sin(angle) * HORIZON_RADIUS
            pts[i * 3 + 1] = 0
            pts[i * 3 + 2] = -Math.cos(angle) * HORIZON_RADIUS
        }
        const geom = new BufferGeometry()
        geom.setAttribute('position', new Float32BufferAttribute(pts, 3))
        const mat = new LineBasicMaterial({ color: '#55bbdd', transparent: true, opacity: 0.8 })
        return new LineLoop(geom, mat)
    }, [])

    // ── 방위각 눈금선 (10° 간격, 주방위는 강조) ──
    const azimuthLines = useMemo(() => {
        const lines: { angle: number; isMajor: boolean; label?: string }[] = []
        for (let deg = 0; deg < 360; deg += 10) {
            const isMajor = deg % 30 === 0
            lines.push({ angle: deg, isMajor })
        }
        return lines
    }, [])

    // ── 고도 가이드 원 (30°, 60°) ──
    const altCircles = useMemo(() => {
        return [30, 60].map(altDeg => {
            const segments = 96
            const r = HORIZON_RADIUS * Math.cos(altDeg * Math.PI / 180)
            const y = HORIZON_RADIUS * Math.sin(altDeg * Math.PI / 180)
            const pts = new Float32Array(segments * 3)
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2
                pts[i * 3] = Math.sin(angle) * r
                pts[i * 3 + 1] = y
                pts[i * 3 + 2] = -Math.cos(angle) * r
            }
            const geom = new BufferGeometry()
            geom.setAttribute('position', new Float32BufferAttribute(pts, 3))
            const mat = new LineBasicMaterial({ color: '#224455', transparent: true, opacity: 0.25 })
            return new LineLoop(geom, mat)
        })
    }, [])

    // ── 방위 마커 데이터 ──
    const compassMarkers = useMemo(() => {
        const R = HORIZON_RADIUS * 0.98
        return [
            { label: 'N', azimuth: 0, color: '#ff4444', x: 0, z: -R },
            { label: 'E', azimuth: 90, color: '#aaaaaa', x: R, z: 0 },
            { label: 'S', azimuth: 180, color: '#aaaaaa', x: 0, z: R },
            { label: 'W', azimuth: 270, color: '#aaaaaa', x: -R, z: 0 },
            { label: 'NE', azimuth: 45, color: '#666666', x: R * Math.sin(Math.PI / 4), z: -R * Math.cos(Math.PI / 4) },
            { label: 'SE', azimuth: 135, color: '#666666', x: R * Math.sin(3 * Math.PI / 4), z: -R * Math.cos(3 * Math.PI / 4) },
            { label: 'SW', azimuth: 225, color: '#666666', x: R * Math.sin(5 * Math.PI / 4), z: -R * Math.cos(5 * Math.PI / 4) },
            { label: 'NW', azimuth: 315, color: '#666666', x: R * Math.sin(7 * Math.PI / 4), z: -R * Math.cos(7 * Math.PI / 4) },
        ]
    }, [])

    return (
        <group>
            {/* ── 지면 바닥 (어두운 녹색 원반, Y=0 아래) ── */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <circleGeometry args={[HORIZON_RADIUS * 1.5, 64]} />
                <meshBasicMaterial color="#040804" side={DoubleSide} />
            </mesh>

            {/* ── 지평선 글로우 (안쪽 - 청록색 그라데이션) ── */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.003, 0]}>
                <ringGeometry args={[HORIZON_RADIUS * 0.7, HORIZON_RADIUS * 1.05, 64]} />
                <meshBasicMaterial color="#1a3a4a" transparent opacity={0.6} side={DoubleSide} />
            </mesh>

            {/* ── 지평선 발광 라인 (상단 링) ── */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <ringGeometry args={[HORIZON_RADIUS * 0.97, HORIZON_RADIUS * 1.03, 128]} />
                <meshBasicMaterial color="#3399aa" transparent opacity={0.35} side={DoubleSide} />
            </mesh>

            {/* ── 지평선 원 ── */}
            <primitive object={horizonRing} />

            {/* ── 고도 가이드 원 ── */}
            {altCircles.map((circle, i) => (
                <primitive key={`alt-${i}`} object={circle} />
            ))}

            {/* ── 방위각 눈금선 ── */}
            {azimuthLines.map(({ angle, isMajor }) => {
                const azRad = angle * Math.PI / 180
                const sinA = Math.sin(azRad)
                const cosA = -Math.cos(azRad)
                const innerR = isMajor ? 0.5 : HORIZON_RADIUS * 0.95
                const outerR = HORIZON_RADIUS
                const start = new Vector3(sinA * innerR, 0, cosA * innerR)
                const end = new Vector3(sinA * outerR, 0, cosA * outerR)
                const positions = new Float32Array([start.x, start.y, start.z, end.x, end.y, end.z])
                const geom = new BufferGeometry()
                geom.setAttribute('position', new Float32BufferAttribute(positions, 3))

                return (
                    <lineSegments key={`az-${angle}`} geometry={geom}>
                        <lineBasicMaterial
                            color={isMajor ? '#225566' : '#112233'}
                            transparent
                            opacity={isMajor ? 0.4 : 0.15}
                        />
                    </lineSegments>
                )
            })}

            {/* ── N/S/E/W 방위 라벨 (billboard sprite) ── */}
            {compassMarkers.map(marker => (
                <sprite
                    key={marker.label}
                    position={[marker.x, marker.label.length === 1 ? 12 : 6, marker.z]}
                    scale={[marker.label.length === 1 ? 16 : 10, marker.label.length === 1 ? 8 : 5, 1]}
                >
                    <spriteMaterial
                        transparent
                        opacity={marker.label.length === 1 ? 0.9 : 0.5}
                        depthTest={false}
                    >
                        <canvasTexture
                            attach="map"
                            image={(() => {
                                const canvas = document.createElement('canvas')
                                canvas.width = 128
                                canvas.height = 64
                                const ctx = canvas.getContext('2d')!
                                ctx.fillStyle = marker.color
                                ctx.font = `bold ${marker.label.length === 1 ? 48 : 36}px Inter, system-ui, sans-serif`
                                ctx.textAlign = 'center'
                                ctx.textBaseline = 'middle'
                                ctx.fillText(marker.label, 64, 32)
                                return canvas
                            })()}
                        />
                    </spriteMaterial>
                </sprite>
            ))}

            {/* ── 방위각 도수 라벨 (30° 간격) ── */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
                const azRad = deg * Math.PI / 180
                const R = HORIZON_RADIUS * 1.02
                const x = Math.sin(azRad) * R
                const z = -Math.cos(azRad) * R
                // 주방위가 아닌 곳만 숫자 표시
                if (deg % 90 === 0) return null
                return (
                    <sprite
                        key={`deg-${deg}`}
                        position={[x, 3, z]}
                        scale={[8, 4, 1]}
                    >
                        <spriteMaterial transparent opacity={0.4} depthTest={false}>
                            <canvasTexture
                                attach="map"
                                image={(() => {
                                    const canvas = document.createElement('canvas')
                                    canvas.width = 96
                                    canvas.height = 48
                                    const ctx = canvas.getContext('2d')!
                                    ctx.fillStyle = '#77aacc'
                                    ctx.font = '28px Inter, system-ui, sans-serif'
                                    ctx.textAlign = 'center'
                                    ctx.textBaseline = 'middle'
                                    ctx.fillText(`${deg}°`, 48, 24)
                                    return canvas
                                })()}
                            />
                        </spriteMaterial>
                    </sprite>
                )
            })}

            {/* ── 나무/산 실루엣 (지평선 위) ── */}
            {Array.from({ length: 60 }, (_, i) => {
                const angle = (i / 60) * Math.PI * 2
                const R = HORIZON_RADIUS * 0.99
                const h = 1.5 + Math.sin(i * 17) * 1.2 + Math.sin(i * 7) * 0.8
                const x = Math.sin(angle) * R
                const z = -Math.cos(angle) * R
                return (
                    <mesh key={`tree-${i}`} position={[x, h * 0.5, z]}>
                        <boxGeometry args={[HORIZON_RADIUS * 0.12, h, 1]} />
                        <meshBasicMaterial color="#020402" side={DoubleSide} />
                    </mesh>
                )
            })}
        </group>
    )
}
