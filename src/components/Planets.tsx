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
}: PlanetsProps) {
  const planetCanvases = useMemo(() => {
    const dict: Record<
      string,
      { glow: HTMLCanvasElement; label: HTMLCanvasElement }
    > = {};
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

      // 라벨 캔버스
      const labelCanvas = document.createElement("canvas");
      labelCanvas.width = 160;
      labelCanvas.height = 64;
      const lCtx = labelCanvas.getContext("2d")!;
      lCtx.fillStyle = planet.color;
      lCtx.font = "bold 26px Inter, system-ui, sans-serif";
      lCtx.textAlign = "center";
      lCtx.textBaseline = "middle";
      lCtx.fillText(planet.label, 80, 32);

      dict[planet.name] = { glow: glowCanvas, label: labelCanvas };
    });
    return dict;
  }, []);

  const planets = useMemo(() => {
    const isOrbit = viewMode === "orbit";
    // 수성부터 토성까지 다른 거리감을 약간 줌
    const radii = [12, 14, 20, 24, 28];

    return PLANET_INFO.map((info, idx) => {
      const actualRadius = isOrbit ? radii[idx] : celestialRadius;
      const pos = getPlanetPosition(info.body, time);
      const xyz = raDecToXYZ(pos.ra, pos.dec, actualRadius);

      const baseSize = isOrbit ? 0.35 : celestialRadius * 0.01;
      return {
        ...info,
        position: xyz as [number, number, number],
        size: baseSize * info.sizeScale,
      };
    });
  }, [time, celestialRadius, viewMode]);

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
              <canvasTexture
                attach="map"
                image={planetCanvases[planet.name].glow}
              />
            </spriteMaterial>
          </sprite>

          {/* 라벨 */}
          <sprite
            position={[0, planet.size * 3.5, 0]}
            scale={[planet.size * 5, planet.size * 2, 1]}
          >
            <spriteMaterial transparent opacity={0.85} depthTest={false}>
              <canvasTexture
                attach="map"
                image={planetCanvases[planet.name].label}
              />
            </spriteMaterial>
          </sprite>
        </group>
      ))}
    </>
  );
}
