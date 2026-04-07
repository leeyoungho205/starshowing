import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, Euler, Group, TextureLoader, Vector3 } from "three";
import { useLoader } from "@react-three/fiber";
import {
  getMoonPosition,
  getMoonPhaseAngle,
  raDecToXYZ,
} from "../utils/celestialCalc";

// 매 프레임 재사용 인스턴스 (GC 방지)
const _moonMiniVec = new Vector3();
const _moonEuler = new Euler();

interface ConvergenceState {
  t: number;
  tx: number;
  ty: number;
  tz: number;
  rotY: number; // 미니 천구 Y축 회전각 (일주운동)
}

interface MoonProps {
  time: Date;
  celestialRadius: number;
  viewMode?: "orbit" | "ground";
  zoomProgress: number;
  convergenceRef?: React.RefObject<ConvergenceState>;
  miniRadius?: number;
}

/**
 * 달 렌더링 컴포넌트
 * - NASA 달 텍스처 (조명 속성 없는 unlit material)
 * - 위상 표현: 시간에 따라 실시간 변화
 * - 지구 클릭 시 별과 함께 미니 천구로 수렴 (크기 축소 포함)
 */
export default function Moon({
  time,
  celestialRadius,
  viewMode,
  zoomProgress,
  convergenceRef,
  miniRadius = 0.3,
}: MoonProps) {
  const outerGroupRef = useRef<Group>(null);
  const moonTexture = useLoader(TextureLoader, "/textures/moon.webp");

  // 시간에 따른 달의 위상각 계산 (time 변화 시 자동 업데이트)
  const { size, phase, phaseLabel } = useMemo(() => {
    const isOrbit = viewMode === "orbit";
    const baseSz = celestialRadius * 0.015;
    const targetSz = 0.25;
    const sz = isOrbit ? targetSz : baseSz;

    const phaseAngle = getMoonPhaseAngle(time);

    let label = "";
    if (phaseAngle < 22.5 || phaseAngle >= 337.5) label = "🌑 신월";
    else if (phaseAngle < 67.5) label = "🌒 초승달";
    else if (phaseAngle < 112.5) label = "🌓 상현달";
    else if (phaseAngle < 157.5) label = "🌔 볼록달";
    else if (phaseAngle < 202.5) label = "🌕 보름달";
    else if (phaseAngle < 247.5) label = "🌖 기울달";
    else if (phaseAngle < 292.5) label = "🌗 하현달";
    else label = "🌘 그믐달";

    return { size: sz, phase: phaseAngle, phaseLabel: label };
  }, [time, celestialRadius, viewMode]);

  const glowCanvas = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(220, 220, 200, 0.6)");
    gradient.addColorStop(0.3, "rgba(200, 200, 180, 0.2)");
    gradient.addColorStop(1, "rgba(180, 180, 160, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return canvas;
  }, []);

  const labelCanvas = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#E0E0CC";
    ctx.font = "bold 28px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(phaseLabel, 64, 32);
    return canvas;
  }, [phaseLabel]);

  // ── 위상 마스크 계산 ──
  // phase 0°   = 신월 (완전히 어두움)
  // phase 90°  = 상현 (오른쪽 절반 밝음)
  // phase 180° = 보름 (완전히 밝음)
  // phase 270° = 하현 (왼쪽 절반 밝음)
  const shadowRotY = -(phase / 180) * Math.PI;
  // 차오르는 달(0~180°)일 때 반대쪽 절반도 어둡게 처리
  const showSecondHalf = phase < 180;

  // 매 프레임 위치·크기 임퍼러티브 설정 (수렴 애니메이션 반영)
  useFrame(() => {
    if (!outerGroupRef.current) return;

    const isOrbit = viewMode === "orbit";
    const moonTargetRadius = 8;
    const baseRadius = celestialRadius * 0.99;
    const actualRadius = isOrbit
      ? baseRadius + (moonTargetRadius - baseRadius) * zoomProgress
      : baseRadius;

    const moonPos = getMoonPosition(time);
    const [bx, by, bz] = raDecToXYZ(moonPos.ra, moonPos.dec, actualRadius);

    const conv = convergenceRef?.current;
    if (conv && conv.t > 0) {
      // 수렴 중: 미니 천구 위치로 이동 (별과 동일한 Y축 일주운동 적용)
      const [mx, my, mz] = raDecToXYZ(moonPos.ra, moonPos.dec, miniRadius);
      _moonEuler.set(0, conv.rotY * conv.t, 0);
      _moonMiniVec.set(mx, my, mz).applyEuler(_moonEuler);

      outerGroupRef.current.position.set(
        bx + (conv.tx + _moonMiniVec.x - bx) * conv.t,
        by + (conv.ty + _moonMiniVec.y - by) * conv.t,
        bz + (conv.tz + _moonMiniVec.z - bz) * conv.t,
      );

      // 겉보기 등급 ~-12 기준 크기 축소 (태양보다 작고 밝은 별보다 크게)
      const currentSize = isOrbit ? 0.25 : celestialRadius * 0.015;
      const MOON_MINI_SIZE = 0.006;
      outerGroupRef.current.scale.setScalar(
        (currentSize * (1 - conv.t) + MOON_MINI_SIZE * conv.t) / currentSize,
      );
    } else {
      outerGroupRef.current.position.set(bx, by, bz);
      outerGroupRef.current.scale.setScalar(1);
    }
  });

  return (
    <group ref={outerGroupRef}>
      {/* 달 본체 — NASA 텍스처 (조명 속성 없는 unlit material) */}
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial map={moonTexture} />
      </mesh>

      {/* 위상 그림자 1: 기본 반구 (상현↔하현 표현) */}
      <mesh rotation={[0, shadowRotY, 0]}>
        <sphereGeometry args={[size * 1.01, 32, 32, 0, Math.PI]} />
        <meshBasicMaterial
          color="#050510"
          transparent
          opacity={0.97}
          side={DoubleSide}
        />
      </mesh>

      {/* 위상 그림자 2: 차오르는 달일 때 반대쪽 절반도 어둡게 */}
      {showSecondHalf && (
        <mesh rotation={[0, shadowRotY + Math.PI, 0]}>
          <sphereGeometry args={[size * 1.015, 32, 32, 0, Math.PI]} />
          <meshBasicMaterial
            color="#050510"
            transparent
            opacity={0.97}
            side={DoubleSide}
          />
        </mesh>
      )}

      {/* 달 글로우 */}
      <sprite scale={[size * 5, size * 5, 1]}>
        <spriteMaterial
          transparent
          opacity={0.3}
          depthWrite={false}
        >
          <canvasTexture attach="map" image={glowCanvas} />
        </spriteMaterial>
      </sprite>

      {/* 달 위상 라벨 */}
      <sprite position={[0, size * 3, 0]} scale={[size * 4, size * 2, 1]}>
        <spriteMaterial
          transparent
          opacity={0.85}
          depthTest={true}
          depthWrite={false}
        >
          <canvasTexture attach="map" image={labelCanvas} />
        </spriteMaterial>
      </sprite>
    </group>
  );
}
