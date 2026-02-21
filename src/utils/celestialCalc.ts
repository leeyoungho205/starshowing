/**
 * 천체 위치 계산 유틸리티
 *
 * astronomy-engine 라이브러리를 사용하여 태양/달의 정확한 위치를 계산합니다.
 * 반환값은 적경(RA, 시간)과 적위(Dec, 도) — 기존 별 데이터와 동일한 좌표계.
 */
import {
    Body,
    Equator,
    Observer,
    MoonPhase,
    GeoVector,
    KM_PER_AU,
} from 'astronomy-engine'

export interface CelestialPosition {
    ra: number   // 적경 (시간, 0~24h)
    dec: number  // 적위 (도, -90~+90)
    dist: number // 거리 (AU)
}

/**
 * 태양의 적도좌표 (J2000)
 */
export function getSunPosition(time: Date): CelestialPosition {
    const observer = new Observer(0, 0, 0) // 지구 중심 관측
    const eq = Equator(Body.Sun, time, observer, false, true)
    return {
        ra: eq.ra,
        dec: eq.dec,
        dist: eq.dist,
    }
}

/**
 * 달의 적도좌표 (J2000)
 */
export function getMoonPosition(time: Date): CelestialPosition {
    const observer = new Observer(0, 0, 0)
    const eq = Equator(Body.Moon, time, observer, false, true)
    return {
        ra: eq.ra,
        dec: eq.dec,
        dist: eq.dist,
    }
}

/**
 * 달의 위상각 (0~360°)
 * 0° = 신월(New Moon), 90° = 상현(First Quarter),
 * 180° = 보름(Full Moon), 270° = 하현(Last Quarter)
 */
export function getMoonPhaseAngle(time: Date): number {
    return MoonPhase(time)
}

/**
 * 태양의 지구중심 벡터 (AU 단위 → 방향벡터로 사용)
 * 조명 방향 계산에 사용
 */
export function getSunDirectionVector(time: Date): [number, number, number] {
    const vec = GeoVector(Body.Sun, time, true)
    return [vec.x, vec.y, vec.z]
}

/**
 * RA/Dec → 천구 XYZ 좌표 변환
 * 기존 CelestialSphere의 raDecToXYZ와 동일한 좌표계
 */
export function raDecToXYZ(ra: number, dec: number, R: number): [number, number, number] {
    const raRad = (ra * 15) * (Math.PI / 180)
    const decRad = dec * (Math.PI / 180)
    return [
        R * Math.cos(decRad) * Math.sin(raRad),
        R * Math.sin(decRad),
        R * Math.cos(decRad) * Math.cos(raRad)
    ]
}

/**
 * 달의 각지름 (도) — 거리에 따라 달라짐
 */
export function getMoonAngularDiameter(distAU: number): number {
    const moonRadiusKm = 1737.4
    const distKm = distAU * KM_PER_AU
    return 2 * Math.atan(moonRadiusKm / distKm) * (180 / Math.PI)
}

/**
 * 태양의 각지름 (도, 약 0.53°)
 */
export function getSunAngularDiameter(distAU: number): number {
    const sunRadiusKm = 696340
    const distKm = distAU * KM_PER_AU
    return 2 * Math.atan(sunRadiusKm / distKm) * (180 / Math.PI)
}
