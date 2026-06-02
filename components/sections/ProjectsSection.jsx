'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { FaGithub } from 'react-icons/fa'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/ProjectsSection.module.css'

const PROJECTS = profile.projects

export default function ProjectsSection() {
  const sectionRef  = useRef(null)
  const trackRef    = useRef(null)
  const contentRefs = useRef([])
  const bgRefs      = useRef([])
  const counterRef  = useRef(null)
  const progressRef = useRef(null)
  const [slideIdx, setSlideIdx] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    const track   = trackRef.current
    if (!section || !track) return

    const scroller = document.querySelector('main')
    if (!scroller) return
    const n = PROJECTS.length
    contentRefs.current = contentRefs.current.slice(0, n)
    bgRefs.current      = bgRefs.current.slice(0, n)

    // Slides 2+ hidden initially
    contentRefs.current.forEach((el, i) => {
      if (el && i > 0) gsap.set(el, { opacity: 0, y: 30 })
    })

    const tl = gsap.timeline({ paused: true })

    // Horizontal slide - xPercent is viewport-independent
    tl.to(track, {
      xPercent: -((n - 1) / n * 100),
      ease: 'none',
      duration: n - 1,
    }, 0)

    for (let i = 0; i < n - 1; i++) {
      const curr   = contentRefs.current[i]
      const next   = contentRefs.current[i + 1]
      const nextBg = bgRefs.current[i + 1]

      if (curr) {
        tl.to(curr, {
          opacity: 0, y: -40, filter: 'blur(6px)',
          duration: 0.2, ease: 'power2.in',
        }, i + 0.30)
      }

      if (nextBg) {
        tl.fromTo(nextBg,
          { scale: 1.04 },
          { scale: 1.0, duration: 1.0, ease: 'power2.out' },
          i
        )
      }

      if (next) {
        tl.set(next, { opacity: 1, y: 0 }, i + 0.44)

        const meta  = next.querySelector(`.${styles.meta}`)
        const title = next.querySelector(`.${styles.title}`)
        const sub   = next.querySelector(`.${styles.subtitle}`)
        const desc  = next.querySelector(`.${styles.desc}`)
        const tags  = next.querySelectorAll(`.${styles.tag}`)
        const btn   = next.querySelector(`.${styles.liveBtn}`)

        if (meta)  tl.fromTo(meta,  { x: -10, opacity: 0 }, { x: 0, opacity: 1, duration: 0.25, ease: 'power2.out' }, i + 0.45)
        if (title) tl.fromTo(title, { opacity: 0, y: 20 },  { opacity: 1, y: 0, duration: 0.45, ease: 'expo.out'   }, i + 0.48)
        if (sub)   tl.fromTo(sub,   { y: 12, opacity: 0 },  { y: 0, opacity: 1, duration: 0.30, ease: 'power2.out' }, i + 0.54)
        if (desc)  tl.fromTo(desc,  { y: 10, opacity: 0 },  { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, i + 0.58)
        if (tags.length) {
          tl.fromTo(tags,  { y: 6, opacity: 0 },  { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out', stagger: 0.03 }, i + 0.65)
        }
        if (btn)   tl.fromTo(btn,   { y: 8, opacity: 0 },  { y: 0, opacity: 1, duration: 0.30, ease: 'power2.out' }, i + 0.72)
      }
    }

    const st = ScrollTrigger.create({
      trigger:  section,
      scroller,
      start:    'top top',
      end:      () => `+=${(n - 1) * window.innerHeight}`,
      onUpdate: (self) => {
        tl.progress(self.progress)

        const activeIdx = Math.round(self.progress * (n - 1))
        setSlideIdx(prev => prev !== activeIdx ? activeIdx : prev)

        if (progressRef.current) {
          gsap.set(progressRef.current, {
            scaleX: self.progress, transformOrigin: 'left center', overwrite: true,
          })
        }

        if (counterRef.current) counterRef.current.textContent = `0${activeIdx + 1}`
      },
    })

    return () => st.kill()
  }, [])

  return (
    <div style={{ height: `${PROJECTS.length * 100}vh` }}>
      <section ref={sectionRef} className={styles.section}>

        {/* Top bar */}
        <div className={styles.topBar}>
          <span className={styles.sectionLabel}>Projects</span>
          <div className={styles.counter}>
            <span ref={counterRef} className={styles.cCur}>01</span>
            <span className={styles.cSep}> / </span>
            <span className={styles.cTot}>0{PROJECTS.length}</span>
          </div>
        </div>

        {/* Horizontal track */}
        <div
          ref={trackRef}
          className={styles.track}
          style={{ width: `${PROJECTS.length * 100}vw` }}
        >
          {PROJECTS.map((proj, i) => (
            <div key={proj.id} className={styles.slide}>

              <div
                ref={el => { bgRefs.current[i] = el }}
                className={styles.slideBg}
              >
                <Image
                  src={proj.image}
                  alt={proj.title}
                  fill
                  quality={100}
                  sizes="100vw"
                  className={styles.slideImg}
                  priority={i === 0}
                />
                <div className={styles.slideOverlayLeft}   aria-hidden />
                <div className={styles.slideOverlayBottom} aria-hidden />
                <div className={styles.slideVignette}      aria-hidden />
              </div>

              <span className={styles.slideNum} aria-hidden>0{i + 1}</span>

              <div
                ref={el => { contentRefs.current[i] = el }}
                className={styles.slideContent}
              >
                <div className={styles.slideLeft}>
                  <div className={styles.meta}>
                    <span className={styles.typeTag}>{proj.type}</span>
                  </div>
                  <h2 className={styles.title}>{proj.title}</h2>
                  <p  className={styles.subtitle}>{proj.subtitle}</p>
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.liveBtn}
                  >
                    <FaGithub size={12} aria-hidden="true" />
                    <span>View on GitHub</span>
                  </a>
                </div>

                <div className={styles.slideRight}>
                  <p className={styles.desc}>{proj.desc}</p>
                  <div className={styles.stack}>
                    {proj.tech.map(t => (
                      <span key={t} className={styles.tag}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className={styles.bottomUI}>
          <div className={styles.progressTrack}>
            <div ref={progressRef} className={styles.progressBar} />
          </div>
        </div>

      </section>
    </div>
  )
}
