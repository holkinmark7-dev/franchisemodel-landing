import type { RefObject } from 'react'
import { asset } from '../lib/env'

type Props = {
  videoRef?: RefObject<HTMLVideoElement | null>
  wakeRef?: RefObject<HTMLDivElement | null>
  sweepRef?: RefObject<HTMLDivElement | null>
  autoPlay?: boolean
}

// Рафинированная рамка-экран (экран + тонкий бевел, как product-шоты Apple/Stripe).
// НЕ имитация корпуса ноутбука. Видео маскируется точно по экрану (object-fit cover, без полей).
export default function Device({ videoRef, wakeRef, sweepRef, autoPlay = false }: Props) {
  return (
    <div className="device">
      <div className="device-bezel">
        <span className="device-cam" aria-hidden />
        <div className="device-screen">
          <video
            ref={videoRef}
            className="device-video"
            src={asset('finmodel.mp4')}
            poster={asset('finmodel-poster.png')}
            muted
            loop
            playsInline
            preload="metadata"
            autoPlay={autoPlay}
          />
          {/* Пробуждение экрана: тёмный слой, opacity 1→0 на скролле */}
          <div ref={wakeRef} className="device-wake" aria-hidden />
          {/* Деликатное стеклянное отражение (мягкий градиент) */}
          <div className="device-reflection" aria-hidden />
          {/* Один мягкий световой свип */}
          <div ref={sweepRef} className="device-sweep" aria-hidden />
        </div>
      </div>
    </div>
  )
}
