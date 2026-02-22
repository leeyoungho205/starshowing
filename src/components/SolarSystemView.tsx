import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SolarSystemViewProps {
  setIsZoomedOut: (val: boolean) => void;
  setZoomProgress: (val: number) => void; // 0 = Earth view, 1 = Solar System view
}

export default function SolarSystemView({
  setIsZoomedOut,
  setZoomProgress,
}: SolarSystemViewProps) {

  const orbitsRef = useRef<THREE.Group>(null);

  // No background texture as user wants it clean

  const orbits = <group />;

  useFrame((state) => {
    let cameraDist = state.camera.position.length();
    // Use true distance to target to prevent wild fluctuations as the target moves to the sun
    if ((state as any).controls && (state as any).controls.target) {
      cameraDist = state.camera.position.distanceTo((state as any).controls.target);
    }

    // OrbitControls maxDistance가 90이므로,
    // 카메라 거리가 15.0을 넘어가면서부터 90.0 근처까지 부드럽게 줌아웃 전환 진행.
    let progress = 0;
    if (cameraDist > 15.0) {
      progress = Math.min(1, (cameraDist - 15.0) / 75.0);
    }

    // 부드러운 전환을 위해 easing 적용
    const easedProgress =
      progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

    setIsZoomedOut(progress > 0.05);
    setZoomProgress(easedProgress);

    // deleted background logic

    // 2. 궤도선 투명도 조절
    if (orbitsRef.current) {
      // deleted unused orbit lines logic
    }
  });

  return (
    <group>
      {/* 행성 궤도선 */}
      <group ref={orbitsRef}>{orbits}</group>
    </group>
  );
}
