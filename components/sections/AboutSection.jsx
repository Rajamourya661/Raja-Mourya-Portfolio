'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { FaGithub, FaLinkedinIn, FaMedium, FaInstagram, FaYoutube } from 'react-icons/fa'
import { FiTarget, FiShield } from 'react-icons/fi'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/AboutSection.module.css'

const BIO      = profile.bio
const WHO_ITEMS = profile.skills

const ICON_MAP = {
  GitHub: FaGithub,
  LinkedIn: FaLinkedinIn,
  Medium: FaMedium,
  Instagram: FaInstagram,
  YouTube: FaYoutube,
  TryHackMe: FiTarget,
  HackTheBox: FiShield,
}

const SOCIALS = profile.socials
  .map(s => ({ Icon: ICON_MAP[s.label], href: s.href, label: s.label }))
  .filter(s => s.Icon)

export default function AboutSection() {
  const sectionRef  = useRef(null)
  const photoRef    = useRef(null)
  const contentRef  = useRef(null)
  const socialsRef  = useRef(null)
  const intervalRef = useRef(null)

  const [typed, setTyped] = useState(0)
  const [done,  setDone]  = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const scroller = document.querySelector('main')
    if (!scroller) return

    let isActive = false

    function resetAnim() {
      clearInterval(intervalRef.current)
      gsap.killTweensOf(photoRef.current)
      gsap.killTweensOf(contentRef.current)
      const socialIcons = socialsRef.current?.querySelectorAll('a') ?? []
      gsap.killTweensOf(socialIcons)
      gsap.set(photoRef.current,   { opacity: 0, x: -50 })
      gsap.set(contentRef.current, { opacity: 0, y:  40 })
      gsap.set(socialIcons, { opacity: 0, y: 20 })
      setTyped(0)
      setDone(false)
    }

    function playAnim() {
      resetAnim()
      gsap.to(photoRef.current,   { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' })
      gsap.to(contentRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.15 })
      const socialIcons = socialsRef.current?.querySelectorAll('a') ?? []
      gsap.to(socialIcons, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1, delay: 0.5 })

      let i = 0
      intervalRef.current = setInterval(() => {
        i = Math.min(i + 6, BIO.length)
        setTyped(i)
        if (i >= BIO.length) {
          clearInterval(intervalRef.current)
          setDone(true)
        }
      }, 16)
    }

    resetAnim()

    let hasPlayed = false

    function onScroll() {
      const inRange = Math.abs(scroller.scrollTop - section.offsetTop) < window.innerHeight * 0.5
      if (inRange && !isActive && !hasPlayed)  { isActive = true; hasPlayed = true; playAnim() }
      if (!inRange && isActive)  { isActive = false }
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearInterval(intervalRef.current)
      scroller.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.section}>

      {/* ── Left: photo + signature + socials ───────── */}
      <div ref={photoRef} className={styles.photoCol}>
        <div className={styles.photoWrap}>
          <div className={styles.photoFrame} data-about-photo>
            <Image
              src="/assets/about.png"
              alt={profile.name.full}
              fill
              quality={100}
              sizes="(min-width: 768px) 30vw, 100vw"
              className={styles.photoImg}
            />
          </div>
        </div>

        {/* Social icons */}
        <div ref={socialsRef} className={styles.socials}>
          {SOCIALS.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={styles.socialLink}
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>

      {/* ── Right: content ───────────────────────────── */}
      <div ref={contentRef} className={styles.content}>

        {/* Who I Am - label + infinite marquee */}
        <p className={styles.whoLabel}>Who I Am</p>
        <div className={styles.marqueeWrap}>
          <div className={styles.marqueeTrack}>
            {[...WHO_ITEMS, ...WHO_ITEMS].map((item, i) => (
              <span key={i} className={styles.marqueeItem}>
                {item}
                <span className={styles.marqueeDot}>·</span>
              </span>
            ))}
          </div>
        </div>

        {/* Bio text - typewriter: all chars always in DOM, only color changes */}
        <div className={styles.bioWrap}>
          <p className={styles.bio}>
            {BIO.split('').map((char, i) => (
              <span
                key={i}
                className={
                  i < typed
                    ? (i === typed - 1 && !done ? styles.lastTyped : styles.typed)
                    : styles.untyped
                }
              >
                {char}
              </span>
            ))}
          </p>
        </div>

      </div>
    </section>
  )
}
