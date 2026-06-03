// Утилиты окружения для выбора 3D vs fallback.

export function hasWebGL(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isNarrow(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 768px)').matches
}

// Путь к публичному ассету с учётом base (gh-pages подпапка).
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL ?? '/'
  return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '')
}
