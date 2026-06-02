'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import styles from '@/styles/threeStyles.module.css'

function makeSprite() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0,   'rgba(255,255,255,1)')
  g.addColorStop(0.35,'rgba(255,255,255,0.7)')
  g.addColorStop(1,   'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

// Warm whites + cream - stand out against hero's orange gradient
const PALETTE = [
  new THREE.Color('#ffffff'),
  new THREE.Color('#fff9f0'),
  new THREE.Color('#ffe8cc'),
  new THREE.Color('#ffd4a0'),
]

function randColor() {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)]
}

export default function HeroBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let W = mount.clientWidth
    let H = mount.clientHeight

    // ── Renderer ─────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.domElement.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;'
    mount.appendChild(renderer.domElement)

    // ── Camera ───────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200)
    camera.position.z = 9

    // ── Scene ────────────────────────────────────────────
    const scene = new THREE.Scene()
    const tex = makeSprite()

    // ── Layer 1: tiny fast drifters ───────────────────────
    const N1   = 65
    const p1   = new Float32Array(N1 * 3)
    const c1   = new Float32Array(N1 * 3)
    const spd1 = new Float32Array(N1)
    const off1 = new Float32Array(N1)

    for (let i = 0; i < N1; i++) {
      p1[i*3]   = (Math.random() - 0.5) * 18
      p1[i*3+1] = (Math.random() - 0.5) * 11
      p1[i*3+2] = (Math.random() - 0.5) * 5
      const col = randColor()
      c1[i*3] = col.r;  c1[i*3+1] = col.g;  c1[i*3+2] = col.b
      spd1[i] = Math.random() * 0.45 + 0.12
      off1[i] = Math.random() * Math.PI * 2
    }

    const g1 = new THREE.BufferGeometry()
    g1.setAttribute('position', new THREE.BufferAttribute(p1, 3))
    g1.setAttribute('color',    new THREE.BufferAttribute(c1, 3))

    const m1 = new THREE.PointsMaterial({
      size: 0.07, map: tex, vertexColors: true,
      transparent: true, opacity: 0.7,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    })
    const pts1 = new THREE.Points(g1, m1)
    scene.add(pts1)

    // ── Layer 2: large soft bokeh blobs ───────────────────
    const N2   = 22
    const p2   = new Float32Array(N2 * 3)
    const c2   = new Float32Array(N2 * 3)
    const spd2 = new Float32Array(N2)
    const off2 = new Float32Array(N2)

    for (let i = 0; i < N2; i++) {
      p2[i*3]   = (Math.random() - 0.5) * 16
      p2[i*3+1] = (Math.random() - 0.5) * 10
      p2[i*3+2] = (Math.random() - 0.5) * 3 - 3
      const col = randColor()
      c2[i*3] = col.r;  c2[i*3+1] = col.g;  c2[i*3+2] = col.b
      spd2[i] = Math.random() * 0.18 + 0.05
      off2[i] = Math.random() * Math.PI * 2
    }

    const g2 = new THREE.BufferGeometry()
    g2.setAttribute('position', new THREE.BufferAttribute(p2, 3))
    g2.setAttribute('color',    new THREE.BufferAttribute(c2, 3))

    const m2 = new THREE.PointsMaterial({
      size: 0.55, map: tex, vertexColors: true,
      transparent: true, opacity: 0.15,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    })
    const pts2 = new THREE.Points(g2, m2)
    scene.add(pts2)

    // ── Mouse parallax ────────────────────────────────────
    const mouse = { x: 0, y: 0 }
    const cam   = { x: 0, y: 0 }

    function onMove(e) {
      const r = mount.getBoundingClientRect()
      mouse.x =  ((e.clientX - r.left) / r.width  - 0.5) * 2
      mouse.y = -((e.clientY - r.top)  / r.height - 0.5) * 2
    }
    const section = mount.parentElement
    section?.addEventListener('mousemove', onMove)

    // ── Timer ─────────────────────────────────────────────
    const timer = new THREE.Timer()
    timer.update(performance.now())

    // ── RAF ───────────────────────────────────────────────
    let raf
    function tick() {
      raf = requestAnimationFrame(tick)
      timer.update(performance.now())
      const dt      = Math.min(timer.getDelta(), 0.05)   // cap for tab-switch spikes
      const elapsed = timer.getElapsed()

      // Camera mouse parallax - gentle, layer-like depth
      cam.x += (mouse.x * 0.55 - cam.x) * 0.05
      cam.y += (mouse.y * 0.32 - cam.y) * 0.05
      camera.position.x = cam.x
      camera.position.y = cam.y

      // Drift layer 1 (faster, smaller)
      for (let i = 0; i < N1; i++) {
        p1[i*3+1] += spd1[i] * dt * 0.75
        p1[i*3]   += Math.sin(elapsed * spd1[i] * 0.7 + off1[i]) * dt * 0.12
        if (p1[i*3+1] > 6)  p1[i*3+1] = -6
      }
      g1.attributes.position.needsUpdate = true

      // Drift layer 2 (slower, larger blobs)
      for (let i = 0; i < N2; i++) {
        p2[i*3+1] += spd2[i] * dt * 0.55
        p2[i*3]   += Math.sin(elapsed * spd2[i] * 0.5 + off2[i]) * dt * 0.09
        if (p2[i*3+1] > 6)  p2[i*3+1] = -6
      }
      g2.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }
    tick()

    // ── Resize ────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      W = mount.clientWidth;  H = mount.clientHeight
      camera.aspect = W / H
      camera.updateProjectionMatrix()
      renderer.setSize(W, H)
    })
    ro.observe(mount)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      section?.removeEventListener('mousemove', onMove)
      g1.dispose(); g2.dispose()
      m1.dispose(); m2.dispose()
      tex.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className={styles.heroBg}
    />
  )
}
