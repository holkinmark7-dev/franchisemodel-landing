import { Suspense, useMemo, useRef, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, useVideoTexture, ContactShadows, Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { asset } from '../lib/env'

// Геометрия ноутбука (премиум-примитив, без внешнего .glb).
const BASE = { w: 3.0, h: 0.11, d: 2.05 }
const LID = { w: 2.96, h: 1.86, t: 0.055 }
const HINGE_Y = BASE.h / 2
const HINGE_Z = -BASE.d / 2
const LID_CLOSED = 1.5
const LID_OPEN = -0.1
const SCREEN_ASPECT = 1280 / 580

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

// Диагональный блик на стекле экрана (CanvasTexture, additive).
function useGlareTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 256
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 512, 256)
    g.addColorStop(0, 'rgba(255,255,255,0.0)')
    g.addColorStop(0.4, 'rgba(255,255,255,0.0)')
    g.addColorStop(0.5, 'rgba(200,220,255,0.5)')
    g.addColorStop(0.6, 'rgba(255,255,255,0.0)')
    g.addColorStop(1, 'rgba(255,255,255,0.0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 512, 256)
    const tex = new THREE.CanvasTexture(c)
    return tex
  }, [])
}

function Laptop({ progressRef }: { progressRef: RefObject<number> }) {
  const lidRef = useRef<THREE.Group>(null)
  const screenMat = useRef<THREE.MeshBasicMaterial>(null)
  const glareRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.PointLight>(null)
  const keyRef = useRef<THREE.DirectionalLight>(null)
  const dispRef = useRef(0)
  const { camera, scene } = useThree()

  const videoTex = useVideoTexture(asset('finmodel.mp4'), {
    start: false,
    muted: true,
    loop: true,
    playsInline: true,
    crossOrigin: 'anonymous',
  })
  const glare = useGlareTexture()

  const screenW = LID.w * 0.93
  const screenH = screenW / SCREEN_ASPECT

  useFrame((_, dt) => {
    const target = progressRef.current
    dispRef.current += (target - dispRef.current) * Math.min(dt * 6, 1)
    const p = dispRef.current

    // Крышка раскрывается 0.15..0.45 (раньше, чтобы успеть до текста снизу)
    const lidT = easeInOut(clamp01((p - 0.15) / (0.45 - 0.15)))
    if (lidRef.current) lidRef.current.rotation.x = lerp(LID_CLOSED, LID_OPEN, lidT)

    // Камера push-in 0.45..0.75
    const camT = easeInOut(clamp01((p - 0.45) / (0.75 - 0.45)))
    camera.position.set(lerp(1.0, 0, camT), lerp(0.7, 0.45, camT), lerp(7, 4, camT))
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = lerp(42, 32, camT)
    cam.updateProjectionMatrix()
    camera.lookAt(0, 0.42, 0)

    // Интенсивность среды/ключа нарастает (в начале ноут приглушён, «дальше»)
    const wake = clamp01(p / 0.2)
    scene.environmentIntensity = lerp(0.35, 1.0, wake)
    if (keyRef.current) keyRef.current.intensity = lerp(0.5, 1.3, wake)

    // Экран оживает при раскрытии > 0.7
    const screenOn = clamp01((lidT - 0.6) / 0.4)
    if (screenMat.current) screenMat.current.opacity = screenOn
    if (glareRef.current) {
      ;(glareRef.current.material as THREE.MeshBasicMaterial).opacity = screenOn * 0.5
      glareRef.current.position.x = lerp(-0.4, 0.4, lidT)
    }
    if (glowRef.current) glowRef.current.intensity = screenOn * 0.7
    const video = videoTex.image as HTMLVideoElement | undefined
    if (video) {
      if (lidT > 0.7 && video.paused) video.play().catch(() => {})
      else if (lidT <= 0.55 && !video.paused) video.pause()
    }
  })

  return (
    <group position={[0, -0.32, 0]}>
      {/* База + дека */}
      <RoundedBox args={[BASE.w, BASE.h, BASE.d]} radius={0.045} smoothness={6} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1c22" metalness={0.92} roughness={0.22} />
      </RoundedBox>
      {/* Клавиатурная дека (тёмная вставка) */}
      <mesh position={[0, BASE.h / 2 + 0.001, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[BASE.w * 0.82, BASE.d * 0.62]} />
        <meshStandardMaterial color="#0c0d12" metalness={0.5} roughness={0.55} />
      </mesh>
      {/* Трекпад */}
      <mesh position={[0, BASE.h / 2 + 0.002, 0.62]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.78, 0.5]} />
        <meshStandardMaterial color="#15171d" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Крышка */}
      <group ref={lidRef} position={[0, HINGE_Y, HINGE_Z]} rotation={[LID_CLOSED, 0, 0]}>
        <RoundedBox args={[LID.w, LID.h, LID.t]} radius={0.05} smoothness={6} position={[0, LID.h / 2, 0]}>
          <meshStandardMaterial color="#16181e" metalness={0.92} roughness={0.2} />
        </RoundedBox>
        {/* Безель */}
        <mesh position={[0, LID.h / 2, LID.t / 2 + 0.001]}>
          <planeGeometry args={[LID.w * 0.97, LID.h * 0.94]} />
          <meshBasicMaterial color="#03050d" />
        </mesh>
        {/* Экран — видео */}
        <mesh position={[0, LID.h / 2, LID.t / 2 + 0.004]}>
          <planeGeometry args={[screenW, screenH]} />
          <meshBasicMaterial ref={screenMat} map={videoTex} toneMapped={false} transparent opacity={0} />
        </mesh>
        {/* Стеклянный блик поверх экрана */}
        <mesh ref={glareRef} position={[0, LID.h / 2, LID.t / 2 + 0.006]}>
          <planeGeometry args={[screenW, screenH]} />
          <meshBasicMaterial map={glare} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>

      {/* Свет: key (рампится) + холодный rim + emissive-glow от экрана */}
      <directionalLight ref={keyRef} position={[3, 5, 4]} intensity={0.5} />
      <directionalLight position={[-5, 3, -2]} intensity={0.4} color="#8b7cff" />
      <pointLight ref={glowRef} position={[0, 0.8, 1.2]} intensity={0} color="#7ca8ff" distance={6} />

      {/* Пол + контактная тень — «стоит в пространстве» */}
      <mesh position={[0, -BASE.h / 2 - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#05070f" metalness={0.2} roughness={0.65} />
      </mesh>
      <ContactShadows position={[0, -BASE.h / 2 - 0.015, 0]} opacity={0.55} scale={9} blur={2.6} far={4} color="#000008" />
    </group>
  )
}

export default function Hero3D({
  progressRef,
  enablePost,
}: {
  progressRef: RefObject<number>
  enablePost: boolean
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [1.0, 0.7, 7], fov: 42 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.3} />
      <Suspense fallback={null}>
        <Environment files={asset('env.hdr')} environmentIntensity={0.8} />
        <Laptop progressRef={progressRef} />
      </Suspense>
      {enablePost && (
        <EffectComposer>
          <Bloom luminanceThreshold={0.55} luminanceSmoothing={0.3} intensity={0.5} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  )
}
