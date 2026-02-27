import { useRef } from "react";
import { type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Group } from "three";
import CountryBorders from "./CountryBorders";
import CityLabels from "./CityLabels";
import { computeLMST } from "../utils/celestialCalc";

interface EarthProps {
  selectedLocation: { lat: number; lon: number } | null;
  onSelect: (loc: { lat: number; lon: number }) => void;
  viewMode: "orbit" | "ground";
  time: Date;
  zoomProgress: number;
}

/**
 * 고화질 지구본 컴포넌트
 * NASA Blue Marble 고해상도 텍스처 + 국가 경계선 + 도시 라벨
 */
export default function Earth({
  selectedLocation,
  onSelect,
  viewMode,
  time,
  zoomProgress,
}: EarthProps) {
  const groupRef = useRef<Group>(null);
  const EARTH_RADIUS = 1;

  /**
   * 고해상도 텍스처 로드 (NASA Blue Marble 5400x2700)
   */
  const dayMap = useTexture("/textures/earth-day-hires.webp");

  const latLonToVector3 = (
    lat: number,
    lon: number,
    radius: number,
  ): [number, number, number] => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return [x, y, z];
  };

  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    pointerDownPos.current = { x: e.screenX, y: e.screenY };
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (viewMode !== "orbit") return;
    if (zoomProgress > 0.05) return; // 태양계 뷰 상태에서는 클릭(미니 천구 수렴) 무시

    if (pointerDownPos.current) {
      const dx = e.screenX - pointerDownPos.current.x;
      const dy = e.screenY - pointerDownPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 10) return;
    }

    e.stopPropagation();

    const point = e.point.clone();
    if (groupRef.current) {
      groupRef.current.worldToLocal(point);
    }
    const normalized = point.normalize();

    const phi = Math.acos(Math.max(-1, Math.min(1, normalized.y)));
    const theta = Math.atan2(normalized.z, -normalized.x);

    const lat = 90 - (phi * 180) / Math.PI;
    const lon = (((theta * 180) / Math.PI + 360) % 360) - 180;

    onSelect({ lat, lon });
  };

  // 선택된 순간의 시간을 처음 한 번만 기억하여 지구 자전을 멈춥니다.
  // 이렇게 하면 플레이 중에 다른 위치를 클릭해도 지구본의 모습(각도)이 변하지 않습니다.
  const frozenTimeRef = useRef<number | null>(null);
  const prevSelLocRef = useRef<{ lat: number; lon: number } | null>(null);

  if (selectedLocation) {
    if (frozenTimeRef.current === null) {
      frozenTimeRef.current = time.getTime();
    }
    prevSelLocRef.current = selectedLocation;
  } else {
    frozenTimeRef.current = null;
    prevSelLocRef.current = null;
  }

  const effectiveTime = frozenTimeRef.current ? new Date(frozenTimeRef.current) : time;
  const gmstRad = computeLMST(effectiveTime, 0) * (Math.PI / 180);

  return (
    <group ref={groupRef} rotation={[0, gmstRad - Math.PI / 2, 0]}>
      {/* ── 지구 본체 (고해상도 NASA Blue Marble) ── */}
      <mesh onClick={handleClick} onPointerDown={handlePointerDown}>
        <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
        <meshStandardMaterial map={dayMap} roughness={0.8} metalness={0} />
      </mesh>

      {/* ── 줌아웃이 아닐 때만 렌더링 (최적화) ── */}
      {zoomProgress < 0.05 && (
        <>
          {/* ── 국가 경계선 (Natural Earth GeoJSON) ── */}
          <CountryBorders radius={EARTH_RADIUS} />

          {/* ── 도시/국가 라벨 ── */}
          <CityLabels radius={EARTH_RADIUS} />

          {/* ── 선택된 위치 마커 ── */}
          {selectedLocation && (
            <group
              position={latLonToVector3(
                selectedLocation.lat,
                selectedLocation.lon,
                EARTH_RADIUS,
              )}
            >
              <mesh>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshBasicMaterial
                  color="#4488ff"
                  wireframe={true}
                  transparent={true}
                  opacity={0.25}
                  depthTest={true}
                  polygonOffset={true}
                  polygonOffsetFactor={-1}
                />
              </mesh>
            </group>
          )}
        </>
      )}
    </group>
  );
}
