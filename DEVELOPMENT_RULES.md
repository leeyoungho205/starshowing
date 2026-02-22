# StarShowing Development & Debugging Rules

이 문서는 StarShowing 프로젝트를 개발 및 디버깅할 때 발생했던 치명적인 버그들을 방지하기 위해 작성된 핵심 원칙입니다. 코드를 수정하거나 새로운 기능을 추가할 때 반드시 아래 사항들을 숙지하세요.

## 1. React State vs Three.js(R3F) 프레임워크 충돌 금지
- **문제점**: React의 Declarative(선언적) 렌더링 방식과 Three.js의 Imperative(명령형) 애니메이션 루프(`useFrame`, `OrbitControls`)가 충돌할 수 있습니다.
- **핵심 규칙**: `SceneContainer.tsx`처럼 `time` 등 상태 변경에 의해 매 틱(초)마다 재렌더링되는 부모 컴포넌트에서, `<PerspectiveCamera position={[0,0,0]}>` 처럼 카메라 위치를 **절대 하드코딩(고정)하지 마세요**. 
- **결과**: 하드코딩 시, `OrbitControls`나 `GroundCamera`에서 계산한 마우스 회전(Drag) 좌표가 React 렌더링 사이클에 의해 매 프레임마다 강제로 초기화되어 조작 기능이 먹통(북쪽 고정 등)이 됩니다.

## 2. 지면 관측 모드(Ground View) 1인칭 파노라마 시점 구현의 비밀
- **문제점**: `OrbitControls`는 기본적으로 타겟(Target) 주위를 빙빙 도는 3인칭 관찰자 시점(Orbit)으로 설계되어 있어, 제자리에서 고개를 돌려 하늘을 보는 1인칭(First-Person/Pan) 조작에는 본래 맞지 않습니다.
- **핵심 규칙 (마법의 트릭)**: 1인칭 제자리 회전을 완벽히 시뮬레이션하기 위해 `GroundCamera.tsx`에서는 다음 로직을 **반드시 유지**해야 합니다.
  1. `OrbitControls`가 마우스 드래그로 카메라를 움직이려 할 때, 이동하고자 하는 '방향 벡터(dir)'만 수학적으로 추출합니다.
  2. 그 방향으로 `target`을 10만큼 멀리 밀어냅니다.
  3. `useFrame`을 통해 카메라 위치(`camera.position`)를 끝없이 원점(`[0,0,0]`)으로 되돌립니다.
- **주의사항**: `OrbitControls` 설정 시 `maxPolarAngle={Math.PI}` 옵션을 빼먹으면, 카메라가 하늘(고도 30도 등)을 올려다볼 때 자체 각도 제한에 걸려 시선이 강제로 지평선(수평 50%)으로 추락하므로 절대 삭제해선 안 됩니다.

## 3. 지면 뷰와 태양계 뷰(Orbit View)의 철저한 로직 격리
- **문제점**: 두 뷰는 동작 원리 자체가 180도 다릅니다. (지면 뷰는 원점 고정 후 타겟 이동, 태양계 뷰는 타겟 고정 후 카메라 이동)
- **핵심 규칙**: 두 모드의 마우스 휠, 드래그, 줌(Zoom) 제어, 카메라 컨트롤러(`GroundCamera.tsx` vs `OrbitCameraRig` in `SceneContainer.tsx`) 코드는 **절대 하나로 합치거나 재사용하려 하지 마세요**. 독립된 컴포넌트로 분리하고 `viewMode` 상태에 따라 완전히 교체(Mount/Unmount)되도록 관리해야 부작용(Side-effect)이 파급되지 않습니다.

## 4. 천체(지구, 달, 태양) 궤도선의 3D 입체화
- **문제점**: 궤도선을 가로 방향(XZ축) 평면 타원 모델인 `EllipseCurve(2D)`로 그리면, 실제 천체 좌표계와 어긋나는 시각적 버그가 발생합니다.
- **핵심 규칙**: 태양과 달은 지구 자전축 기울기인 적위(Declination, 약 23.5도) 때문에 공전 시 상하(Y축)로 계속 요동칩니다. 궤도선을 그릴 때는 반드시 `getSunPosition`과 `raDecToXYZ` 수학 함수를 반복문으로 돌려, 365일 치의 3차원 상대 좌표 배율을 직접 계산한 `BufferGeometry` 입체 선(3D Curve)으로 렌더링해야만 궤도선이 행성을 완벽히 관통합니다.
