'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { FiArrowRight } from 'react-icons/fi'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/ResearchSection.module.css'

export default function ResearchSection() {
  const sectionRef = useRef(null)
  const contentRef = useRef(null)
  const research = profile.research[0] // We only have one paper right now

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const scroller = document.querySelector('main')
    if (!scroller) return

    let isActive = false
    let tl = null

    function playAnim() {
      if (tl) tl.kill()
      tl = gsap.timeline()
      
      // Reset state
      gsap.set(contentRef.current, { opacity: 0, y: 50 })
      
      // Animate in
      tl.to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out'
      })
    }

    function onScroll() {
      const inRange = Math.abs(scroller.scrollTop - section.offsetTop) < window.innerHeight * 0.5
      if (inRange && !isActive) {
        isActive = true
        playAnim()
      } else if (!inRange && isActive) {
        isActive = false
        gsap.set(contentRef.current, { opacity: 0, y: 50 })
      }
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      if (tl) tl.kill()
    }
  }, [])

  if (!research) return null

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.bgElements}>
        <div className={styles.glow} />
      </div>
      
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Academic Contributions</span>
          <h2 className={styles.title}>Publications</h2>
        </div>

        <div ref={contentRef} className={styles.card}>
          <div className={styles.meta}>
            <span className={styles.tag}>{research.platform}</span>
            <span className={styles.year}>{research.year}</span>
          </div>
          
          <h3 className={styles.paperTitle}>{research.title}</h3>
          <p className={styles.desc}>{research.desc}</p>
          
          <a 
            href={research.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.readBtn}
          >
            Read Paper <FiArrowRight />
          </a>
        </div>
      </div>
    </section>
  )
}
