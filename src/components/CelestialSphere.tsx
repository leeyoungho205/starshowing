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
  const animState = useRef<{ progress: number; isAnimating: boolean; fixedTarget?: Vector3; frozenEarthRotY?: number }>({ progress: 0, isAnimating: false });
  const prevLocation = useRef<{ lat: number; lon: number } | null>(null);

  // ground 모드 여부를 셰이더에 전달하는 uniform (1.0 = ground, 0.0 = orbit)
  // → ground 모드에서만 지평선 아래 별/선을 희미하게 처리 (남반구 별 정상 표시)
  const groundModeUniform = useRef<{ value: number }>({ value: 0.0 });

  // 태양·달 수렴 애니메이션 상태 공유 ref
  // rotY: 미니 천구 Y축 회전각 (= -earthRotY, 시간 재생 시 일주운동)
  const convergenceRef = useRef<{
    t: number; tx: number; ty: number; tz: number; rotY: number;
  }>({ t: 0, tx: 0, ty: 0, tz: 0, rotY: 0 });

  const CELESTIAL_RADIUS = 100;
  const MINI_RADIUS = 0.3;

  // 선택된 순간의 시간을 처음 한 번만 기억하여 타겟 위치를 지구 표면에 고정
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

  useEffect(() => {
    if (
      viewMode === "orbit" &&
      selectedLocation &&
      (!prevLocation.current ||
        prevLocation.current.lat !== selectedLocation.lat ||
        prevLocation.current.lon !== selectedLocation.lon)
    ) {
      prevLocation.current = selectedLocation;
      animState.current = { progress: 0, isAnimating: true, fixedTarget: undefined };
    }
  }, [selectedLocation, viewMode]);

  // orbit 모드로 복귀 시 별 위치 리셋
  useEffect(() => {
    if (viewMode === "orbit") {
      for (let i = 0; i < STARS.length; i++) {
        const mesh = starMeshRefs.current[i];
        if (!mesh) continue;
        const [ox, oy, oz] = starOriginals[i];
        mesh.position.set(ox, oy, oz);
        mesh.scale.setScalar(1);
      }
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
      if (groupRef.current) {
        groupRef.current.rotation.set(0, 0, 0);
        groupRef.current.position.set(0, 0, 0);
      }
      if (selectedLocation) {
        animState.current = { progress: 0, isAnimating: true, fixedTarget: undefined };
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
    // ground 모드에서만 지평선 아래(y<0) 선을 희미하게 처리
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uGroundMode = groundModeUniform.current;
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
                uniform float uGroundMode;
`,
        )
        .replace(
          "#include <dithering_fragment>",
          `
#include <dithering_fragment>
if (uGroundMode > 0.5 && vWorldPosition.y < 0.0) {
    gl_FragColor = vec4(gl_FragColor.rgb, gl_FragColor.a * 0.15);
}
`,
        );
    };
    return new LineSegments(geom, mat);
  }, [linePairs, starOriginals]);

  // ── 별 머티리얼 공유 캐싱 (셰이더 재컴파일 방지) ──
  const starMaterials = useMemo(() => {
    const createStarMaterial = (opacity: number) => {
      const mat = new MeshBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity,
      });
      // ground 모드에서만 지평선 아래(y<0) 별을 희미하게 처리
      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uGroundMode = groundModeUniform.current;
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
                    uniform float uGroundMode;
                    `,
          )
          .replace(
            "#include <dithering_fragment>",
            `
                    #include <dithering_fragment>
                    if (uGroundMode > 0.5 && vWorldPosition.y < 0.0) {
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

    // 별자리 선 투명도 조절
    const linesMat = linesMesh.material as LineBasicMaterial;
    const baseLinesOpacity = viewMode === "orbit" ? 0.4 : 0.1;
    linesMat.opacity = baseLinesOpacity * starOpacityFactor;
    linesMesh.visible = starOpacityFactor > 0.01;

    // 개별 별 가시성
    for (let i = 0; i < STARS.length; i++) {
      if (starMeshRefs.current[i]) {
        starMeshRefs.current[i]!.visible = starOpacityFactor > 0.01;
      }
    }

    // ground 모드 uniform 업데이트 (지평선 아래 별 페이드 제어)
    groundModeUniform.current.value = viewMode === "ground" ? 1.0 : 0.0;

    if (viewMode === "ground" && selectedLocation) {
      // ── Ground 모드: 천구를 LMST 기반으로 회전 ──
      const latRad = selectedLocation.lat * (Math.PI / 180);
      const lmstDeg = computeLMST(time, selectedLocation.lon);
      const lmstRad = lmstDeg * (Math.PI / 180);

      const q = new Quaternion();
      const latTilt = new Quaternion().setFromEuler(
        new Euler(-(Math.PI / 2 - latRad), 0, 0),
      );
      const siderealRot = new Quaternion().setFromEuler(
        new Euler(0, -lmstRad, 0),
      );
      q.copy(latTilt).multiply(siderealRot);
      groupRef.current.quaternion.copy(q);
      groupRef.current.position.set(0, 0, 0);

      for (let i = 0; i < STARS.length; i++) {
        const mesh = starMeshRefs.current[i];
        if (!mesh) continue;
        const [ox, oy, oz] = starOriginals[i];
        mesh.position.set(ox, oy, oz);
        mesh.scale.setScalar(1);
      }

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

      convergenceRef.current.t = 0;
      return;
    }

    // ── Orbit 모드 ──
    groupRef.current.rotation.y = 0;

    if (selectedLocation) {
      const anim = animState.current;
      if (anim.isAnimating) {
        anim.progress = Math.min(anim.progress + delta * 0.8, 1);
        if (anim.progress >= 1) anim.isAnimating = false;
      }

      const p = anim.progress;
      const t = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

      // 라이브 시간으로 지구 자전각 계산 → 미니 천구 일주운동에 사용
      const gmstDeg = computeLMST(time, 0);
      const gmstRad = gmstDeg * (Math.PI / 180);
      const earthRotY = gmstRad - Math.PI / 2;

      // 타겟(미니 천구의 중심)은 클릭하여 얼어붙은 지구 표면과 정확히 일치해야 함.
      // Earth.tsx와 동일한 frozenTime으로 지구 표면의 회전 멈춘 위치를 계산하여 _targetVec 고정
      if (!animState.current.fixedTarget) {
        const frozenTime = frozenTimeRef.current ? new Date(frozenTimeRef.current) : time;
        const frozenGmstDeg = computeLMST(frozenTime, 0);
        const frozenEarthRotYVal = (frozenGmstDeg * (Math.PI / 180)) - Math.PI / 2;
        const frozenEulerY = new Euler(0, frozenEarthRotYVal, 0);

        const [rawTx, rawTy, rawTz] = latLonToXYZ(
          selectedLocation.lat,
          selectedLocation.lon,
          1.0,
        );
        // 멈춰있는 지구 모델과 일치하는 미니 천구 중심 월드 좌표 고정
        _targetVec.set(rawTx, rawTy, rawTz).applyEuler(frozenEulerY);
        animState.current.fixedTarget = _targetVec.clone();
        // 클릭 순간의 지구 자전각 저장 (수렴 꼬임 방지용 델타 기준점)
        animState.current.frozenEarthRotY = frozenEarthRotYVal;
      }

      const tx = animState.current.fixedTarget.x;
      const ty = animState.current.fixedTarget.y;
      const tz = animState.current.fixedTarget.z;

      // 회전 델타: 클릭 시점 기준으로만 회전량 계산
      // → t=0(시작)에서는 회전 0 (꼬임 없음), 시간 재생 시 서서히 회전
      const frozenRotY = animState.current.frozenEarthRotY ?? earthRotY;
      const rotYDelta = frozenRotY - earthRotY;
      _eulerY.set(0, rotYDelta * t, 0);

      // 태양·달 수렴 상태 업데이트 (rotY는 unscaled 델타, Sun/Moon에서 t를 곱해서 사용)
      convergenceRef.current.t = t;
      convergenceRef.current.tx = tx;
      convergenceRef.current.ty = ty;
      convergenceRef.current.tz = tz;
      convergenceRef.current.rotY = rotYDelta;

      for (let i = 0; i < STARS.length; i++) {
        const mesh = starMeshRefs.current[i];
        if (!mesh) continue;
        const [ox, oy, oz] = starOriginals[i];
        const [mx, my, mz] = raDecToXYZ(STARS[i].ra, STARS[i].dec, MINI_RADIUS);

        // 미니 천구 별 좌표에 일주운동(Y축 회전) 적용 (시간 재생 시 별자리가 움직이게 함)
        _rotM.set(mx, my, mz).applyEuler(_eulerY);

        mesh.position.set(
          ox + (tx + _rotM.x - ox) * t,
          oy + (ty + _rotM.y - oy) * t,
          oz + (tz + _rotM.z - oz) * t,
        );
        const origSize = starSizes[i];
        const miniSize =
          STARS[i].mag < 1 ? 0.0045 : STARS[i].mag < 2 ? 0.0033 : 0.0023;
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

          // 별자리 선도 일주운동 적용
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
    } else {
      convergenceRef.current.t = 0;
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
        convergenceRef={convergenceRef}
        miniRadius={MINI_RADIUS}
      />

      {/* ── 달 ── */}
      <Moon
        time={time}
        celestialRadius={CELESTIAL_RADIUS}
        viewMode={viewMode}
        zoomProgress={zoomProgress}
        convergenceRef={convergenceRef}
        miniRadius={MINI_RADIUS}
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
