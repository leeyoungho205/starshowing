import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { OrbitControls } from '@react-three/drei'
import { Vector3, MathUtils } from 'three'

interface GroundCameraProps {
    selectedLocation: { lat: number; lon: number }
}

/**
 * 지면 뷰 전용 카메라 컨트롤러
 *
 * 관측자를 원점(0,0,0)에 놓고:
 * - 천구의 북극(NCP) 방향 = 위도에 따라 고도각이 결정됨
 * - 초기 카메라: 북쪽 방향, 지평면 위 30°를 바라봄
 * - OrbitControls로 자유롭게 하늘을 둘러볼 수 있음
 */
export default function GroundCamera({ selectedLocation }: GroundCameraProps) {
    const { camera } = useThree()
    const controlsRef = useRef<OrbitControlsImpl>(null)
    const initialized = useRef(false)
    const prevLoc = useRef<{ lat: number; lon: number } | null>(null)

    // 위치가 바뀌거나 처음 진입할 때 카메라 초기화
    useEffect(() => {
        if (!selectedLocation) return
        if (prevLoc.current &&
            prevLoc.current.lat === selectedLocation.lat &&
            prevLoc.current.lon === selectedLocation.lon &&
            initialized.current) return

        prevLoc.current = selectedLocation
        initialized.current = true

        // 카메라를 원점에 배치
        camera.position.set(0, 0, 0)

        // 북쪽 방향, 지평면 위 45°를 바라보도록 target 설정
        // 지면 좌표계: Y=위(천정), Z=남, X=서
        // 북쪽 = -Z, 고도 45° = Y 방향으로 약간 올림
        const elevationRad = MathUtils.degToRad(45)
        const lookDir = new Vector3(
            0,
            Math.sin(elevationRad),
            -Math.cos(elevationRad) // 북쪽 = -Z
        )
        lookDir.normalize()

        if (controlsRef.current) {
            controlsRef.current.target.copy(lookDir.multiplyScalar(10))
            controlsRef.current.update()
        }

        camera.updateProjectionMatrix()
    }, [selectedLocation, camera])

    // target을 항상 카메라로부터 일정 거리로 유지하면서 카메라는 원점에 고정
    useFrame(() => {
        if (!controlsRef.current) return
        const dir = controlsRef.current.target.clone().sub(camera.position).normalize()
        controlsRef.current.target.copy(dir.multiplyScalar(10))
        camera.position.set(0, 0, 0)
    })

    return (
        <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={false}
            rotateSpeed={0.3}
            enableDamping
            dampingFactor={0.05}
        />
    )
}
