import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import Earth from './Earth'
import EarthFallback from './EarthFallback'
import CelestialSphere from './CelestialSphere'
import Ground from './Ground'
import GroundCamera from './GroundCamera'
import type { ViewMode } from '../App'
import { getSunPosition, raDecToXYZ } from '../utils/celestialCalc'

interface SceneContainerProps {
    viewMode: ViewMode
    selectedLocation: { lat: number; lon: number } | null
    onLocationSelect: (loc: { lat: number; lon: number }) => void
    time: Date
}

export default function SceneContainer({ viewMode, selectedLocation, onLocationSelect, time }: SceneContainerProps) {
    // 태양 위치로부터 조명 방향 계산
    const sunLightPosition = useMemo(() => {
        const sunPos = getSunPosition(time)
        // 큰 반경에서 방향만 중요하므로 R=10 사용
        const [x, y, z] = raDecToXYZ(sunPos.ra, sunPos.dec, 10)
        return [x, y, z] as [number, number, number]
    }, [time])

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas gl={{ antialias: true }} dpr={[1, 2]}>
                {viewMode === 'orbit' ? (
                    <>
                        {/* ── Orbit 모드 ── */}
                        {/* 카메라: 대한민국이 보이도록 초기 위치 설정 */}
                        <PerspectiveCamera makeDefault position={[-1.68, 2.1, -2.23]} fov={45} near={0.01} far={1000} />

                        {/* 환경광 */}
                        <ambientLight intensity={0.8} />

                        {/* 태양 위치 기반 조명 */}
                        <directionalLight
                            position={sunLightPosition}
                            intensity={3.5}
                            color="#fff5e6"
                        />

                        {/* 반대편 약한 반사광 */}
                        <pointLight
                            position={[-sunLightPosition[0], -sunLightPosition[1], -sunLightPosition[2]]}
                            intensity={0.3}
                            color="#4488ff"
                        />

                        <Suspense fallback={<EarthFallback />}>
                            <Earth
                                selectedLocation={selectedLocation}
                                onSelect={onLocationSelect}
                                viewMode={viewMode}
                                time={time}
                            />
                        </Suspense>

                        <CelestialSphere viewMode={viewMode} selectedLocation={selectedLocation} time={time} />

                        <OrbitControls
                            enablePan={false}
                            enableZoom={true}
                            minDistance={1.3}
                            maxDistance={10}
                            zoomSpeed={0.6}
                            rotateSpeed={0.5}
                            dampingFactor={0.08}
                            enableDamping
                        />
                    </>
                ) : (
                    <>
                        {/* ── Ground 모드 ── */}
                        <PerspectiveCamera makeDefault position={[0, 0, 0]} fov={60} near={0.1} far={500} />

                        {/* 약한 환경광 (밤하늘 분위기) */}
                        <ambientLight intensity={0.3} />

                        {/* 천구 (별자리 + 태양 + 달) */}
                        <CelestialSphere viewMode={viewMode} selectedLocation={selectedLocation} time={time} />

                        {/* 지면 */}
                        <Ground />

                        {/* 카메라 제어 */}
                        {selectedLocation && (
                            <GroundCamera selectedLocation={selectedLocation} />
                        )}
                    </>
                )}
            </Canvas>
        </div>
    )
}
