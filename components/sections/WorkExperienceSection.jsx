'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/WorkExperienceSection.module.css'

const WorkExpParticles = dynamic(() => import('@/components/three/WorkExpParticles'), { ssr: false })

const EXPS = profile.experience

export default function WorkExperienceSection() {
  const sectionRef        = useRef(null)
  const lineRef           = useRef(null)
  const dotRefs           = useRef([])
  const cardRefs          = useRef([])
  const tlRef             = useRef(null)
  const bulletListRefs    = useRef([])
  const collapsedHeights  = useRef([])
  const hoverTlsRef       = useRef([])

  // Capture each bullet list's natural collapsed height after first paint
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      bulletListRefs.current.forEach((ul, i) => {
        if (ul) collapsedHeights.current[i] = ul.clientHeight
      })
    })
    return () => cancelAnimationFrame(id)
  }, [])

  function handleCardEnter(i) {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return
    const ul  = bulletListRefs.current[i]
    const dot = dotRefs.current[i]
    if (!ul) return
    hoverTlsRef.current[i]?.kill()
    const tl = gsap.timeline()
    hoverTlsRef.current[i] = tl
    tl.to(ul,  { maxHeight: ul.scrollHeight, duration: 0.5, ease: 'power2.out' }, 0)
      .to(ul,  { borderLeftColor: 'rgba(247,147,30,0.6)', duration: 0.3 }, 0)
      .to(dot, { scale: 1.1, boxShadow: '0 0 0 8px rgba(247,147,30,0.12), 0 0 28px rgba(247,147,30,0.22)', duration: 0.3, ease: 'back.out(2)' }, 0)
  }

  function handleCardLeave(i) {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return
    const ul  = bulletListRefs.current[i]
    const dot = dotRefs.current[i]
    if (!ul) return
    hoverTlsRef.current[i]?.kill()
    const collapsed = collapsedHeights.current[i] ?? 80
    const tl = gsap.timeline()
    hoverTlsRef.current[i] = tl
    tl.to(ul,  { maxHeight: collapsed, duration: 0.35, ease: 'power2.in' }, 0)
      .to(ul,  { borderLeftColor: 'rgba(247,147,30,0.2)', duration: 0.25 }, 0)
      .to(dot, { scale: 1, boxShadow: '0 0 0 6px rgba(247,147,30,0.05), 0 0 22px rgba(247,147,30,0.1)', duration: 0.25, ease: 'power2.in' }, 0)
  }

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !lineRef.current) return

    const scroller = document.querySelector('main')
    if (!scroller) return

    let isActive = false

    function resetAnim() {
      tlRef.current?.kill()
      gsap.set(lineRef.current,      { scaleX: 0, transformOrigin: 'left center' })
      dotRefs.current.forEach(el  => el && gsap.set(el,  { scale: 0, opacity: 0 }))
      cardRefs.current.forEach(el => el && gsap.set(el, { opacity: 0, y: 28 }))
    }

    function playAnim() {
      resetAnim()
      const n  = EXPS.length
      const tl = gsap.timeline()
      tlRef.current = tl
      tl.to(lineRef.current, { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0)
      EXPS.forEach((_, i) => {
        const t = i === 0 ? 0.08 : 0.08 + (i / (n - 1)) * 1.44
        tl.to(dotRefs.current[i],  { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }, t)
        tl.to(cardRefs.current[i], { opacity: 1, y: 0,    duration: 0.6, ease: 'power3.out'  }, t + 0.14)
      })
    }

    resetAnim()

    function onScroll() {
      const inRange = Math.abs(scroller.scrollTop - section.offsetTop) < window.innerHeight * 0.5
      if (inRange && !isActive)  { isActive = true;  playAnim() }
      if (!inRange && isActive)  { isActive = false; resetAnim() }
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => scroller.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section ref={sectionRef} id="experience" className={styles.section}>

      <div className={styles.bgImg} aria-hidden>
        <Image
          src="/assets/work-experience.png"
          alt=""
          fill
          quality={100}
          sizes="100vw"
          className={styles.bgImgEl}
        />
      </div>

      <WorkExpParticles />

      <div className={styles.header}>
        <span className={styles.label}>Work Experience</span>
        <span className={styles.labelRight}>0{EXPS.length} Companies</span>
      </div>

      <div className={styles.timeline}>
        <div className={styles.timelineBody}>

          {/* Snake connector */}
          <div ref={lineRef} className={styles.snakeLine} />

          {/* Entry columns */}
          <div className={styles.entries}>
            {EXPS.map((exp, i) => (
              <div
                key={exp.id}
                className={styles.entry}
                onMouseEnter={() => handleCardEnter(i)}
                onMouseLeave={() => handleCardLeave(i)}
              >

                <div
                  ref={el => { dotRefs.current[i] = el }}
                  className={styles.dot}
                >
                  <span className={styles.dotNum}>0{i + 1}</span>
                </div>

                <div
                  ref={el => { cardRefs.current[i] = el }}
                  className={styles.card}
                >
                  <div className={styles.cardHead}>
                    <span className={styles.period}>{exp.period} – {exp.periodEnd}</span>
                    <span className={styles.typeTag}>{exp.type}</span>
                    {exp.location && <span className={styles.location}>{exp.location}</span>}
                  </div>
                  <h2 className={styles.company}>{exp.company}</h2>
                  <p  className={styles.role}>{exp.role}</p>
                  <ul
                    ref={el => { bulletListRefs.current[i] = el }}
                    className={styles.bullets}
                  >
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} className={styles.bullet}>{b}</li>
                    ))}
                  </ul>
                  <div className={styles.stack}>
                    {exp.tech.map(t => (
                      <span key={t} className={styles.tag}>{t}</span>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>

    </section>
  )
}
