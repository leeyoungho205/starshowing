import { useMemo } from 'react'
import { AdditiveBlending } from 'three'
import { getSunPosition, raDecToXYZ } from '../utils/celestialCalc'

interface SunProps {
    time: Date
    celestialRadius: number
    viewMode?: 'orbit' | 'ground'
}

/**
 * 태양 렌더링 컴포넌트
 * - 밝은 노란색 구체 + 다중 글로우 레이어
 * - 천구 반지름 위에 배치
 * - 시간에 따라 위치 변경
 */
export default function Sun({ time, celestialRadius, viewMode }: SunProps) {
    const { position, size } = useMemo(() => {
        const isOrbit = viewMode === 'orbit'
        const actualRadius = isOrbit ? 18 : celestialRadius

        const sunPos = getSunPosition(time)
        const pos = raDecToXYZ(sunPos.ra, sunPos.dec, actualRadius)

        // 지면 모드에서는 실제 천구 비율, 궤도 모드에서는 과장하여 명확히 보이도록 설정
        const sz = isOrbit ? 1.0 : celestialRadius * 0.025
        return { position: pos, size: sz }
    }, [time, celestialRadius, viewMode])

    return (
        <group position={position}>
            {/* 태양 본체 */}
            <mesh>
                <sphereGeometry args={[size, 16, 16]} />
                <meshBasicMaterial
                    color="#FFF8E1"
                    transparent
                    opacity={1}
                />
            </mesh>

            {/* 글로우 레이어 1 - 내부 글로우 */}
            <sprite scale={[size * 6, size * 6, 1]}>
                <spriteMaterial
                    transparent
                    opacity={0.7}
                    blending={AdditiveBlending}
                    depthWrite={false}
                >
                    <canvasTexture
                        attach="map"
                        image={(() => {
                            const canvas = document.createElement('canvas')
                            canvas.width = 128
                            canvas.height = 128
                            const ctx = canvas.getContext('2d')!
                            const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
                            gradient.addColorStop(0, 'rgba(255, 255, 200, 1)')
                            gradient.addColorStop(0.15, 'rgba(255, 240, 150, 0.8)')
                            gradient.addColorStop(0.4, 'rgba(255, 200, 80, 0.3)')
                            gradient.addColorStop(1, 'rgba(255, 180, 50, 0)')
                            ctx.fillStyle = gradient
                            ctx.fillRect(0, 0, 128, 128)
                            return canvas
                        })()}
                    />
                </spriteMaterial>
            </sprite>

            {/* 글로우 레이어 2 - 외부 글로우 */}
            <sprite scale={[size * 14, size * 14, 1]}>
                <spriteMaterial
                    transparent
                    opacity={0.25}
                    blending={AdditiveBlending}
                    depthWrite={false}
                >
                    <canvasTexture
                        attach="map"
                        image={(() => {
                            const canvas = document.createElement('canvas')
                            canvas.width = 128
                            canvas.height = 128
                            const ctx = canvas.getContext('2d')!
                            const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
                            gradient.addColorStop(0, 'rgba(255, 230, 150, 0.6)')
                            gradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.2)')
                            gradient.addColorStop(1, 'rgba(255, 180, 50, 0)')
                            ctx.fillStyle = gradient
                            ctx.fillRect(0, 0, 128, 128)
                            return canvas
                        })()}
                    />
                </spriteMaterial>
            </sprite>

            {/* 태양 라벨 */}
            <sprite
                position={[0, size * 3, 0]}
                scale={[size * 4, size * 2, 1]}
            >
                <spriteMaterial transparent opacity={0.9} depthTest={false}>
                    <canvasTexture
                        attach="map"
                        image={(() => {
                            const canvas = document.createElement('canvas')
                            canvas.width = 128
                            canvas.height = 64
                            const ctx = canvas.getContext('2d')!
                            ctx.fillStyle = '#FFD54F'
                            ctx.font = 'bold 32px Inter, system-ui, sans-serif'
                            ctx.textAlign = 'center'
                            ctx.textBaseline = 'middle'
                            ctx.fillText('☀ 태양', 64, 32)
                            return canvas
                        })()}
                    />
                </spriteMaterial>
            </sprite>
        </group>
    )
}
