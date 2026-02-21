import { useMemo } from 'react'
import { DoubleSide, TextureLoader } from 'three'
import { useLoader } from '@react-three/fiber'
import { getMoonPosition, getMoonPhaseAngle, raDecToXYZ } from '../utils/celestialCalc'

interface MoonProps {
    time: Date
    celestialRadius: number
}

/**
 * 달 렌더링 컴포넌트
 * - NASA 달 텍스처 적용
 * - 위상(phase) 표현 (반구 그림자 마스크)
 * - 천구 반지름 위에 배치
 */
export default function Moon({ time, celestialRadius }: MoonProps) {
    const moonTexture = useLoader(TextureLoader, '/textures/moon.jpg')

    const { position, size, phase, phaseLabel } = useMemo(() => {
        const moonPos = getMoonPosition(time)
        const pos = raDecToXYZ(moonPos.ra, moonPos.dec, celestialRadius)
        const sz = celestialRadius * 0.015
        const phaseAngle = getMoonPhaseAngle(time)

        let label = ''
        if (phaseAngle < 22.5 || phaseAngle >= 337.5) label = '🌑 신월'
        else if (phaseAngle < 67.5) label = '🌒 초승달'
        else if (phaseAngle < 112.5) label = '🌓 상현달'
        else if (phaseAngle < 157.5) label = '🌔 볼록달'
        else if (phaseAngle < 202.5) label = '🌕 보름달'
        else if (phaseAngle < 247.5) label = '🌖 기울달'
        else if (phaseAngle < 292.5) label = '🌗 하현달'
        else label = '🌘 그믐달'

        return { position: pos, size: sz, phase: phaseAngle, phaseLabel: label }
    }, [time, celestialRadius])

    // 밝기: 보름달(180°)에서 최대, 신월(0°/360°)에서 최소
    const brightness = useMemo(() => {
        const normalized = Math.abs(Math.cos(phase * Math.PI / 180))
        return 0.3 + 0.7 * (1 - normalized)
    }, [phase])

    return (
        <group position={position}>
            {/* 달 본체 — NASA 텍스처 */}
            <mesh>
                <sphereGeometry args={[size, 32, 32]} />
                <meshStandardMaterial
                    map={moonTexture}
                    emissive="#ffffff"
                    emissiveIntensity={brightness * 0.4}
                    emissiveMap={moonTexture}
                    roughness={1}
                    metalness={0}
                />
            </mesh>

            {/* 달 그림자 (위상 표현) - 반구 마스크 */}
            <mesh rotation={[0, (phase / 180) * Math.PI, 0]}>
                <sphereGeometry args={[size * 1.01, 32, 32, 0, Math.PI]} />
                <meshBasicMaterial
                    color="#111111"
                    transparent
                    opacity={0.75}
                    side={DoubleSide}
                />
            </mesh>

            {/* 달 글로우 */}
            <sprite scale={[size * 5, size * 5, 1]}>
                <spriteMaterial
                    transparent
                    opacity={brightness * 0.3}
                    depthWrite={false}
                >
                    <canvasTexture
                        attach="map"
                        image={(() => {
                            const canvas = document.createElement('canvas')
                            canvas.width = 64
                            canvas.height = 64
                            const ctx = canvas.getContext('2d')!
                            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
                            gradient.addColorStop(0, 'rgba(220, 220, 200, 0.6)')
                            gradient.addColorStop(0.3, 'rgba(200, 200, 180, 0.2)')
                            gradient.addColorStop(1, 'rgba(180, 180, 160, 0)')
                            ctx.fillStyle = gradient
                            ctx.fillRect(0, 0, 64, 64)
                            return canvas
                        })()}
                    />
                </spriteMaterial>
            </sprite>

            {/* 달 라벨 */}
            <sprite
                position={[0, size * 3, 0]}
                scale={[size * 4, size * 2, 1]}
            >
                <spriteMaterial transparent opacity={0.85} depthTest={false}>
                    <canvasTexture
                        attach="map"
                        image={(() => {
                            const canvas = document.createElement('canvas')
                            canvas.width = 128
                            canvas.height = 64
                            const ctx = canvas.getContext('2d')!
                            ctx.fillStyle = '#E0E0CC'
                            ctx.font = 'bold 28px Inter, system-ui, sans-serif'
                            ctx.textAlign = 'center'
                            ctx.textBaseline = 'middle'
                            ctx.fillText(phaseLabel, 64, 32)
                            return canvas
                        })()}
                    />
                </spriteMaterial>
            </sprite>
        </group>
    )
}
