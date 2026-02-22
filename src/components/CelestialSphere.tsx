import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Group,
  BufferGeometry,
  LineSegments,
  LineBasicMaterial,
  Float32BufferAttribute,
  Mesh,
  Euler,
  Quaternion,
  MeshBasicMaterial,
  Vector3,
} from "three";
import { STARS, CONSTELLATIONS } from "../data/stars";
import Sun from "./Sun";
import Moon from "./Moon";
import Planets from "./Planets";
import { computeLMST } from "../utils/celestialCalc";

interface CelestialSphereProps {
  viewMode: "orbit" | "ground";
  selectedLocation: { lat: number; lon: number } | null;
  time: Date;
  zoomProgress?: number;
}

function raDecToXYZ(
  ra: number,
  dec: number,
  R: number,
): [number, number, number] {
  const raRad = ra * 15 * (Math.PI / 180);
  const decRad = dec * (Math.PI / 180);
  return [
    R * Math.cos(decRad) * Math.sin(raRad),
    R * Math.sin(decRad),
    R * Math.cos(decRad) * Math.cos(raRad),
  ];
}

function latLonToXYZ(
  lat: number,
  lon: number,
  R: number,
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -(R * Math.sin(phi) * Math.cos(theta)),
    R * Math.cos(phi),
    R * Math.sin(phi) * Math.sin(theta),
  ];
}

// 매 프레임 재사용을 위한 수학 인스턴스 (GC 오버헤드 방지)
const _targetVec = new Vector3();
const _eulerY = new Euler();
const _rotM = new Vector3();
const _rotSM = new Vector3();
const _rotEM = new Vector3();

/**
 * 천구 컴포넌트
 * - orbit 모드: 별자리를 큰 천구에 표시, 클릭 위치로 수렴 애니메이션
 * - ground 모드: 관측자 중심으로 천구를 LMST 기반으로 회전 표시
 */
export default function CelestialSphere({
  viewMode,
  selectedLocation,
  time,
  zoomProgress = 0,
}: CelestialSphereProps) {
  const groupRef = useRef<Group>(null);
  const starMeshRefs = useRef<(Mesh | null)[]>([]);
  const animState = useRef({ progress: 0, isAnimating: false });
  const prevLocation = useRef<{ lat: number; lon: number } | null>(null);

  const CELESTIAL_RADIUS = 100;
  const MINI_RADIUS = 0.2;

  useEffect(() => {
    if (
      viewMode === "orbit" &&
      selectedLocation &&
      (!prevLocation.current ||
        prevLocation.current.lat !== selectedLocation.lat ||
        prevLocation.current.lon !== selectedLocation.lon)
    ) {
      prevLocation.current = selectedLocation;
      animState.current = { progress: 0, isAnimating: true };
    }
  }, [selectedLocation, viewMode]);

  // orbit 모드로 복귀 시 별 위치 리셋
  useEffect(() => {
    if (viewMode === "orbit") {
      // 별들을 원래 위치로 되돌림
      for (let i = 0; i < STARS.length; i++) {
        const mesh = starMeshRefs.current[i];
        if (!mesh) continue;
        const [ox, oy, oz] = starOriginals[i];
        mesh.position.set(ox, oy, oz);
        mesh.scale.setScalar(1);
      }
      // constellation lines도 원래 위치로
      const geom = linesMesh.geometry;
      if (geom) {
        const posAttr = geom.attributes.position as Float32BufferAttribute;
        const arr = posAttr.array as Float32Array;
        linePairs.forEach(([si, ei], idx) => {
          const [sox, soy, soz] = starOriginals[si];
          const [eox, eoy, eoz] = starOriginals[ei];
          const off = idx * 6;
          arr[off] = sox;
          arr[off + 1] = soy;
          arr[off + 2] = soz;
          arr[off + 3] = eox;
          arr[off + 4] = eoy;
          arr[off + 5] = eoz;
        });
        posAttr.needsUpdate = true;
        geom.computeBoundingSphere();
      }
      // group 회전 리셋
      if (groupRef.current) {
        groupRef.current.rotation.set(0, 0, 0);
        groupRef.current.position.set(0, 0, 0);
      }
      // Re-trigger convergence if location is selected
      if (selectedLocation) {
        animState.current = { progress: 0, isAnimating: true };
      }
    }
  }, [viewMode]);

  const starOriginals = useMemo(() => {
    return STARS.map((s) => raDecToXYZ(s.ra, s.dec, CELESTIAL_RADIUS));
  }, []);

  const starSizes = useMemo(() => {
    return STARS.map((s) => {
      if (s.mag < 0) return 0.6;
      if (s.mag < 1) return 0.45;
      if (s.mag < 2) return 0.32;
      if (s.mag < 3) return 0.22;
      return 0.15;
    });
  }, []);

  const nameToIdx = useMemo(() => {
    const map = new Map<string, number>();
    STARS.forEach((s, i) => map.set(s.name, i));
    return map;
  }, []);

  const linePairs = useMemo(() => {
    const pairs: [number, number][] = [];
    CONSTELLATIONS.forEach((c) => {
      c.lines.forEach(([s, e]) => {
        const si = nameToIdx.get(s);
        const ei = nameToIdx.get(e);
        if (si !== undefined && ei !== undefined) pairs.push([si, ei]);
      });
    });
    return pairs;
  }, [nameToIdx]);

  const linesMesh = useMemo(() => {
    const verts = new Float32Array(linePairs.length * 6);
    linePairs.forEach(([si, ei], idx) => {
      const s = starOriginals[si];
      const e = starOriginals[ei];
      const off = idx * 6;
      verts[off] = s[0];
      verts[off + 1] = s[1];
      verts[off + 2] = s[2];
      verts[off + 3] = e[0];
      verts[off + 4] = e[1];
      verts[off + 5] = e[2];
    });
    const geom = new BufferGeometry();
    geom.setAttribute("position", new Float32BufferAttribute(verts, 3));
    const mat = new LineBasicMaterial({
      color: "#4488ff",
      transparent: true,
      opacity: 0.35,
    });
    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `
#include <common>
                varying vec3 vWorldPosition;
`,
        )
        .replace(
          "#include <begin_vertex>",
          `
#include <begin_vertex>
vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
`,
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `
#include <common>
                varying vec3 vWorldPosition;
`,
        )
        .replace(
          "#include <dithering_fragment>",
          `
#include <dithering_fragment>
if (vWorldPosition.y < 0.0) {
    gl_FragColor = vec4(gl_FragColor.rgb, gl_FragColor.a * 0.15);
}
`,
        );
    };
    return new LineSegments(geom, mat);
  }, [linePairs, starOriginals]);

  // ── 별 머티리얼 공유 ಕ್ಯಾ싱 (셰이더 재컴파일 방지) ──
  const starMaterials = useMemo(() => {
    const createStarMaterial = (opacity: number) => {
      const mat = new MeshBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity,
      });
      mat.onBeforeCompile = (shader) => {
        shader.vertexShader = shader.vertexShader
          .replace(
            "#include <common>",
            `
                    #include <common>
                    varying vec3 vWorldPosition;
                    `,
          )
          .replace(
            "#include <begin_vertex>",
            `
                    #include <begin_vertex>
                    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                    `,
          );
        shader.fragmentShader = shader.fragmentShader
          .replace(
            "#include <common>",
            `
                    #include <common>
                    varying vec3 vWorldPosition;
                    `,
          )
          .replace(
            "#include <dithering_fragment>",
            `
                    #include <dithering_fragment>
                    if (vWorldPosition.y < 0.0) {
                        gl_FragColor = vec4(gl_FragColor.rgb, gl_FragColor.a * 0.15);
                    }
                    `,
          );
      };
      return mat;
    };

    return {
      bright: createStarMaterial(0.95),
      medium: createStarMaterial(0.8),
      dim: createStarMaterial(0.6),
    };
  }, []);

  const getStarMaterial = (mag: number) => {
    if (mag < 1) return starMaterials.bright;
    if (mag < 2) return starMaterials.medium;
    return starMaterials.dim;
  };

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    // 별 투명도 조절 (줌아웃 시 서서히 투명하게)
    const starOpacityFactor = Math.max(0, 1 - zoomProgress * 1.5);
    (starMaterials.bright as any).opacity = 0.95 * starOpacityFactor;
    (starMaterials.medium as any).opacity = 0.8 * starOpacityFactor;
    (starMaterials.dim as any).opacity = 0.6 * starOpacityFactor;

    // 별자리 선 투명도 조절 (궤도 모드일 때 조금 더 진하게, 줌아웃 시 완전히 투명하게)
    const linesMat = linesMesh.material as LineBasicMaterial;
    const baseLinesOpacity = viewMode === "orbit" ? 0.4 : 0.1;
    linesMat.opacity = baseLinesOpacity * starOpacityFactor;
    linesMesh.visible = starOpacityFactor > 0.01;

    // 개별 별 mesh에 대해서도 완전히 투명해지면 렌더링을 끕니다
    for (let i = 0; i < STARS.length; i++) {
      if (starMeshRefs.current[i]) {
        starMeshRefs.current[i]!.visible = starOpacityFactor > 0.01;
      }
    }

    if (viewMode === "ground" && selectedLocation) {
      // ── Ground 모드: 천구를 LMST 기반으로 회전 ──
      // 관측자는 원점(0,0,0)에 있고 천구가 관측자 주위를 감쌈
      // 좌표계: Y=위(천정), Z=남(-Z=북), X=서(-X=동)

      const latRad = selectedLocation.lat * (Math.PI / 180);
      const lmstDeg = computeLMST(time, selectedLocation.lon);
      const lmstRad = lmstDeg * (Math.PI / 180);

      // 천구 회전:
      // 1. 천구의 적도좌표계에서 RA=0이 -Z(북) 방향을 향하고 있음
      // 2. LMST만큼 Y축으로 회전 (시간에 따른 일주운동)
      // 3. 위도만큼 X축으로 기울임 (관측자의 위도 → 천구 경사)

      // 그룹 회전을 쿼터니언으로 설정
      const q = new Quaternion();

      // Step 1: 위도 기반 기울임 (적도가 위도만큼 기울어짐)
      // 천구의 북극이 지평면에서 위도만큼 높이 올라감
      const latTilt = new Quaternion().setFromEuler(
        new Euler(-(Math.PI / 2 - latRad), 0, 0),
      );

      // Step 2: LMST 기반 회전 (시간에 따른 일주운동)
      const siderealRot = new Quaternion().setFromEuler(
        new Euler(0, -lmstRad, 0),
      );

      q.copy(latTilt).multiply(siderealRot);
      groupRef.current.quaternion.copy(q);
      groupRef.current.position.set(0, 0, 0);

      // 별들을 원래 천구 위치로 복원 (수렴 애니메이션 중이 아닌 경우)
      for (let i = 0; i < STARS.length; i++) {
        const mesh = starMeshRefs.current[i];
        if (!mesh) continue;
        const [ox, oy, oz] = starOriginals[i];
        mesh.position.set(ox, oy, oz);
        mesh.scale.setScalar(1);
      }

      // constellation lines도 원래 위치로
      const geom = linesMesh.geometry;
      if (geom) {
        const posAttr = geom.attributes.position as Float32BufferAttribute;
        const arr = posAttr.array as Float32Array;
        linePairs.forEach(([si, ei], idx) => {
          const [sox, soy, soz] = starOriginals[si];
          const [eox, eoy, eoz] = starOriginals[ei];
          const off = idx * 6;
          arr[off] = sox;
          arr[off + 1] = soy;
          arr[off + 2] = soz;
          arr[off + 3] = eox;
          arr[off + 4] = eoy;
          arr[off + 5] = eoz;
        });
        posAttr.needsUpdate = true;
      }

      return;
    }

    // ── Orbit 모드 ──
    groupRef.current.rotation.y = 0;

    // 별 수렴 애니메이션 및 위경도 위치 추적
    if (selectedLocation) {
      const anim = animState.current;
      if (anim.isAnimating) {
        anim.progress = Math.min(anim.progress + delta * 0.8, 1);
        if (anim.progress >= 1) anim.isAnimating = false;
      }

      const p = anim.progress;
      const t = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

      // Earth.tsx와 동일하게 현재 시각 기반 자전 각도 계산
      const gmstDeg = computeLMST(time, 0);
      const gmstRad = gmstDeg * (Math.PI / 180);
      const earthRotY = gmstRad - Math.PI / 2;

      _eulerY.set(0, earthRotY, 0);

      // 선택된 위치(위경도)를 로컬 좌표로 변환 후 Earth의 현재 자전 각도 반영
      const [rawTx, rawTy, rawTz] = latLonToXYZ(
        selectedLocation.lat,
        selectedLocation.lon,
        1.0,
      );
      _targetVec.set(rawTx, rawTy, rawTz).applyEuler(_eulerY);
      const tx = _targetVec.x;
      const ty = _targetVec.y;
      const tz = _targetVec.z;

      for (let i = 0; i < STARS.length; i++) {
        const mesh = starMeshRefs.current[i];
        if (!mesh) continue;
        const [ox, oy, oz] = starOriginals[i];
        const [mx, my, mz] = raDecToXYZ(STARS[i].ra, STARS[i].dec, MINI_RADIUS);

        // 미니 천구 내부의 별들도 지구 자전에 맞춰 함께 회전 (교육용 효과)
        _rotM.set(mx, my, mz).applyEuler(_eulerY);

        mesh.position.set(
          ox + (tx + _rotM.x - ox) * t,
          oy + (ty + _rotM.y - oy) * t,
          oz + (tz + _rotM.z - oz) * t,
        );
        const origSize = starSizes[i];
        const miniSize =
          STARS[i].mag < 1 ? 0.003 : STARS[i].mag < 2 ? 0.0022 : 0.0015;
        mesh.scale.setScalar((origSize * (1 - t) + miniSize * t) / origSize);
      }

      const geom = linesMesh.geometry;
      if (geom) {
        const posAttr = geom.attributes.position as Float32BufferAttribute;
        const arr = posAttr.array as Float32Array;
        linePairs.forEach(([si, ei], idx) => {
          const [sox, soy, soz] = starOriginals[si];
          const [eox, eoy, eoz] = starOriginals[ei];
          const [smx, smy, smz] = raDecToXYZ(
            STARS[si].ra,
            STARS[si].dec,
            MINI_RADIUS,
          );
          const [emx, emy, emz] = raDecToXYZ(
            STARS[ei].ra,
            STARS[ei].dec,
            MINI_RADIUS,
          );

          _rotSM.set(smx, smy, smz).applyEuler(_eulerY);
          _rotEM.set(emx, emy, emz).applyEuler(_eulerY);

          const off = idx * 6;
          arr[off] = sox + (tx + _rotSM.x - sox) * t;
          arr[off + 1] = soy + (ty + _rotSM.y - soy) * t;
          arr[off + 2] = soz + (tz + _rotSM.z - soz) * t;
          arr[off + 3] = eox + (tx + _rotEM.x - eox) * t;
          arr[off + 4] = eoy + (ty + _rotEM.y - eoy) * t;
          arr[off + 5] = eoz + (tz + _rotEM.z - eoz) * t;
        });
        posAttr.needsUpdate = true;
        geom.computeBoundingSphere();
      }
    }
  });

  return (
    <group ref={groupRef}>
      {starOriginals.map((pos, i) => (
        <mesh
          key={i}
          position={pos}
          ref={(el) => {
            starMeshRefs.current[i] = el;
          }}
          material={getStarMaterial(STARS[i].mag)}
        >
          <sphereGeometry args={[starSizes[i], 6, 6]} />
        </mesh>
      ))}
      <primitive object={linesMesh} />

      {/* ── 태양 ── */}
      <Sun
        time={time}
        celestialRadius={CELESTIAL_RADIUS}
        viewMode={viewMode}
        zoomProgress={zoomProgress}
      />

      {/* ── 달 ── */}
      <Moon
        time={time}
        celestialRadius={CELESTIAL_RADIUS}
        viewMode={viewMode}
        zoomProgress={zoomProgress}
      />

      {/* ── 행성 ── */}
      <Planets
        time={time}
        celestialRadius={CELESTIAL_RADIUS}
        viewMode={viewMode}
        zoomProgress={zoomProgress}
      />
    </group>
  );
}
