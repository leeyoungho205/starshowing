import { useMemo } from 'react'
import { Text, Billboard, Line as DreiLine } from '@react-three/drei'
import { Vector3 } from 'three'

interface LabelData {
    name: string
    lat: number
    lon: number
}

/**
 * 주요 국가 50개 – 대한민국 필수 포함
 * 좌표는 각 국가 영토의 대략적인 중심점 (WGS84)
 */
const COUNTRIES: LabelData[] = [
    // 동아시아
    { name: '대한민국', lat: 36.0, lon: 127.8 },
    { name: '일본', lat: 36.5, lon: 138.0 },
    { name: '중국', lat: 35.0, lon: 105.0 },
    { name: '몽골', lat: 47.0, lon: 105.0 },
    { name: '대만', lat: 23.7, lon: 121.0 },
    // 동남아시아
    { name: '베트남', lat: 16.0, lon: 108.0 },
    { name: '태국', lat: 15.0, lon: 101.0 },
    { name: '인도네시아', lat: -2.0, lon: 118.0 },
    { name: '필리핀', lat: 13.0, lon: 122.0 },
    { name: '말레이시아', lat: 4.0, lon: 109.5 },
    { name: '미얀마', lat: 19.0, lon: 96.0 },
    // 남아시아
    { name: '인도', lat: 22.0, lon: 80.0 },
    { name: '파키스탄', lat: 30.0, lon: 69.0 },
    { name: '방글라데시', lat: 24.0, lon: 90.0 },
    // 중앙아시아/서아시아
    { name: '카자흐스탄', lat: 48.0, lon: 68.0 },
    { name: '이란', lat: 33.0, lon: 54.0 },
    { name: '사우디', lat: 24.0, lon: 45.0 },
    { name: '터키', lat: 39.0, lon: 35.0 },
    { name: 'UAE', lat: 24.0, lon: 54.0 },
    { name: '이스라엘', lat: 31.5, lon: 34.8 },
    { name: '이라크', lat: 33.0, lon: 44.0 },
    // 유럽
    { name: '러시아', lat: 62.0, lon: 100.0 },
    { name: '영국', lat: 54.0, lon: -2.5 },
    { name: '프랑스', lat: 46.6, lon: 2.5 },
    { name: '독일', lat: 51.0, lon: 10.0 },
    { name: '이탈리아', lat: 42.5, lon: 12.5 },
    { name: '스페인', lat: 40.0, lon: -4.0 },
    { name: '폴란드', lat: 52.0, lon: 20.0 },
    { name: '우크라이나', lat: 49.0, lon: 32.0 },
    { name: '스웨덴', lat: 62.0, lon: 15.0 },
    { name: '노르웨이', lat: 64.0, lon: 12.0 },
    { name: '핀란드', lat: 64.0, lon: 26.0 },
    { name: '그리스', lat: 39.0, lon: 22.0 },
    { name: '포르투갈', lat: 39.5, lon: -8.0 },
    // 아프리카
    { name: '이집트', lat: 27.0, lon: 30.0 },
    { name: '남아공', lat: -30.0, lon: 25.0 },
    { name: '나이지리아', lat: 10.0, lon: 8.0 },
    { name: '케냐', lat: 0.0, lon: 38.0 },
    { name: '에티오피아', lat: 9.0, lon: 40.0 },
    { name: '콩고', lat: -3.0, lon: 23.0 },
    { name: '알제리', lat: 28.0, lon: 3.0 },
    // 북아메리카
    { name: '미국', lat: 40.0, lon: -100.0 },
    { name: '캐나다', lat: 58.0, lon: -105.0 },
    { name: '멕시코', lat: 24.0, lon: -102.0 },
    // 남아메리카
    { name: '브라질', lat: -10.0, lon: -55.0 },
    { name: '아르헨티나', lat: -35.0, lon: -65.0 },
    { name: '콜롬비아', lat: 4.0, lon: -73.0 },
    { name: '칠레', lat: -33.0, lon: -71.0 },
    { name: '페루', lat: -10.0, lon: -76.0 },
    // 오세아니아
    { name: '호주', lat: -25.0, lon: 135.0 },
    { name: '뉴질랜드', lat: -42.0, lon: 172.0 },
]

/**
 * 위도/경도 → 3D 좌표 변환
 */
function latLonToVec3(lat: number, lon: number, R: number): Vector3 {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    return new Vector3(
        -(R * Math.sin(phi) * Math.cos(theta)),
        (R * Math.cos(phi)),
        (R * Math.sin(phi) * Math.sin(theta))
    )
}

interface CityLabelsProps {
    radius: number
}

/**
 * 국가 라벨 컴포넌트
 * 
 * 표면에 점을 찍고 → 짧은 연장선 → 끝에 국가명 표시
 * WebGL Text + Billboard 사용 (DOM 오버헤드 없음)
 */
export default function CityLabels({ radius }: CityLabelsProps) {
    const labels = useMemo(() => {
        return COUNTRIES.map(country => {
            // 지표면 위의 점 (시작점)
            const surfacePos = latLonToVec3(country.lat, country.lon, radius + 0.001)
            // 연장선 끝 (라벨 위치) – 표면에서 약간 떨어진 곳
            const labelPos = latLonToVec3(country.lat, country.lon, radius + 0.06)

            return {
                ...country,
                surfacePoint: [surfacePos.x, surfacePos.y, surfacePos.z] as [number, number, number],
                labelPoint: [labelPos.x, labelPos.y, labelPos.z] as [number, number, number],
                linePoints: [surfacePos, labelPos] as [Vector3, Vector3],
            }
        })
    }, [radius])

    return (
        <group>
            {labels.map((label, i) => (
                <group key={i}>
                    {/* 표면 위의 점 */}
                    <mesh position={label.surfacePoint}>
                        <sphereGeometry args={[0.006, 6, 6]} />
                        <meshBasicMaterial color="#ffcc00" />
                    </mesh>

                    {/* 연장선 (점 → 라벨) */}
                    <DreiLine
                        points={label.linePoints}
                        color="#ffcc00"
                        lineWidth={1}
                        transparent
                        opacity={0.5}
                    />

                    {/* 국가명 라벨 (Billboard로 항상 카메라를 향함) */}
                    <Billboard position={label.labelPoint}>
                        <Text
                            fontSize={0.016}
                            color="#ffcc00"
                            anchorX="left"
                            anchorY="middle"
                            outlineWidth={0.002}
                            outlineColor="#000000"
                        >
                            {' ' + label.name}
                        </Text>
                    </Billboard>
                </group>
            ))}
        </group>
    )
}
