'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import Navbar                from '@/components/ui/Navbar'
import VideoIntro            from '@/components/sections/VideoIntro'
import HeroSection           from '@/components/sections/HeroSection'
import AboutSection          from '@/components/sections/AboutSection'
import ProjectsSection       from '@/components/sections/ProjectsSection'
import WorkExperienceSection from '@/components/sections/WorkExperienceSection'
import AchievementsSection   from '@/components/sections/AchievementsSection'
import PublicationsFooterSection from '@/components/sections/PublicationsFooterSection'
import ScreenLoader from '@/components/sections/ScreenLoader'
import profile               from '@/data/profile.json'

// Snap: 0=video 1=hero 2=about 3..4=projects 5=work-exp 6=achievements 7..8=publications+interstitial 9=footer
const PROJECT_SLIDES = profile.projects.length
const TOTAL          = 8 + PROJECT_SLIDES  // 10

export default function Home() {
  const mainRef        = useRef(null)
  const idxRef         = useRef(0)
  const busyRef        = useRef(false)
  const tweenRef       = useRef(null)
  const loopOverlayRef = useRef(null)
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    // Fade to black → instant scrollTop jump → fade in
    // Used whenever we loop footer → first section
    function fadeLoop(targetScrollTop, targetIdx) {
      busyRef.current = true
      tweenRef.current?.kill()
      gsap.to(loopOverlayRef.current, {
        opacity: 1,
        duration: 0.55,
        ease: 'power2.in',
        onComplete: () => {
          el.scrollTop    = targetScrollTop
          idxRef.current  = targetIdx
          gsap.to(loopOverlayRef.current, {
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
            delay: 0.05,
            onComplete: () => {
              setTimeout(() => { busyRef.current = false }, 300)
            },
          })
        },
      })
    }

    function goTo(idx) {
      // Wrap-around
      if (idx >= TOTAL) idx = 0
      if (idx < 0)      idx = TOTAL - 1

      if (idx === idxRef.current || busyRef.current) return

      // Footer → top: fade-cut instead of scrolling back through all sections
      if (idxRef.current === TOTAL - 1 && idx === 0) {
        fadeLoop(0, 0)
        return
      }

      // Top → footer: fade-cut instead of scrolling forward through all sections
      if (idxRef.current === 0 && idx === TOTAL - 1) {
        fadeLoop((TOTAL - 1) * window.innerHeight, TOTAL - 1)
        return
      }

      idxRef.current = idx
      busyRef.current = true
      tweenRef.current?.kill()
      tweenRef.current = gsap.to(el, {
        scrollTop: idx * window.innerHeight,
        duration: 1.0,
        ease: 'power3.inOut',
        onComplete: () => { setTimeout(() => { busyRef.current = false }, 600) },
      })
    }

    function onWheel(e) {
      const scrollable = e.target.closest('[data-scrollable="true"]')
      if (scrollable) {
        const isAtTop = scrollable.scrollTop <= 0
        const isAtBottom = Math.abs(scrollable.scrollHeight - scrollable.clientHeight - scrollable.scrollTop) < 2
        
        if (e.deltaY > 0 && !isAtBottom) return // Allow native scroll down
        if (e.deltaY < 0 && !isAtTop) return    // Allow native scroll up
      }

      e.preventDefault()
      if (busyRef.current) return
      goTo(idxRef.current + (e.deltaY > 0 ? 1 : -1))
    }

    let touchY = 0
    function onTouchStart(e) { touchY = e.touches[0].clientY }
    function onTouchEnd(e) {
      const dy = touchY - e.changedTouches[0].clientY
      if (Math.abs(dy) < 40 || busyRef.current) return
      goTo(idxRef.current + (dy > 0 ? 1 : -1))
    }

    function onScroll() {
      idxRef.current = Math.round(el.scrollTop / window.innerHeight)
    }

    // Footer video ends → same fade-cut loop back to top
    function onFooterLoop() {
      if (busyRef.current) return
      fadeLoop(0, 0)
    }

    function onKeyDown(e) {
      if (busyRef.current) return
      
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      const scrollable = e.target.closest('[data-scrollable="true"]')
      if (scrollable) {
        const isAtTop = scrollable.scrollTop <= 0
        const isAtBottom = Math.abs(scrollable.scrollHeight - scrollable.clientHeight - scrollable.scrollTop) < 2
        if (e.key === 'ArrowDown' && !isAtBottom) return
        if (e.key === 'ArrowUp' && !isAtTop) return
      }

      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault()
          goTo(idxRef.current + 1)
          break
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          goTo(idxRef.current - 1)
          break
        case ' ':
          e.preventDefault()
          goTo(idxRef.current + (e.shiftKey ? -1 : 1))
          break
        case 'Home':
          e.preventDefault()
          goTo(0)
          break
        case 'End':
          e.preventDefault()
          goTo(TOTAL - 1)
          break
      }
    }

    const isMobile = window.matchMedia('(max-width: 767px)').matches

    function onNavGoTo(e) {
      goTo(e.detail.idx)
    }

    el.addEventListener('wheel',  onWheel,  { passive: false })
    el.addEventListener('scroll', onScroll, { passive: true  })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('nav-go-to', onNavGoTo)

    let mTouchY = 0
    function onMobileTouchStart(e) { mTouchY = e.touches[0].clientY }
    function onMobileTouchEnd(e) {
      const dy = mTouchY - e.changedTouches[0].clientY
      if (Math.abs(dy) < 40) return
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8
      const atTop    = el.scrollTop < 8
      if (dy > 0 && atBottom) fadeLoop(0, 0)
      if (dy < 0 && atTop)    fadeLoop(el.scrollHeight - el.clientHeight, TOTAL - 1)
    }

    if (!isMobile) {
      el.addEventListener('touchstart', onTouchStart, { passive: true })
      el.addEventListener('touchend',   onTouchEnd,   { passive: true })
    } else {
      el.addEventListener('touchstart', onMobileTouchStart, { passive: true })
      el.addEventListener('touchend',   onMobileTouchEnd,   { passive: true })
    }
    window.addEventListener('footer-loop-back', onFooterLoop)

    return () => {
      el.removeEventListener('wheel',  onWheel)
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('nav-go-to', onNavGoTo)
      if (!isMobile) {
        el.removeEventListener('touchstart', onTouchStart)
        el.removeEventListener('touchend',   onTouchEnd)
      } else {
        el.removeEventListener('touchstart', onMobileTouchStart)
        el.removeEventListener('touchend',   onMobileTouchEnd)
      }
      window.removeEventListener('footer-loop-back', onFooterLoop)
      tweenRef.current?.kill()
    }
  }, [])

  return (
    <>
      {showLoader && (
        <ScreenLoader onDismiss={() => setShowLoader(false)} />
      )}

      {/* Full-screen fade overlay for seamless footer → top loop */}
      <div
        ref={loopOverlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#000',
          zIndex: 9999,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      <Navbar />
      <main ref={mainRef} style={{ height: '100vh', overflowY: 'scroll', overscrollBehavior: 'none' }}>
        <div>
          <VideoIntro />
          <HeroSection />
          <section id="about-anchor" style={{height:0,overflow:'hidden'}} />
          <AboutSection />
          <ProjectsSection />
          <section id="experience-anchor" style={{height:0,overflow:'hidden'}} />
          <WorkExperienceSection />
          <section id="achievements-anchor" style={{height:0,overflow:'hidden'}} />
          <AchievementsSection />
          <PublicationsFooterSection />
        </div>
      </main>
    </>
  )
}
