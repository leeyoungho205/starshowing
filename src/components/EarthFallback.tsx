// Earth 텍스처 로딩 전 폴백 — 단순한 파란 구체
export default function EarthFallback() {
    return (
        <mesh>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial color="#1a6fa8" roughness={0.5} metalness={0.1} />
        </mesh>
    )
}
