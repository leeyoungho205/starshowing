import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Euler } from 'three'

interface GroundCameraProps {
    selectedLocation: { lat: number; lon: number }
}

/**
 * 지면 뷰 전용 카메라 컨트롤러
 * 
 * OrbitControls의 구형(Orbit) 제약을 우회하기 위해 
 * 순수 마우스 드래그를 이용한 1인칭(First-Person) 파노라마 시점을 구현합니다.
 */
export default function GroundCamera({ selectedLocation }: GroundCameraProps) {
    const { camera, gl } = useThree()
    const initialized = useRef(false)
    const prevLoc = useRef<{ lat: number; lon: number } | null>(null)

    // 카메라 회전 상태 저장 (x: 고도, y: 방위각)
    // 초기 시선: 고도 20도 위 (Math.PI / 9), 북향 (0)
    const rotationRef = useRef(new Euler(Math.PI / 9, 0, 0, 'YXZ'))

    // 포인터 상태
    const isDragging = useRef(false)
    const previousMousePosition = useRef({ x: 0, y: 0 })

    useEffect(() => {
        if (!selectedLocation) return
        if (prevLoc.current &&
            prevLoc.current.lat === selectedLocation.lat &&
            prevLoc.current.lon === selectedLocation.lon &&
            initialized.current) return

        prevLoc.current = selectedLocation
        initialized.current = true

        // 1. 카메라를 완전히 중심에 고정
        camera.position.set(0, 0, 0)

        // 2. 초기 시선: 고도 20도 위, 북향 (0)
        rotationRef.current.set(Math.PI / 9, 0, 0)
        camera.quaternion.setFromEuler(rotationRef.current)
        camera.updateProjectionMatrix()
    }, [selectedLocation, camera])

    // 매 프레임마다 카메라 상태를 강제로 동기화 (React re-render에 의한 초기화 방지)
    useFrame(() => {
        camera.position.set(0, 0, 0)
        camera.quaternion.setFromEuler(rotationRef.current)
    })

    useEffect(() => {
        const domElement = gl.domElement

        const onPointerDown = (event: PointerEvent) => {
            isDragging.current = true
            previousMousePosition.current = { x: event.clientX, y: event.clientY }
            domElement.setPointerCapture(event.pointerId)
        }

        const onPointerMove = (event: PointerEvent) => {
            if (!isDragging.current) return

            const deltaX = event.clientX - previousMousePosition.current.x
            const deltaY = event.clientY - previousMousePosition.current.y

            previousMousePosition.current = { x: event.clientX, y: event.clientY }

            // 회전 감도
            const sensitivity = 0.002

            // 방위각 (수평 회전) - Y축 회전
            rotationRef.current.y -= deltaX * sensitivity

            // 고도 (수직 회전) - X축 회전
            rotationRef.current.x -= deltaY * sensitivity

            // 천정(위)과 발밑(아래) 시선 제한 (-90도 ~ 90도)
            const PI_2 = Math.PI / 2
            rotationRef.current.x = Math.max(-PI_2, Math.min(PI_2, rotationRef.current.x))

            // 카메라에 반영 (YXZ 순서 적용으로 짐벌락 최소화)
            camera.quaternion.setFromEuler(rotationRef.current)
        }

        const onPointerUp = (event: PointerEvent) => {
            isDragging.current = false
            domElement.releasePointerCapture(event.pointerId)
        }

        domElement.addEventListener('pointerdown', onPointerDown)
        domElement.addEventListener('pointermove', onPointerMove)
        domElement.addEventListener('pointerup', onPointerUp)
        domElement.addEventListener('pointercancel', onPointerUp)

        return () => {
            domElement.removeEventListener('pointerdown', onPointerDown)
            domElement.removeEventListener('pointermove', onPointerMove)
            domElement.removeEventListener('pointerup', onPointerUp)
            domElement.removeEventListener('pointercancel', onPointerUp)
        }
    }, [camera, gl.domElement])

    return null
}
