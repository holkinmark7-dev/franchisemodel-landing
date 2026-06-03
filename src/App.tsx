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

function TopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-[60] flex items-center justify-between px-5 py-3.5 sm:px-8">
      <span className="text-[15px] font-bold tracking-[-0.02em] text-[var(--text)]">
        closr<span className="text-[var(--accent)]">.</span>
      </span>
      <a
        href="#cta"
        className="cta-glass inline-flex items-center px-4 py-2 text-[12.5px] font-semibold text-[var(--text)]"
      >
        Демо
      </a>
    </header>
  )
}

export default function App() {
  return (
    <div className="relative min-h-screen bg-[var(--navy)]">
      <Grain />
      <TopBar />
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
