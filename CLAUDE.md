# Starshowing 프로젝트

## GitHub 리포지터리
- **URL**: https://github.com/leeyoungho205/starshowing
- 최신 코드는 이 리포지터리를 참조

## 프로젝트 개요
교육용 3D 천체 시각화 앱 (React + Three.js / React Three Fiber)
- 지구본에서 위치를 클릭하면 해당 지역의 밤하늘(별자리)을 미니 천구로 시각화
- 시간 시뮬레이션: 별자리·태양·달의 일주운동 확인 가능
- 태양계 모드: 지구-달-태양의 공전·위상 관계 시각화

## 기술 스택
| 분야 | 기술 |
|------|------|
| 프레임워크 | React + TypeScript |
| 3D | Three.js, React Three Fiber (@react-three/fiber) |
| 헬퍼 | @react-three/drei |
| 스타일 | Tailwind CSS |
| 천체 계산 | astronomy-engine |
| 빌드 | Vite |

## 주요 컴포넌트 구조
```
src/
├── App.tsx                  # 상태 관리 (viewMode, selectedLocation, time)
├── components/
│   ├── SceneContainer.tsx   # Canvas + 조명 + 모드 분기
│   ├── Earth.tsx            # 지구본 (클릭 → selectedLocation, 자전 처리)
│   ├── CelestialSphere.tsx  # 천구 (별자리 + 수렴 애니메이션 + LMST 회전)
│   ├── Sun.tsx              # 태양 (수렴 애니메이션 포함)
│   ├── Moon.tsx             # 달 (위상 변화 + 수렴 애니메이션)
│   ├── Planets.tsx          # 행성들
│   ├── SolarSystemView.tsx  # 태양계 줌아웃 뷰
│   ├── Ground.tsx           # 지면 (ground 모드)
│   ├── GroundCamera.tsx     # 지면 카메라 제어
│   ├── UIOverlay.tsx        # 시간 컨트롤 UI
│   ├── CountryBorders.tsx   # 국가 경계선
│   └── CityLabels.tsx       # 도시 라벨
├── data/
│   └── stars.ts             # 별 카탈로그 + 별자리 연결선 (Yale BSC 기준)
└── utils/
    └── celestialCalc.ts     # 천체 계산 (LMST, RA/Dec → XYZ, 태양/달 위치)
```

## 핵심 로직

### 뷰 모드
- **orbit 모드** (기본): 지구를 외부에서 관찰. 지구 클릭 → 미니 천구 수렴 애니메이션
- **ground 모드**: 선택한 위치에서 올려다보는 밤하늘. LMST 기반 천구 회전

### 미니 천구 수렴 애니메이션
- 별들이 클릭한 위치의 미니 천구(반지름 0.3)로 수렴
- `convergenceRef`로 태양·달과 수렴 상태 공유 (`t`, `tx/ty/tz`, `miniQ`)
- `miniQ` = LMST + 위도 회전: 시간 재생 시 미니 천구 내부가 회전

### 지구 자전 동결
- 위치 선택 시: `frozenEarthRotY` ref로 자전각 고정 (Earth.tsx & CelestialSphere.tsx 동기화)
- 위치 해제 시: 자전 재개

### 셰이더 커스텀
- 별·별자리선 모두 `onBeforeCompile`로 GLSL 수정
- `uGroundMode` uniform: ground 모드에서만 지평선 아래(y<0) 별을 희미하게 처리

## 개발 서버 실행
```bash
npm run dev   # http://localhost:5173
```

## 주의사항
- `stars.ts`에 별 데이터 추가 시 `CONSTELLATIONS`의 연결선 이름과 반드시 일치
- `CelestialSphere.tsx`의 `raDecToXYZ`와 `celestialCalc.ts`의 `raDecToXYZ`는 동일한 좌표계 사용
- Earth.tsx와 CelestialSphere.tsx의 `frozenEarthRotY` 캡처 타이밍이 반드시 동기화되어야 함
