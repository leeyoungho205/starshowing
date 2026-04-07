import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Euler, Group, Vector3 } from "three";
import * as THREE from "three";
import { getSunPosition, raDecToXYZ } from "../utils/celestialCalc";

// 매 프레임 재사용 인스턴스 (GC 방지)
const _sunMiniVec = new Vector3();
const _sunEuler = new Euler();

interface ConvergenceState {
  t: number;
  tx: number;
  ty: number;
  tz: number;
  rotY: number; // 미니 천구 Y축 회전각 (일주운동)
}

interface SunProps {
  time: Date;
  celestialRadius: number;
  viewMode?: "orbit" | "ground";
  zoomProgress: number;
  convergenceRef?: React.RefObject<ConvergenceState>;
  miniRadius?: number;
}

/**
 * 태양 렌더링 컴포넌트
 * - 밝은 노란색 구체 + 다중 글로우 레이어
 * - 지구 클릭 시 별과 함께 미니 천구로 수렴 (크기 축소 포함)
 */
export default function Sun({
  time,
  celestialRadius,
  viewMode,
  zoomProgress,
  convergenceRef,
  miniRadius = 0.3,
}: SunProps) {
  const outerGroupRef = useRef<Group>(null);

  const { size, earthOrbitGeometry } = useMemo(() => {
    const isOrbit = viewMode === "orbit";
    const sz = isOrbit ? 1.0 + 5.0 * zoomProgress : 1.0;

    const sunTargetRadius = 60;
    const points = [];
    if (isOrbit) {
      const d = new Date(time.getTime());
      d.setMonth(0, 1);
      for (let i = 0; i <= 365; i++) {
        const sp = getSunPosition(d);
        const p = raDecToXYZ(sp.ra, sp.dec, sunTargetRadius);
        points.push(new THREE.Vector3(-p[0], -p[1], -p[2]));
        d.setDate(d.getDate() + 1);
      }
    }
    const earthOrbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    return { size: sz, earthOrbitGeometry };
  }, [time, viewMode, zoomProgress]);

  const innerGlowCanvas = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255, 255, 200, 1)");
    gradient.addColorStop(0.15, "rgba(255, 240, 150, 0.8)");
    gradient.addColorStop(0.4, "rgba(255, 200, 80, 0.3)");
    gradient.addColorStop(1, "rgba(255, 180, 50, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return canvas;
  }, []);

  const outerGlowCanvas = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255, 230, 150, 0.6)");
    gradient.addColorStop(0.3, "rgba(255, 200, 100, 0.2)");
    gradient.addColorStop(1, "rgba(255, 180, 50, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return canvas;
  }, []);

  // 매 프레임 위치·크기 임퍼러티브 설정 (수렴 애니메이션 반영)
  useFrame(() => {
    if (!outerGroupRef.current) return;

    const isOrbit = viewMode === "orbit";
    const sunTargetRadius = 60;
    const actualRadius = isOrbit ? sunTargetRadius : celestialRadius;

    const sunPos = getSunPosition(time);
    const [bx, by, bz] = raDecToXYZ(sunPos.ra, sunPos.dec, actualRadius);

    const conv = convergenceRef?.current;
    if (conv && conv.t > 0) {
      // 수렴 중: 미니 천구 위치로 이동 (별과 동일한 Y축 일주운동 적용)
      const [mx, my, mz] = raDecToXYZ(sunPos.ra, sunPos.dec, miniRadius);
      _sunEuler.set(0, conv.rotY * conv.t, 0);
      _sunMiniVec.set(mx, my, mz).applyEuler(_sunEuler);

      outerGroupRef.current.position.set(
        bx + (conv.tx + _sunMiniVec.x - bx) * conv.t,
        by + (conv.ty + _sunMiniVec.y - by) * conv.t,
        bz + (conv.tz + _sunMiniVec.z - bz) * conv.t,
      );

      // 겉보기 등급 -26.7 기준 크기 축소 (밝은 별보다 크게)
      const currentSize = isOrbit ? 1.0 + 5.0 * zoomProgress : 1.0;
      const SUN_MINI_SIZE = 0.009;
      outerGroupRef.current.scale.setScalar(
        (currentSize * (1 - conv.t) + SUN_MINI_SIZE * conv.t) / currentSize,
      );
    } else {
      outerGroupRef.current.position.set(bx, by, bz);
      outerGroupRef.current.scale.setScalar(1);
    }
  });

  return (
    <group ref={outerGroupRef}>
      {/* 태양 본체 */}
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color="#FFF8E1" />
      </mesh>

      {/* 글로우 레이어 1 - 내부 글로우 */}
      <sprite scale={[size * 6, size * 6, 1]}>
        <spriteMaterial
          transparent
          opacity={0.7}
          blending={AdditiveBlending}
          depthWrite={false}
        >
          <canvasTexture attach="map" image={innerGlowCanvas} />
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
          <canvasTexture attach="map" image={outerGlowCanvas} />
        </spriteMaterial>
      </sprite>

      {/* 태양계 뷰 전용: 지구의 공전 궤도선 */}
      {viewMode === "orbit" && (
        <line>
          <lineBasicMaterial
            attach="material"
            color="#4facfe"
            transparent
            opacity={zoomProgress * 0.35}
            depthWrite={false}
          />
          <primitive attach="geometry" object={earthOrbitGeometry} />
        </line>
      )}
    </group>
  );
}
