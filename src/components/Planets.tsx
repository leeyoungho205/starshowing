import { useMemo } from "react";
import { AdditiveBlending } from "three";
import {
  getPlanetPosition,
  raDecToXYZ,
  PLANET_INFO,
} from "../utils/celestialCalc";

interface PlanetsProps {
  time: Date;
  celestialRadius: number;
  viewMode?: "orbit" | "ground";
  zoomProgress: number;
}

/**
 * 행성 렌더링 컴포넌트
 * - 수성, 금성, 화성, 목성, 토성을 천구에 배치
 * - 행성별 고유 색상과 글로우 효과
 */
export default function Planets({
  time,
  celestialRadius,
  viewMode,
  zoomProgress,
}: PlanetsProps) {
  const planetCanvases = useMemo(() => {
    const dict: Record<string, HTMLCanvasElement> = {};
    PLANET_INFO.forEach((planet) => {
      // 글로우 캔버스
      const glowCanvas = document.createElement("canvas");
      glowCanvas.width = 64;
      glowCanvas.height = 64;
      const gCtx = glowCanvas.getContext("2d")!;
      const gradient = gCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, planet.glowColor + "CC");
      gradient.addColorStop(0.3, planet.glowColor + "44");
      gradient.addColorStop(1, planet.glowColor + "00");
      gCtx.fillStyle = gradient;
      gCtx.fillRect(0, 0, 64, 64);

      dict[planet.name] = glowCanvas;
    });
    return dict;
  }, []);

  const planets = useMemo(() => {
    const isOrbit = viewMode === "orbit";
    return PLANET_INFO.map((info, idx) => {
      const pos = getPlanetPosition(info.body, time);

      // 기본 반지름 (천구 표면용 / 궤도 모드 과장용)
      const baseRadius = isOrbit ? [12, 14, 20, 24, 28][idx] : celestialRadius;

      // 태양계 보기 시 실제 궤도 반지름 (SolarSystemView의 궤도선과 일치하도록 매핑)
      const targetRadius = [12, 14, 20, 24, 28][idx];

      // 선형 보간 (0일 땐 지구 곁, 1일 땐 분산된 태양계 궤도 반경)
      const actualRadius =
        baseRadius + (targetRadius - baseRadius) * zoomProgress;

      const xyz = raDecToXYZ(pos.ra, pos.dec, actualRadius);

      // 크기 조절: 태양계 확대 시에는 기본 행성보다 작게(또는 유지)하여 스케일감 부여
      const baseSize = isOrbit
        ? 0.05 * (1 - zoomProgress * 0.5)
        : celestialRadius * 0.003;
      // 거리에 반비례하여 크기 계산 (가까울수록 크게) - 1 / sqrt(AU_거리)
      const distScale = Math.max(0.4, Math.min(1.8, 1 / Math.sqrt(pos.dist)));

      return {
        ...info,
        position: xyz as [number, number, number],
        size: baseSize * info.sizeScale * distScale,
      };
    });
  }, [time, celestialRadius, viewMode, zoomProgress]);

  return (
    <>
      {planets.map((planet) => (
        <group key={planet.name} position={planet.position}>
          {/* 행성 본체 */}
          <mesh>
            <sphereGeometry args={[planet.size, 12, 12]} />
            <meshBasicMaterial color={planet.color} />
          </mesh>

          {/* 글로우 */}
          <sprite scale={[planet.size * 6, planet.size * 6, 1]}>
            <spriteMaterial
              transparent
              opacity={0.5}
              depthWrite={false}
              blending={AdditiveBlending}
            >
              <canvasTexture attach="map" image={planetCanvases[planet.name]} />
            </spriteMaterial>
          </sprite>
        </group>
      ))}
    </>
  );
}
