import { useMemo } from "react";
import { AdditiveBlending } from "three";
import * as THREE from "three";
import { getSunPosition, raDecToXYZ } from "../utils/celestialCalc";

interface SunProps {
  time: Date;
  celestialRadius: number;
  viewMode?: "orbit" | "ground";
  zoomProgress: number;
}

/**
 * 태양 렌더링 컴포넌트
 * - 밝은 노란색 구체 + 다중 글로우 레이어
 * - 천구 반지름 위에 배치
 * - 시간에 따라 위치 변경
 */
export default function Sun({
  time,
  celestialRadius,
  viewMode,
  zoomProgress,
}: SunProps) {
  const { position, size, earthOrbitGeometry } = useMemo(() => {
    const isOrbit = viewMode === "orbit";

    // 태양계 모드에서는 크기 과장 (너무 커서 어색하지 않게 적당한 크기 6배 수준으로)
    const sz = isOrbit ? 1.0 + 5.0 * zoomProgress : 1.0;

    // 태양계를 쾌적하게 한눈에 보기 위한 태양 거리 (60)
    const sunTargetRadius = 60;
    const actualRadius = isOrbit ? sunTargetRadius : celestialRadius;

    const sunPos = getSunPosition(time);
    const pos = raDecToXYZ(sunPos.ra, sunPos.dec, actualRadius);

    // 완벽한 지구 공전 궤도선 (태양 중심 기준)
    // 태양의 적위(Declination) 때문에 태양은 XZ 평면에 있지 않습니다.
    // 궤도선이 정확히 지구(0,0,0)를 지나가게 하려면 단순한 2D 타원이 아니라, 1년치 상대 궤적을 3D로 그려야 합니다.
    const points = [];
    if (isOrbit) {
      const d = new Date(time.getTime());
      // 올해 기준으로 1년(365일) 궤적을 전부 계산
      d.setMonth(0, 1);
      for (let i = 0; i <= 365; i++) {
        const sp = getSunPosition(d);
        const p = raDecToXYZ(sp.ra, sp.dec, sunTargetRadius);
        // 지구 입장에서 태양의 위치가 p라면, 태양 입장에서 지구의 위치는 -p 입니다.
        points.push(new THREE.Vector3(-p[0], -p[1], -p[2]));
        d.setDate(d.getDate() + 1);
      }
    }
    const earthOrbitGeometry = new THREE.BufferGeometry().setFromPoints(points);

    return { position: pos, size: sz, earthOrbitGeometry };
  }, [time, celestialRadius, viewMode, zoomProgress]);

  // ── 캔버스 텍스처 캐싱 (1회 생성) ──
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

  return (
    <group position={position}>
      {/* 태양 본체 */}
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color="#FFF8E1" transparent opacity={1} />
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

      {/* 태양계 뷰 전용: 지구의 공전 궤도선 (태양 중심, 완벽한 3D 궤적) */}
      {viewMode === "orbit" && (
        <line>
          <lineBasicMaterial attach="material" color="#4facfe" transparent opacity={zoomProgress * 0.35} depthWrite={false} />
          <primitive attach="geometry" object={earthOrbitGeometry} />
        </line>
      )}
    </group>
  );
}
