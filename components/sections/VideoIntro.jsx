'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import content from '@/data/content.json'
import styles from '@/styles/sections/VideoIntro.module.css'

const CinematicLayer = dynamic(() => import('@/components/three/CinematicLayer'), { ssr: false })

function scrollNext() {
  const main = document.querySelector('main')
  if (main) main.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
}

export default function VideoIntro() {
  const videoRef    = useRef(null)
  const greetRef    = useRef(null)
  const nameRef     = useRef(null)
  const roleRef     = useRef(null)
  const scrollRef   = useRef(null)
  const hintRef     = useRef(null)

  // muted state drives icon only - DOM muted property is controlled exclusively via ref
  const [muted,    setMuted]    = useState(true)
  const [playing,  setPlaying]  = useState(true)
  const [showHint, setShowHint] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 767px)').matches)
  }, [])

  // Entrance animation
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.4 })
    tl.fromTo(greetRef.current,  { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .fromTo(nameRef.current,   { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, '-=0.2')
      .fromTo(roleRef.current,   { opacity: 0, y:  20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .fromTo(scrollRef.current, { opacity: 0 },         { opacity: 1, duration: 0.5 }, '-=0.1')
    return () => tl.kill()
  }, [])

  // Video fade-in - no auto-unmute; user must click the button
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    // Guarantee muted on mount regardless of browser attribute handling
    v.muted = true
    const t = gsap.fromTo(v, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' })
    return () => t.kill()
  }, [])

  const playVideo = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = false
    v.play()
      .then(() => {
        setMuted(false)
      })
      .catch(() => {
        v.muted = true
        v.play()
          .then(() => {
            v.muted = false
            setMuted(false)
          })
          .catch(() => {
            v.muted = true
            setMuted(true)
          })
      })
  }

  // Unmute when screen loader is dismissed (fires inside user gesture - Safari safe)
  useEffect(() => {
    function onLoaderDismissed() {
      playVideo()
      dismissHint()
    }
    window.addEventListener('loader-dismissed', onLoaderDismissed)
    return () => window.removeEventListener('loader-dismissed', onLoaderDismissed)
  }, [])

  // Play video after shatter animation finishes
  useEffect(() => {
    function onAnimationDone() {
      playVideo()
    }
    window.addEventListener('loader-animation-done', onAnimationDone)
    return () => window.removeEventListener('loader-animation-done', onAnimationDone)
  }, [])

  // Auto-hide hint after 6 s
  useEffect(() => {
    if (!showHint) return
    const id = setTimeout(() => dismissHint(), 6000)
    return () => clearTimeout(id)
  }, [showHint])

  function dismissHint() {
    if (!hintRef.current) return
    gsap.to(hintRef.current, {
      opacity: 0, y: -8, duration: 0.35,
      onComplete: () => setShowHint(false),
    })
  }

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (playing) { v.pause(); setPlaying(false) }
    else         { v.play();  setPlaying(true)  }
  }

  function toggleMute() {
    if (showHint) dismissHint()
    const v = videoRef.current
    if (!v) return
    // Set DOM property synchronously inside click gesture - Safari requires this.
    // React never updates `v.muted` on re-renders (known React limitation for video),
    // so the static `muted` attr in JSX does not fight with this.
    v.muted = !v.muted
    setMuted(v.muted)
  }

  function handleEnded() {
    const main = document.querySelector('main')
    if (main && main.scrollTop < window.innerHeight * 0.4) scrollNext()
  }

  return (
    <section className={styles.section}>

      {/* 1 - Blurred ambient background */}
      <video
        src="/assets/about-me.mp4"
        autoPlay muted playsInline
        aria-hidden="true"
        className={styles.bgVideo}
      />

      {/* 2 - Main video: static `muted` attr so React never touches the DOM property on re-renders */}
      <video
        ref={videoRef}
        data-testid="intro-video"
        src="/assets/about-me.mp4"
        preload="auto"
        muted
        playsInline
        aria-label="Cinematic introduction video of Raja Mourya"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        className={styles.mainVideo}
      />

      {/* 3 - Cinematic gradient overlay */}
      <div className={styles.overlay} />

      {/* 4 - Three.js cinematic bokeh layer (desktop only) */}
      {!isMobile && <CinematicLayer />}

      {/* 5 - Landing text */}
      <div className={styles.heroContent}>
        <p ref={greetRef} className={styles.eyebrow}>{content.site.tagline}</p>
        <h1 ref={nameRef} className={styles.name}>
          {profile.name.first}<br />{profile.name.last}
        </h1>
        <p ref={roleRef} className={styles.role}>{profile.roles.detailed}</p>
      </div>

      {/* 6 - Paused overlay */}
      {!playing && (
        <button className={styles.playOverlay} onClick={togglePlay} aria-label="Play video">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="35" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
            <polygon points="29,20 56,36 29,52" fill="white" />
          </svg>
        </button>
      )}

      {/* 7 - Sound hint badge (auto-fades after 6 s) */}
      {showHint && (
        <div ref={hintRef} className={styles.soundHint} onClick={toggleMute}>
          <span className={styles.soundPulse} />
          <span>Tap for sound</span>
        </div>
      )}

      {/* 8 - Controls (bottom-right) */}
      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
          {playing
            ? /* Pause icon */
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <rect x="2" y="1" width="4" height="12" rx="1" />
                <rect x="8" y="1" width="4" height="12" rx="1" />
              </svg>
            : /* Play icon */
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <polygon points="2,1 13,7 2,13" />
              </svg>
          }
        </button>

        <button className={styles.ctrlBtn} onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted
            ? /* Muted icon */
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M2 5.5h2.5L8 3v10l-3.5-2.5H2V5.5z" fill="currentColor" stroke="none" />
                <line x1="10" y1="5" x2="14" y2="11" />
                <line x1="14" y1="5" x2="10" y2="11" />
              </svg>
            : /* Sound icon */
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M2 5.5h2.5L8 3v10l-3.5-2.5H2V5.5z" fill="currentColor" stroke="none" />
                <path d="M10.5 5.5C11.8 6.5 12.5 7.2 12.5 8s-.7 1.5-2 2.5" />
                <path d="M12 3.5C14 5 15 6.4 15 8s-1 3-3 4.5" />
              </svg>
          }
        </button>
      </div>

      {/* 9 - Scroll cue */}
      <button
        ref={scrollRef}
        className={styles.scrollCue}
        onClick={scrollNext}
        aria-label="Scroll to next section"
      >
        <span className={styles.scrollLabel}>Scroll</span>
        <span className={styles.scrollLine} />
      </button>

    </section>
  )
}
