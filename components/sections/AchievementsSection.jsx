'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/AchievementsSection.module.css'

export default function AchievementsSection() {
  const sectionRef = useRef(null)
  const contentRef = useRef(null)
  const cardsRef = useRef([])

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
      gsap.set(contentRef.current, { opacity: 0, y: 30 })
      cardsRef.current.forEach(card => {
        if (card) gsap.set(card, { opacity: 0, y: 50 })
      })
      
      // Animate in
      tl.to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
      })
      
      cardsRef.current.forEach((card, i) => {
        if (card) {
          tl.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out'
          }, `-=0.5`) // overlap
        }
      })
    }

    function onScroll() {
      const inRange = Math.abs(scroller.scrollTop - section.offsetTop) < window.innerHeight * 0.5
      if (inRange && !isActive) {
        isActive = true
        playAnim()
      } else if (!inRange && isActive) {
        isActive = false
        // Fade out slightly when leaving
        gsap.to([contentRef.current, ...cardsRef.current.filter(Boolean)], { 
          opacity: 0, 
          y: 20, 
          duration: 0.4 
        })
      }
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      if (tl) tl.kill()
    }
  }, [])

  if (!profile.achievements || profile.achievements.length === 0) return null

  return (
    <section ref={sectionRef} id="achievements" className={styles.section}>
      <div className={styles.bgElements}>
        <div className={styles.glow} />
      </div>
      
      <div className={styles.container}>
        <div ref={contentRef} className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Hall of Fame</span>
          <h2 className={styles.title}>Achievements</h2>
          <p className={styles.headerDesc}>
            A showcase of my competitive cybersecurity rankings, CTF podium finishes, and national hackathon achievements.
          </p>
        </div>

        <div className={styles.grid} data-scrollable="true">
          {profile.achievements.map((item, i) => (
            <div 
              key={item.id} 
              className={styles.card}
              ref={el => { cardsRef.current[i] = el }}
            >
              {item.image && (
                <div className={styles.imageWrapper}>
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill 
                    className={styles.image}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <span className={styles.platform}>{item.platform}</span>
                  {profile.socials.find(s => s.label.toLowerCase() === item.platform.toLowerCase()) && (
                    <a 
                      href={profile.socials.find(s => s.label.toLowerCase() === item.platform.toLowerCase()).href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.verifyLink}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Verify Page →
                    </a>
                  )}
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.desc}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
