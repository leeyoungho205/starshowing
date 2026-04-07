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
import { getSunPosition, getMoonPosition, raDecToXYZ } from "../utils/celestialCalc";

interface SceneContainerProps {
    viewMode: ViewMode;
    selectedLocation: { lat: number; lon: number } | null;
    onLocationSelect: (loc: { lat: number; lon: number }) => void;
    time: Date;
    onGlobeRotate?: () => void; // 지구본 회전 시 시간 재생 일시정지
}

function OrbitCameraRig({
    zoomProgress,
    time,
    onGlobeRotate,
}: {
    zoomProgress: number;
    time: Date;
    onGlobeRotate?: () => void;
}) {
    const controlsRef = useRef<OrbitControlsImpl>(null);

    useFrame(() => {
        if (controlsRef.current) {
            // 태양계 디오라마 뷰에서는 지구(0,0,0), 달, 태양 세 천체가 모두 화면에 나오도록 
            // 세 천체의 중심점(Centroid)을 카메라 타겟으로 삼음

            // 1. 달의 현재 위치 계산 (Moon.tsx 와 동일한 궤도 왜곡 적용)
            getMoonPosition(time);

            // 2. 태양의 현재 위치 계산 (Sun.tsx 와 동일한 궤도 왜곡 적용)
            const sunBaseRadius = 15;
            const sunTargetRadius = 50;
            const sunActualRadius = sunBaseRadius + (sunTargetRadius - sunBaseRadius) * zoomProgress;
            const sunP = getSunPosition(time);
            const [sx, sy, sz] = raDecToXYZ(sunP.ra, sunP.dec, sunActualRadius);

            // 3. 태양을 카메라 타겟(중심)으로 설정하여 지구가 태양을 도는 것처럼 연출
            const targetX = sx * zoomProgress;
            const targetY = sy * zoomProgress;
            const targetZ = sz * zoomProgress;

            controlsRef.current.target.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.1);

            // 4. 탑다운(위에서 아래로 내려다보는) 시점 강제 및 드래그 제한
            // 기본(0)에서는 지평선(Math.PI / 2)까지 자유롭지만, 줌아웃(1) 시에는 위에서 내려다보는 좁은 각도(30도 ~ 45도)로 제한
            const baseMinPolar = 0;
            const targetMinPolar = Math.PI / 6; // 30도

            const baseMaxPolar = Math.PI; // 180 (남극까지 허용)
            const targetMaxPolar = Math.PI / 4; // 45도

            const smoothZoom = Math.pow(zoomProgress, 0.5);
            controlsRef.current.minPolarAngle = baseMinPolar + (targetMinPolar - baseMinPolar) * smoothZoom;
            controlsRef.current.maxPolarAngle = baseMaxPolar - (baseMaxPolar - targetMaxPolar) * smoothZoom;
        }
    });

    return (
        <>
            <PerspectiveCamera
                makeDefault
                position={[-1.68, 2.1, -2.23]}
                fov={45}
                near={0.01}
                far={2000}
            />
            <OrbitControls
                ref={controlsRef}
                makeDefault
                enablePan={false}
                enableZoom={true}
                minDistance={1.3}
                maxDistance={90}
                zoomSpeed={1.0}
                dampingFactor={0.08}
                enableDamping
                onStart={onGlobeRotate} // 드래그 시작 시 시간 재생 일시정지
            />
        </>
    );
}

export default function SceneContainer({
    viewMode,
    selectedLocation,
    onLocationSelect,
    time,
    onGlobeRotate,
}: SceneContainerProps) {
    // 태양 위치로부터 조명 방향 계산
    const sunLightPosition = useMemo(() => {
        const sunPos = getSunPosition(time);
        // 큰 반경에서 방향만 중요하므로 R=10 사용
        const [x, y, z] = raDecToXYZ(sunPos.ra, sunPos.dec, 10);
        return [x, y, z] as [number, number, number];
    }, [time]);

    // 태양계 줌아웃 애니메이션 진행도 (0 = 지구 중심 뷰, 1 = 태양계 전체 뷰)
    const [, setIsZoomedOut] = useState(false);
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

                        <OrbitCameraRig
                            zoomProgress={zoomProgress}
                            time={time}
                            onGlobeRotate={onGlobeRotate}
                        />
                    </>
                ) : (
                    <>
                        {/* ── Ground 모드 ── */}
                        <PerspectiveCamera
                            makeDefault
                            fov={70}
                            near={0.1}
                            far={500}
                            rotation={[Math.PI / 9, 0, 0]}
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
