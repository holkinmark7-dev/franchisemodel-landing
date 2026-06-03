import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { isNarrow, prefersReducedMotion } from '../lib/env'
import Device from './Device'

gsap.registerPlugin(ScrollTrigger)

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function decideMode(): 'cinematic' | 'static' {
  return !isNarrow() && !prefersReducedMotion() ? 'cinematic' : 'static'
}

export default function Hero() {
  const [mode] = useState<'cinematic' | 'static'>(decideMode)
  const heroRef = useRef<HTMLDivElement>(null)
  const deviceWrapRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const h1Ref = useRef<HTMLDivElement>(null)
  const proofRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const cueRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const wakeRef = useRef<HTMLDivElement>(null)
  const sweepRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (mode !== 'cinematic' || !heroRef.current) return

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: heroRef.current!,
        start: 'top top',
        end: '+=2400',
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress

          // Устройство выходит из глубины 0.15..0.55: y↑, scale up, blur→0, opacity↑
          if (deviceWrapRef.current) {
            const r = clamp01((p - 0.15) / 0.4)
            const scale = lerp(0.82, 1, r)
            const y = lerp(60, 0, r)
            const blur = lerp(8, 0, r)
            deviceWrapRef.current.style.transform = `translateY(${y}px) scale(${scale})`
            deviceWrapRef.current.style.filter = `blur(${blur}px)`
            deviceWrapRef.current.style.opacity = String(lerp(0.55, 1, r))
          }
          // Ambient-glow наплывает
          if (glowRef.current) glowRef.current.style.opacity = String(clamp01((p - 0.2) / 0.4) * 0.85)

          // Экран просыпается 0.4..0.7 (чёрный → видео)
          const wake = clamp01((p - 0.4) / 0.3)
          if (wakeRef.current) wakeRef.current.style.opacity = String(1 - wake)
          const video = videoRef.current
          if (video) {
            if (wake > 0.1 && video.paused) video.play().catch(() => {})
            else if (wake <= 0.05 && !video.paused) video.pause()
          }

          // Один мягкий световой свип 0.55..0.85
          if (sweepRef.current) {
            const s = clamp01((p - 0.55) / 0.3)
            sweepRef.current.style.transform = `translateX(${lerp(-60, 160, s)}%)`
            sweepRef.current.style.opacity = String(Math.sin(s * Math.PI) * 0.9)
          }

          // H1 рецедирует 0.15..0.45 — не делит экран с устройством на яркости
          if (h1Ref.current) {
            const r = clamp01((p - 0.15) / 0.3)
            h1Ref.current.style.opacity = String(1 - r)
            h1Ref.current.style.transform = `translateY(${-60 * r}px) scale(${1 - 0.04 * r})`
            h1Ref.current.style.filter = `blur(${8 * r}px)`
          }
          // proof + CTA — чистая нижняя зона 0.72..1.0
          if (proofRef.current) {
            const r = clamp01((p - 0.72) / 0.12)
            proofRef.current.style.opacity = String(r)
            proofRef.current.style.transform = `translateY(${(1 - r) * 28}px)`
          }
          if (ctaRef.current) {
            const r = clamp01((p - 0.82) / 0.12)
            ctaRef.current.style.opacity = String(r)
            ctaRef.current.style.transform = `translateY(${(1 - r) * 28}px)`
          }
          if (cueRef.current) cueRef.current.style.opacity = String(1 - clamp01(p / 0.1))
        },
      })
    }, heroRef)

    return () => {
      ctx.revert()
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [mode])

  if (mode === 'static') {
    return (
      <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-5 py-24">
        <div className="orb orb-a" style={{ top: '-12%', left: '-12%' }} aria-hidden />
        <div className="orb orb-b" style={{ bottom: '-16%', right: '-12%' }} aria-hidden />
        <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
          <p className="mono-label text-[var(--text-mute)]">FranchiseModel · by closr</p>
          <h1 className="h1-hero mx-auto mt-5 text-[var(--text)]">
            Финмодель, которую покупатель франшизы не&nbsp;<span className="text-gradient">закроет</span> на&nbsp;второй минуте
          </h1>
          <div className="mt-10 w-full">
            <Device autoPlay />
          </div>
          <p className="mono-label mt-9 text-[var(--text-mute)]">
            900+ городов · 7 налоговых режимов · P&amp;L на 24 месяца
          </p>
          <a
            href="#cta"
            className="cta-glass mt-8 inline-flex items-center px-7 py-3.5 text-[15px] font-semibold text-[var(--text)]"
          >
            Записаться на демо — 30 минут
          </a>
        </div>
      </section>
    )
  }

  return (
    <section ref={heroRef} className="relative h-screen w-full overflow-hidden">
      <div className="orb orb-a" style={{ top: '-14%', left: '-6%' }} aria-hidden />
      <div className="orb orb-b" style={{ bottom: '-20%', right: '-8%' }} aria-hidden />

      {/* Glow за устройством */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          opacity: 0,
          background: 'radial-gradient(circle, rgba(124,168,255,0.35), transparent 65%)',
          filter: 'blur(40px)',
        }}
        aria-hidden
      />

      {/* Устройство по центру */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div ref={deviceWrapRef} className="w-full will-change-transform" style={{ opacity: 0.55 }}>
          <Device videoRef={videoRef} wakeRef={wakeRef} sweepRef={sweepRef} />
        </div>
      </div>

      {/* Виньетка */}
      <div className="vignette" aria-hidden />

      {/* Оффер сверху (уходит на скролле) */}
      <div ref={h1Ref} className="pointer-events-none absolute inset-x-0 top-0 z-10 px-5 pt-[13vh] will-change-transform">
        <div className="mx-auto text-center">
          <p className="mono-label text-[var(--text-mute)]">FranchiseModel · by closr</p>
          <h1 className="h1-hero mx-auto mt-6 text-[var(--text)]">
            Финмодель, которую покупатель франшизы не&nbsp;<span className="text-gradient">закроет</span> на&nbsp;второй минуте
          </h1>
        </div>
      </div>

      {/* Доказательство + CTA — чистая нижняя полоса */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-[9vh]">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div ref={proofRef} style={{ opacity: 0 }}>
            <p className="mono-label text-[var(--text-mute)]">
              900+ городов · 7 налоговых режимов · P&amp;L на 24 месяца
            </p>
          </div>
          <div ref={ctaRef} style={{ opacity: 0 }} className="mt-7">
            <a
              href="#cta"
              className="cta-glass pointer-events-auto inline-flex items-center px-7 py-3.5 text-[15px] font-semibold text-[var(--text)]"
            >
              Записаться на демо — 30 минут
            </a>
          </div>
        </div>
      </div>

      {/* Scroll-cue */}
      <div ref={cueRef} className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-2">
        <span className="mono-label text-[var(--text-mute)]">Листайте</span>
        <span className="scroll-cue" aria-hidden />
      </div>
    </section>
  )
}
