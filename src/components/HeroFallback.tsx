import { asset } from '../lib/env'

// Fallback для мобайла / нет WebGL / reduced-motion:
// видео финмодели в CSS-рамке устройства, без 3D и без скролл-пиннинга.
export default function HeroFallback() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-5 py-20">
      <div className="orb orb-a" style={{ top: '-10%', left: '-10%' }} aria-hidden />
      <div className="orb orb-b" style={{ bottom: '-15%', right: '-10%' }} aria-hidden />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <p className="mono-label text-[var(--text-mute)]">FranchiseModel · by closr</p>
        <h1 className="h1-cinema mt-5 text-[var(--text)]">
          Финмодель, которую покупатель франшизы не&nbsp;<span className="text-gradient">закроет</span> на второй минуте
        </h1>

        <div className="relative mt-10 w-full max-w-2xl">
          {/* Рамка устройства */}
          <div className="glass overflow-hidden rounded-[18px] p-2">
            <video
              className="block w-full rounded-[12px]"
              src={asset('finmodel.mp4')}
              poster={asset('finmodel-poster.png')}
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
            />
          </div>
        </div>

        <p className="mono-label mt-9 text-[var(--text-mute)]">
          900+ городов · 7 налоговых режимов · P&amp;L на 24 месяца
        </p>

        <a
          href="#cta"
          className="cta-glass mt-8 inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold text-[var(--text)]"
        >
          Записаться на демо — 30 минут
        </a>
      </div>
    </section>
  )
}
