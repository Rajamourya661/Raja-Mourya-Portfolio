'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/ScreenLoader.module.css'

export default function ScreenLoader({ onDismiss }) {
  const overlayRef = useRef(null)

  function handleStart() {
    window.dispatchEvent(
      new CustomEvent('loader-dismissed')
    )

    const overlay = overlayRef.current
    if (!overlay) return

    overlay.style.pointerEvents = 'none'

    // Create split layers
    const top = document.createElement('div')
    top.className = styles.splitTop

    const bottom = document.createElement('div')
    bottom.className = styles.splitBottom

    // Center line
    const line = document.createElement('div')
    line.className = styles.centerLine

    document.body.appendChild(top)
    document.body.appendChild(bottom)
    document.body.appendChild(line)

    // Hide original overlay fast
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.out',
    })

    // Animate line
    gsap.fromTo(
      line,
      {
        scaleX: 0,
        opacity: 0,
      },
      {
        scaleX: 1,
        opacity: 1,
        duration: 0.25,
        ease: 'power2.out',
      }
    )

    // Split animation
    gsap.to(top, {
      y: '-100%',
      duration: 1,
      ease: 'expo.inOut',
      force3D: true,
    })

    gsap.to(bottom, {
      y: '100%',
      duration: 1,
      ease: 'expo.inOut',
      force3D: true,
    })

    // Fade line away
    gsap.to(line, {
      opacity: 0,
      duration: 0.3,
      delay: 0.2,
    })

    setTimeout(() => {
      top.remove()
      bottom.remove()
      line.remove()

      window.dispatchEvent(
        new CustomEvent('loader-animation-done')
      )

      onDismiss()
    }, 1000)
  }

  return (
    <div ref={overlayRef} className={styles.overlay}>
      <div className={styles.liquidBg} aria-hidden />

      <p className={styles.monogram}>
        {profile.name.full.toUpperCase()}
      </p>

      <button
        className={styles.startBtn}
        onClick={handleStart}
      >
        Start
      </button>
    </div>
  )
}