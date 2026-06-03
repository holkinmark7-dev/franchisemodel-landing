import { Suspense, lazy, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { hasWebGL, isNarrow, prefersReducedMotion, asset } from '../lib/env'
import HeroFallback from './HeroFallback'

const Hero3D = lazy(() => import('./Hero3D'))
gsap.registerPlugin(ScrollTrigger)

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

function decideMode(): '3d' | 'fallback' {
  return hasWebGL() && !isNarrow() && !prefersReducedMotion() ? '3d' : 'fallback'
}

export default function Hero() {
  const [mode] = useState<'3d' | 'fallback'>(decideMode)
  const [enablePost] = useState(() => (navigator.hardwareConcurrency ?? 8) >= 4)
  const progressRef = useRef(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const h1Ref = useRef<HTMLDivElement>(null)
  const proofRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const cueRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (mode !== '3d' || !heroRef.current) return

    // Lenis smooth-scroll, связанный со ScrollTrigger через единый тикер GSAP.
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
          progressRef.current = p

          // H1 рецедирует 0.15..0.45 — уходит ДО прихода ноутбука на яркость
          if (h1Ref.current) {
            const r = clamp01((p - 0.15) / 0.3)
            h1Ref.current.style.opacity = String(1 - r)
            h1Ref.current.style.transform = `translateY(${-60 * r}px) scale(${1 - 0.04 * r})`
            h1Ref.current.style.filter = `blur(${8 * r}px)`
          }
          // proof + CTA — чистая нижняя зона, только после раскрытия
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

  if (mode === 'fallback') return <HeroFallback />

  return (
    <section ref={heroRef} className="relative h-screen w-full overflow-hidden">
      <div className="orb orb-a" style={{ top: '-14%', left: '-6%' }} aria-hidden />
      <div className="orb orb-b" style={{ bottom: '-20%', right: '-8%' }} aria-hidden />

      {/* 3D-сцена */}
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <img src={asset('finmodel-poster.png')} alt="" className="w-[54%] max-w-xl rounded-xl opacity-30" />
            </div>
          }
        >
          <Hero3D progressRef={progressRef} enablePost={enablePost} />
        </Suspense>
      </div>

      {/* Виньетка по краям кадра */}
      <div className="vignette" aria-hidden />

      {/* Оффер — верхне-центральная зона, уходит на скролле */}
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
              className="cta-glass pointer-events-auto inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold text-[var(--text)]"
            >
              Записаться на демо — 30 минут
            </a>
          </div>
        </div>
      </div>

      {/* Scroll-cue с дыханием */}
      <div ref={cueRef} className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-2">
        <span className="mono-label text-[var(--text-mute)]">Листайте</span>
        <span className="scroll-cue" aria-hidden />
      </div>
    </section>
  )
}
