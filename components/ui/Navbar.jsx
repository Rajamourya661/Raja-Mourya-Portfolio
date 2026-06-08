'use client'

import { useEffect, useRef, useState } from 'react'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import styles from '@/styles/ui/Navbar.module.css'
import { FaBars, FaTimes } from 'react-icons/fa'

const PROJECT_SLIDES = profile.projects.length
const HAS_RESEARCH   = profile.research && profile.research.length > 0
const ABOUT_SLIDES   = 1

const NAV_ITEMS = [
  { label: 'Home', idx: 0 },
  { label: 'About', idx: 2 },
  { label: 'Projects', idx: 3 + ABOUT_SLIDES },
  { label: 'Experience', idx: 3 + ABOUT_SLIDES + PROJECT_SLIDES },
  { label: 'Achievements', idx: 4 + ABOUT_SLIDES + PROJECT_SLIDES },
  ...(HAS_RESEARCH ? [{ label: 'Research', idx: 5 + ABOUT_SLIDES + PROJECT_SLIDES }] : []),
  { label: 'Certifications', idx: 5 + ABOUT_SLIDES + (HAS_RESEARCH ? 1 : 0) + PROJECT_SLIDES },
  { label: 'Contact', idx: 7 + ABOUT_SLIDES + (HAS_RESEARCH ? 1 : 0) + PROJECT_SLIDES },
]

function getIST() {
  return new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).toUpperCase()
}

export default function Navbar() {
  const [time, setTime] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [onIntro, setOnIntro] = useState(true)
  const [onDark, setOnDark] = useState(false)

  const headerRef = useRef(null)
  const lastY = useRef(0)

  useEffect(() => {
    setTime(getIST())
    const id = setInterval(() => setTime(getIST()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const scroller = document.querySelector('main')
    if (!scroller) return

    const onScroll = () => {
      const currentY = scroller.scrollTop
      const sectionIdx = Math.round(currentY / window.innerHeight)

      setOnIntro(currentY < window.innerHeight * 0.8)
      setOnDark(sectionIdx >= 3)

      lastY.current = currentY
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      scroller.removeEventListener('scroll', onScroll)
    }
  }, [])

  const handleNavigate = (idx) => {
    window.dispatchEvent(new CustomEvent('nav-go-to', { detail: { idx } }))
    setMenuOpen(false)
  }

  return (
    <>
      <header
        ref={headerRef}
        className={`${styles.header} ${onIntro ? styles.introMode : ''} ${
          onDark ? styles.darkMode : ''
        }`}
      >
        <span className={styles.time}>
          INDIA TIME - {time}
        </span>

        <NavigationMenu className={styles.navMenu}>
          <NavigationMenuList className="flex gap-6">
            {NAV_ITEMS.map((item) => (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuLink
                  className={styles.navLink}
                  onClick={() => handleNavigate(item.idx)}
                >
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-3">
          <a
            href="/assets/Raja_Mourya_Cybersecurity_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.emailBtn} rounded-full text-xs font-semibold px-5 h-8`}
          >
            Resume
          </a>

          <a
            href={`mailto:${profile.email}`}
            className={`${styles.emailBtn} rounded-full text-xs font-semibold px-5 h-8`}
          >
            Email me
          </a>
        </div>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </header>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={styles.mobileNavLink}
              onClick={() => handleNavigate(item.idx)}
            >
              {item.label}
            </button>
          ))}

          <a
            href={`mailto:${profile.email}`}
            className={styles.mobileMailLink}
          >
            {profile.email}
          </a>
        </div>
      )}
    </>
  )
}