import Hero from './components/Hero'

// Зернистость — статичный SVG-overlay (feTurbulence), не PNG.
function Grain() {
  return (
    <svg className="grain" aria-hidden="true">
      <filter id="grain-filter">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-filter)" />
    </svg>
  )
}

export default function App() {
  return (
    <div className="relative min-h-screen bg-[var(--navy)]">
      <Grain />
      <Hero />

      {/* Этап 1: только hero. Блоки 2–4 (Демо · Цена+Допы · FAQ+форма) — следующий деплой. */}
      <footer
        id="cta"
        className="relative flex min-h-[40vh] flex-col items-center justify-center gap-4 px-5 py-24 text-center"
      >
        <p className="mono-label text-[var(--text-mute)]">FranchiseModel · by closr</p>
        <p className="text-[var(--text-mute)]" style={{ fontSize: 'var(--body)' }}>
          Демо под вашу франшизу — 30 минут, под ваш город и нишу.
        </p>
      </footer>
    </div>
  )
}
