import { useMemo } from "react";
import { AdditiveBlending } from "three";
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
  const { position, size } = useMemo(() => {
    const isOrbit = viewMode === "orbit";
    const baseRadius = isOrbit ? 18 : celestialRadius;

    // Zoom Out 상태일 때: 지구 밖으로 아득히 멀리 떨어지는 거대한 공간감 연출
    // 기존에는 0(중심)으로 모였으나, 디오라마 느낌을 위해 태양을 가장 멀리(수성~토성 궤도 밖) 배치
    const targetRadius = 150;
    const actualRadius = baseRadius + (targetRadius - baseRadius) * zoomProgress;

    const sunPos = getSunPosition(time);
    const pos = raDecToXYZ(sunPos.ra, sunPos.dec, actualRadius);

    // 디오라마 뷰(zoomProgress > 0)일 때, 거대한 태양이 멀리서도 직관적으로 보이도록 크기를 대폭 과장
    const baseSz = isOrbit ? 1.0 : celestialRadius * 0.025;
    const sz = baseSz + (isOrbit ? 8.0 * zoomProgress : 0);

    return { position: pos, size: sz };
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
    </group>
  );
}
