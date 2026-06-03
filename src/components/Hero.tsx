import { Suspense, lazy, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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
  const progressRef = useRef(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const proofRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (mode !== '3d' || !heroRef.current) return
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: heroRef.current!,
        start: 'top top',
        end: '+=2200',
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress
          progressRef.current = p
          if (proofRef.current) {
            const r = clamp01((p - 0.75) / 0.1)
            proofRef.current.style.opacity = String(r)
            proofRef.current.style.transform = `translateY(${(1 - r) * 30}px)`
          }
          if (ctaRef.current) {
            const r = clamp01((p - 0.85) / 0.1)
            ctaRef.current.style.opacity = String(r)
            ctaRef.current.style.transform = `translateY(${(1 - r) * 30}px)`
          }
          if (hintRef.current) {
            hintRef.current.style.opacity = String(1 - clamp01(p / 0.1))
          }
        },
      })
    }, heroRef)
    return () => ctx.revert()
  }, [mode])

  if (mode === 'fallback') return <HeroFallback />

  return (
    <section ref={heroRef} className="relative h-screen w-full overflow-hidden">
      <div className="orb orb-a" style={{ top: '-12%', left: '-8%' }} aria-hidden />
      <div className="orb orb-b" style={{ bottom: '-18%', right: '-10%' }} aria-hidden />

      {/* 3D-сцена */}
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <img
                src={asset('finmodel-poster.png')}
                alt=""
                className="w-[60%] max-w-2xl rounded-xl opacity-40"
              />
            </div>
          }
        >
          <Hero3D progressRef={progressRef} />
        </Suspense>
      </div>

      {/* Оффер сверху */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-5 pt-[12vh]">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mono-label text-[var(--text-mute)]">FranchiseModel · by closr</p>
          <h1 className="h1-cinema mx-auto mt-5 max-w-4xl text-[var(--text)]">
            Финмодель, которую покупатель франшизы не&nbsp;<span className="text-gradient">закроет</span> на&nbsp;второй минуте
          </h1>
        </div>
      </div>

      {/* Доказательство + CTA снизу */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-[8vh]">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div ref={proofRef} style={{ opacity: 0 }}>
            <p className="mono-label text-[var(--text-mute)]">
              900+ городов · 7 налоговых режимов · P&amp;L на 24 месяца
            </p>
          </div>
          <div ref={ctaRef} style={{ opacity: 0 }} className="mt-7">
            <a
              href="#cta"
              className="cta-glass inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold text-[var(--text)]"
            >
              Записаться на демо — 30 минут
            </a>
          </div>
        </div>
      </div>

      {/* Подсказка скролла */}
      <div
        ref={hintRef}
        className="pointer-events-none absolute inset-x-0 bottom-6 z-10 text-center"
      >
        <span className="mono-label text-[var(--text-mute)]">Листайте — модель раскроется</span>
      </div>
    </section>
  )
}
