import { Suspense, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, useVideoTexture, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../lib/env'

// Геометрия ноутбука (из примитивов — без внешнего .glb).
const BASE = { w: 3.0, h: 0.13, d: 2.0 }
const LID = { w: 3.0, h: 1.9, t: 0.07 }
const HINGE_Y = BASE.h / 2
const HINGE_Z = -BASE.d / 2
const LID_CLOSED = 1.5 // крышка лежит на базе
const LID_OPEN = -0.12 // вертикаль + лёгкий наклон назад
const SCREEN_ASPECT = 1280 / 580

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

function Laptop({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const lidRef = useRef<THREE.Group>(null)
  const screenMat = useRef<THREE.MeshBasicMaterial>(null)
  const glowRef = useRef<THREE.PointLight>(null)
  const dispRef = useRef(0)
  const { camera } = useThree()

  const videoTex = useVideoTexture(asset('finmodel.mp4'), {
    start: false,
    muted: true,
    loop: true,
    playsInline: true,
    crossOrigin: 'anonymous',
  })

  const screenW = LID.w * 0.92
  const screenH = screenW / SCREEN_ASPECT

  useFrame((_, dt) => {
    // Демпфер поверх scrub — «тяжёлый премиальный механизм».
    const target = progressRef.current
    dispRef.current += (target - dispRef.current) * Math.min(dt * 6, 1)
    const p = dispRef.current

    // Крышка: фаза 0.18..0.55
    const lidT = easeInOut(clamp01((p - 0.18) / (0.55 - 0.18)))
    if (lidRef.current) lidRef.current.rotation.x = lerp(LID_CLOSED, LID_OPEN, lidT)

    // Камера: push-in 0.45..0.70
    const camT = easeInOut(clamp01((p - 0.45) / (0.7 - 0.45)))
    camera.position.set(lerp(1.2, 0, camT), lerp(0.85, 0.5, camT), lerp(6, 4, camT))
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = lerp(45, 35, camT)
    cam.updateProjectionMatrix()
    camera.lookAt(0, 0.62, 0)

    // Экран оживает, когда крышка раскрыта > 0.7
    const screenOn = clamp01((lidT - 0.6) / 0.4)
    if (screenMat.current) screenMat.current.opacity = screenOn
    if (glowRef.current) glowRef.current.intensity = screenOn * 0.6
    const video = videoTex.image as HTMLVideoElement | undefined
    if (video) {
      if (lidT > 0.7 && video.paused) video.play().catch(() => {})
      else if (lidT <= 0.55 && !video.paused) video.pause()
    }
  })

  return (
    <group position={[0, -0.35, 0]}>
      {/* База */}
      <RoundedBox args={[BASE.w, BASE.h, BASE.d]} radius={0.035} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#16181d" metalness={0.65} roughness={0.4} />
      </RoundedBox>

      {/* Крышка — group с пивотом на петле */}
      <group ref={lidRef} position={[0, HINGE_Y, HINGE_Z]} rotation={[LID_CLOSED, 0, 0]}>
        <RoundedBox args={[LID.w, LID.h, LID.t]} radius={0.035} smoothness={4} position={[0, LID.h / 2, 0]}>
          <meshStandardMaterial color="#121317" metalness={0.7} roughness={0.38} />
        </RoundedBox>
        {/* Чёрная подложка-безель */}
        <mesh position={[0, LID.h / 2, LID.t / 2 + 0.001]}>
          <planeGeometry args={[LID.w * 0.96, LID.h * 0.92]} />
          <meshBasicMaterial color="#04060f" />
        </mesh>
        {/* Экран — видео-текстура финмодели */}
        <mesh position={[0, LID.h / 2, LID.t / 2 + 0.004]}>
          <planeGeometry args={[screenW, screenH]} />
          <meshBasicMaterial ref={screenMat} map={videoTex} toneMapped={false} transparent opacity={0} />
        </mesh>
      </group>

      <pointLight ref={glowRef} position={[0, 0.8, 1.2]} intensity={0} color="#7ca8ff" distance={6} />
      <ContactShadows position={[0, -BASE.h / 2 - 0.01, 0]} opacity={0.5} scale={8} blur={2.4} far={4} color="#000010" />
    </group>
  )
}

export default function Hero3D({ progressRef }: { progressRef: MutableRefObject<number> }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [1.2, 0.85, 6], fov: 45 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 5, 4]} intensity={1.25} />
      <directionalLight position={[-4, 2, -2]} intensity={0.35} color="#8b7cff" />
      <Suspense fallback={null}>
        <Laptop progressRef={progressRef} />
      </Suspense>
    </Canvas>
  )
}
