import { Suspense, useMemo, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import Earth from "./Earth";
import EarthFallback from "./EarthFallback";
import CelestialSphere from "./CelestialSphere";
import SolarSystemView from "./SolarSystemView";
import Ground from "./Ground";
import GroundCamera from "./GroundCamera";
import type { ViewMode } from "../App";
import { getSunPosition, raDecToXYZ } from "../utils/celestialCalc";

interface SceneContainerProps {
    viewMode: ViewMode;
    selectedLocation: { lat: number; lon: number } | null;
    onLocationSelect: (loc: { lat: number; lon: number }) => void;
    time: Date;
}

function OrbitCameraRig({
    zoomProgress,
    sunLightPosition,
}: {
    zoomProgress: number;
    sunLightPosition: [number, number, number];
}) {
    const controlsRef = useRef<OrbitControlsImpl>(null);

    useFrame(() => {
        if (controlsRef.current) {
            // 태양계 중심으로 시점을 살짝 이동 (전체 조망을 위함)
            // 태양 방향으로 50% 정도 당겨서 지구와 태양계를 전체적으로 화면에 담음
            const targetX = sunLightPosition[0] * 0.5 * zoomProgress;
            const targetY = sunLightPosition[1] * 0.5 * zoomProgress;
            const targetZ = sunLightPosition[2] * 0.5 * zoomProgress;

            controlsRef.current.target.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.1);
        }
    });

    return (
        <>
            <PerspectiveCamera
                makeDefault
                position={[-1.68, 2.1, -2.23]}
                fov={45}
                near={0.01}
                far={1000}
            />
            <OrbitControls
                ref={controlsRef}
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
    );
}

export default function SceneContainer({
    viewMode,
    selectedLocation,
    onLocationSelect,
    time,
}: SceneContainerProps) {
    // 태양 위치로부터 조명 방향 계산
    const sunLightPosition = useMemo(() => {
        const sunPos = getSunPosition(time);
        // 큰 반경에서 방향만 중요하므로 R=10 사용
        const [x, y, z] = raDecToXYZ(sunPos.ra, sunPos.dec, 10);
        return [x, y, z] as [number, number, number];
    }, [time]);

    // 태양계 줌아웃 애니메이션 진행도 (0 = 지구 중심 뷰, 1 = 태양계 전체 뷰)
    const [isZoomedOut, setIsZoomedOut] = useState(false);
    const [zoomProgress, setZoomProgress] = useState(0);

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <Canvas gl={{ antialias: true }} dpr={[1, 2]}>
                {viewMode === "orbit" ? (
                    <>
                        {/* ── Orbit 모드 ── */}

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
                            position={[
                                -sunLightPosition[0],
                                -sunLightPosition[1],
                                -sunLightPosition[2],
                            ]}
                            intensity={0.3}
                            color="#4488ff"
                        />

                        <Suspense fallback={<EarthFallback />}>
                            <Earth
                                selectedLocation={selectedLocation}
                                onSelect={onLocationSelect}
                                viewMode={viewMode}
                                time={time}
                                zoomProgress={zoomProgress}
                            />
                        </Suspense>

                        <CelestialSphere
                            viewMode={viewMode}
                            selectedLocation={selectedLocation}
                            time={time}
                            zoomProgress={zoomProgress}
                        />

                        <SolarSystemView
                            setIsZoomedOut={setIsZoomedOut}
                            setZoomProgress={setZoomProgress}
                        />

                        <OrbitCameraRig zoomProgress={zoomProgress} sunLightPosition={sunLightPosition} />
                    </>
                ) : (
                    <>
                        {/* ── Ground 모드 ── */}
                        <PerspectiveCamera
                            makeDefault
                            position={[0, 0, 0]}
                            fov={75}
                            near={0.1}
                            far={500}
                        />

                        {/* 약한 환경광 (밤하늘 분위기) */}
                        <ambientLight intensity={0.3} />

                        {/* 천구 (별자리 + 태양 + 달) */}
                        <CelestialSphere
                            viewMode={viewMode}
                            selectedLocation={selectedLocation}
                            time={time}
                            zoomProgress={0}
                        />

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
    );
}
