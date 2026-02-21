import { useMemo, useEffect, useState } from 'react'
import { BufferGeometry, LineSegments, LineBasicMaterial, Float32BufferAttribute } from 'three'

/**
 * GeoJSON 좌표(경도, 위도)를 3D 구체 좌표로 변환
 */
function geoToXYZ(lon: number, lat: number, R: number): [number, number, number] {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    return [
        -(R * Math.sin(phi) * Math.cos(theta)),
        (R * Math.cos(phi)),
        (R * Math.sin(phi) * Math.sin(theta))
    ]
}

interface CountryBordersProps {
    radius: number
}

/**
 * 국가 경계선 컴포넌트 (최적화 버전)
 * 모든 경계선을 단일 LineSegments 메시로 병합하여 드로우 콜 1회로 렌더링합니다.
 */
export default function CountryBorders({ radius }: CountryBordersProps) {
    const [geoData, setGeoData] = useState<any>(null)

    useEffect(() => {
        fetch('/data/countries-110m.geojson')
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.warn('국가 경계 데이터 로드 실패:', err))
    }, [])

    /**
     * 모든 국가 경계를 단일 LineSegments 지오메트리로 병합
     * 기존: 수백 개의 개별 Line → 최적화: 단일 LineSegments (드로우 콜 1회)
     */
    const borderMesh = useMemo(() => {
        if (!geoData) return null

        const R = radius + 0.002
        const vertices: number[] = []

        const processRing = (ring: number[][]) => {
            for (let i = 0; i < ring.length - 1; i++) {
                const [lon1, lat1] = ring[i]
                const [lon2, lat2] = ring[i + 1]
                const p1 = geoToXYZ(lon1, lat1, R)
                const p2 = geoToXYZ(lon2, lat2, R)
                vertices.push(...p1, ...p2)
            }
        }

        geoData.features.forEach((feature: any) => {
            const { type, coordinates } = feature.geometry
            if (type === 'Polygon') {
                coordinates.forEach((ring: number[][]) => processRing(ring))
            } else if (type === 'MultiPolygon') {
                coordinates.forEach((polygon: number[][][]) => {
                    polygon.forEach((ring: number[][]) => processRing(ring))
                })
            }
        })

        const geometry = new BufferGeometry()
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))

        const material = new LineBasicMaterial({
            color: '#ffcc00',
            transparent: true,
            opacity: 0.35,
        })

        return new LineSegments(geometry, material)
    }, [geoData, radius])

    if (!borderMesh) return null

    return <primitive object={borderMesh} />
}
