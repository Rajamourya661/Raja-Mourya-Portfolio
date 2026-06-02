'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import styles from '@/styles/threeStyles.module.css'

const COUNT  = 140
const ACCENT = new THREE.Color(0xf7931e)

export default function WorkExpParticles({ slideIdx }) {
  const mountRef  = useRef(null)
  const stateRef  = useRef({})

  // Boot Three.js once
  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const W = el.clientWidth  || window.innerWidth
    const H = el.clientHeight || window.innerHeight

    const scene    = new THREE.Scene()
    const camera   = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 0.1, 100)
    camera.position.z = 10

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    // Positions & velocities
    const positions  = new Float32Array(COUNT * 3)
    const velocities = []
    const sizes      = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * W
      positions[i * 3 + 1] = (Math.random() - 0.5) * H
      positions[i * 3 + 2] = 0
      velocities.push({
        x: (Math.random() - 0.5) * 0.35,
        y: Math.random() * 0.3 + 0.08,  // slight upward drift
      })
      sizes[i] = Math.random() * 2.5 + 1
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.PointsMaterial({
      color:        ACCENT,
      size:         2.2,
      transparent:  true,
      opacity:      0.3,
      sizeAttenuation: false,
      depthWrite:   false,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    const MAX_LINES = 60
    const linePositions = new Float32Array(MAX_LINES * 6)
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    lineGeo.setDrawRange(0, 0)
    const lineMat = new THREE.LineBasicMaterial({
      color:       ACCENT,
      transparent: true,
      opacity:     0.07,
    })
    const lineSegs = new THREE.LineSegments(lineGeo, lineMat)
    scene.add(lineSegs)

    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)

      const pos = geometry.attributes.position.array
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3]     += velocities[i].x
        pos[i * 3 + 1] += velocities[i].y

        // Wrap
        if (pos[i * 3]     >  W / 2) pos[i * 3]     = -W / 2
        if (pos[i * 3]     < -W / 2) pos[i * 3]     =  W / 2
        if (pos[i * 3 + 1] >  H / 2) pos[i * 3 + 1] = -H / 2
        if (pos[i * 3 + 1] < -H / 2) pos[i * 3 + 1] =  H / 2
      }
      geometry.attributes.position.needsUpdate = true

      const LINK_DIST = 80
      let lc = 0
      outer: for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = pos[i * 3] - pos[j * 3]
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
          if (dx * dx + dy * dy < LINK_DIST * LINK_DIST) {
            linePositions[lc * 6]     = pos[i * 3]
            linePositions[lc * 6 + 1] = pos[i * 3 + 1]
            linePositions[lc * 6 + 2] = 0
            linePositions[lc * 6 + 3] = pos[j * 3]
            linePositions[lc * 6 + 4] = pos[j * 3 + 1]
            linePositions[lc * 6 + 5] = 0
            if (++lc >= MAX_LINES) break outer
          }
        }
      }
      lineGeo.attributes.position.needsUpdate = true
      lineGeo.setDrawRange(0, lc * 2)

      renderer.render(scene, camera)
    }
    animate()

    stateRef.current = { geometry, material, velocities, renderer, scene, lineMat }

    const onResize = () => {
      const w = el.clientWidth || window.innerWidth
      const h = el.clientHeight || window.innerHeight
      camera.left   = -w / 2; camera.right  =  w / 2
      camera.top    =  h / 2; camera.bottom = -h / 2
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      geometry.dispose()
      material.dispose()
      lineGeo.dispose()
      lineMat.dispose()
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  // Burst particles on slide change
  useEffect(() => {
    const { velocities } = stateRef.current
    if (!velocities) return

    for (let i = 0; i < COUNT; i++) {
      velocities[i].x = (Math.random() - 0.5) * 2.5
      velocities[i].y = (Math.random() - 0.5) * 2.5 + 0.8
    }
    const t = setTimeout(() => {
      for (let i = 0; i < COUNT; i++) {
        velocities[i].x *= 0.2
        velocities[i].y  = Math.random() * 0.3 + 0.08
      }
    }, 550)
    return () => clearTimeout(t)
  }, [slideIdx])

  return (
    <div
      ref={mountRef}
      className={styles.workExpParticles}
    />
  )
}
